from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import math
import os

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "healthcare.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in miles between two coordinates"""
    R = 3959  # Earth radius in miles
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def compute_value_score(cash_price, national_avg, quality_score, distance_miles,
                         price_weight=0.4, quality_weight=0.4, distance_weight=0.2):
    # Price score: 100 if at national avg, higher if cheaper, lower if more expensive
    price_ratio = national_avg / max(cash_price, 1)
    price_score = min(100, max(0, price_ratio * 100))

    # Quality score: direct (already 0-100)
    quality_component = quality_score

    # Distance score: 100 at 0 miles, 0 at 50+ miles
    distance_score = max(0, 100 - distance_miles * 1.5)

    total = (price_score * price_weight +
             quality_component * quality_weight +
             distance_score * distance_weight)

    return round(min(100, max(0, total)), 1)

@app.route("/api/procedures", methods=["GET"])
def get_procedures():
    conn = get_db()
    rows = conn.execute("SELECT * FROM procedures ORDER BY category, name").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/search", methods=["GET"])
def search_hospitals():
    """Main search endpoint: lat, lon, procedure_id, radius_miles, price_w, quality_w, distance_w"""
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    procedure_id = request.args.get("procedure_id", type=int)
    radius = request.args.get("radius", 50, type=float)
    price_w = request.args.get("price_w", 0.4, type=float)
    quality_w = request.args.get("quality_w", 0.4, type=float)
    distance_w = request.args.get("distance_w", 0.2, type=float)

    if not all([lat, lon, procedure_id]):
        return jsonify({"error": "lat, lon, and procedure_id are required"}), 400

    conn = get_db()

    # Get procedure national avg
    proc = conn.execute("SELECT * FROM procedures WHERE id=?", (procedure_id,)).fetchone()
    if not proc:
        return jsonify({"error": "Procedure not found"}), 404

    national_avg_cash = proc["national_avg_cash"]

    # Get all hospitals with their prices for this procedure
    rows = conn.execute("""
        SELECT h.*, p.cash_price, p.insurance_price, p.min_negotiated, p.max_negotiated
        FROM hospitals h
        JOIN prices p ON h.id = p.hospital_id
        WHERE p.procedure_id = ?
    """, (procedure_id,)).fetchall()
    conn.close()

    results = []
    for row in rows:
        dist = haversine_distance(lat, lon, row["lat"], row["lon"])
        if dist > radius:
            continue

        value_score = compute_value_score(
            row["cash_price"], national_avg_cash,
            row["quality_score"], dist,
            price_w, quality_w, distance_w
        )

        overcharge_pct = round(((row["cash_price"] - national_avg_cash) / national_avg_cash) * 100, 1)

        results.append({
            "id": row["id"],
            "name": row["name"],
            "city": row["city"],
            "state": row["state"],
            "lat": row["lat"],
            "lon": row["lon"],
            "quality_score": row["quality_score"],
            "is_academic": bool(row["is_academic"]),
            "is_safety_net": bool(row["is_safety_net"]),
            "cash_price": round(row["cash_price"], 2),
            "insurance_price": round(row["insurance_price"], 2),
            "min_negotiated": round(row["min_negotiated"], 2),
            "max_negotiated": round(row["max_negotiated"], 2),
            "distance_miles": round(dist, 1),
            "value_score": value_score,
            "overcharge_pct": overcharge_pct,
            "national_avg_cash": national_avg_cash,
        })

    # Sort by value score descending
    results.sort(key=lambda x: x["value_score"], reverse=True)

    # Add savings vs most expensive in results
    if results:
        max_price = max(r["cash_price"] for r in results)
        for r in results:
            r["savings_vs_worst"] = round(max_price - r["cash_price"], 2)

    return jsonify({
        "procedure": dict(proc),
        "hospitals": results,
        "national_avg_cash": national_avg_cash,
        "total_found": len(results)
    })

@app.route("/api/leaderboard", methods=["GET"])
def leaderboard():
    """Most overpriced hospitals leaderboard"""
    procedure_id = request.args.get("procedure_id", type=int)

    conn = get_db()

    if procedure_id:
        proc = conn.execute("SELECT national_avg_cash FROM procedures WHERE id=?", (procedure_id,)).fetchone()
        national_avg = proc["national_avg_cash"] if proc else None

        rows = conn.execute("""
            SELECT h.name, h.city, h.state, h.quality_score, h.is_academic,
                   p.cash_price, p.insurance_price
            FROM hospitals h
            JOIN prices p ON h.id = p.hospital_id
            WHERE p.procedure_id = ?
            ORDER BY p.cash_price DESC
            LIMIT 20
        """, (procedure_id,)).fetchall()
    else:
        # Average overcharge across all procedures
        rows = conn.execute("""
            SELECT h.name, h.city, h.state, h.quality_score, h.is_academic,
                   AVG(p.cash_price) as cash_price, AVG(p.insurance_price) as insurance_price
            FROM hospitals h
            JOIN prices p ON h.id = p.hospital_id
            GROUP BY h.id
            ORDER BY AVG(p.cash_price) DESC
            LIMIT 20
        """).fetchall()
        national_avg = None

    conn.close()

    result = []
    for i, r in enumerate(rows):
        item = dict(r)
        item["rank"] = i + 1
        if national_avg:
            item["overcharge_pct"] = round(((r["cash_price"] - national_avg) / national_avg) * 100, 1)
        result.append(item)

    return jsonify(result)

@app.route("/api/map-data", methods=["GET"])
def map_data():
    """State-level average prices for choropleth map"""
    procedure_id = request.args.get("procedure_id", type=int)

    conn = get_db()

    if procedure_id:
        rows = conn.execute("""
            SELECT h.state, AVG(p.cash_price) as avg_cash, AVG(p.insurance_price) as avg_insurance,
                   COUNT(DISTINCT h.id) as hospital_count
            FROM hospitals h
            JOIN prices p ON h.id = p.hospital_id
            WHERE p.procedure_id = ?
            GROUP BY h.state
        """, (procedure_id,)).fetchall()
    else:
        rows = conn.execute("""
            SELECT h.state, AVG(p.cash_price) as avg_cash, AVG(p.insurance_price) as avg_insurance,
                   COUNT(DISTINCT h.id) as hospital_count
            FROM hospitals h
            JOIN prices p ON h.id = p.hospital_id
            GROUP BY h.state
        """).fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/geocode", methods=["GET"])
def geocode_zip():
    """Geocode a zip code or city using free Nominatim API"""
    query = request.args.get("q", "")
    if not query:
        return jsonify({"error": "Query required"}), 400

    import requests as req
    try:
        resp = req.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": query + ", USA", "format": "json", "limit": 1},
            headers={"User-Agent": "HealthcareCostDashboard/1.0"},
            timeout=5
        )
        data = resp.json()
        if data:
            return jsonify({"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"]), "display_name": data[0]["display_name"]})
        return jsonify({"error": "Location not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)