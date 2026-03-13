# ClearCare — Healthcare Cost Transparency Dashboard

> The same surgery can cost 10x more at one hospital versus another nearby. ClearCare makes that visible.

**Live App → [healthcare-cost-dashboard.vercel.app](https://healthcare-cost-dashboard.vercel.app)**

---

## What It Does

Hospitals have been legally required to publish their prices since 2021 — but the data is buried in massive, unreadable CSV files. ClearCare turns that data into an interactive dashboard where anyone can search their location, pick a procedure, and instantly compare what nearby hospitals actually charge.

The core innovation is the **Hospital Value Score** — a composite algorithm that ranks hospitals not just by price, but by the best combination of price, quality, and distance. Users can adjust the weights in real time based on their own priorities.

---

## Features

- 🔍 **Zip code / city search** — find all hospitals within a custom radius
- ⚖️ **Hospital Value Score** — composite ranking by price + quality + distance with user-adjustable sliders
- 💸 **"You're being overcharged" badge** — shows how much more a hospital charges vs the national average
- 📊 **Price comparison chart** — cash vs insurance prices side by side for top hospitals
- 🏆 **Most Overpriced Hospitals leaderboard** — ranked by how far above average they charge
- 🗺️ **US Price Bubble Map** — average cash prices by state, filterable by procedure
- 💊 **Insurance vs cash comparison** — surfaces cases where cash is cheaper than using insurance

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Recharts, React Router |
| Backend | Python, Flask, Flask-CORS |
| Database | SQLite (pre-seeded with CMS data) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Data

- **101 major US hospitals** curated from CMS price transparency files
- **20 common procedures** including MRI, CT scan, appendectomy, knee replacement, colonoscopy, and more
- **Real cash and insurance prices** sourced from legally required hospital machine-readable files (MRFs)
- **Quality scores** based on CMS Hospital Compare ratings
- National average prices calculated across all hospitals for each procedure

---

## Hospital Value Score Algorithm

```
Value Score = (Price Score × price_weight) + (Quality Score × quality_weight) + (Distance Score × distance_weight)

Price Score   = (national_avg / cash_price) × 100   → higher if cheaper than average
Quality Score = CMS quality rating (0–100)
Distance Score = max(0, 100 − distance_miles × 1.5) → higher if closer
```

Default weights: Price 40% · Quality 40% · Distance 20%  
Users can adjust weights in real time via sliders on the search page.

---

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python seed_data.py          # Creates healthcare.db with all hospital data
python app.py                # Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                  # Runs on http://localhost:5173
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/procedures` | List all 20 procedures |
| `GET /api/search` | Search hospitals by location + procedure |
| `GET /api/leaderboard` | Most overpriced hospitals |
| `GET /api/map-data` | State-level average prices |
| `GET /api/geocode?q=` | Convert zip/city to coordinates |

---

## Why I Built This

Healthcare pricing in the US is notoriously opaque. The same MRI can cost $380 at one hospital and $3,200 at another across the street — and most people have no idea. Since 2021, hospitals are legally required to publish their prices, but the data is essentially inaccessible to ordinary people. ClearCare is the interface that should have existed from day one.

---

*Built with React, Flask, and real CMS price transparency data.*