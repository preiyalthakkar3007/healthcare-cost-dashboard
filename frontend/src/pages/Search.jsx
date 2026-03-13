import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'http://localhost:5000/api'

function ValueBadge({ score }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 75 ? 'Excellent Value' : score >= 50 ? 'Fair Value' : 'Poor Value'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', background: '#0d1929',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, color,
        }}>{score}</div>
      </div>
      <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 4, letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

function HospitalCard({ h, nationalAvg, rank }) {
  const [expanded, setExpanded] = useState(false)
  const overcharged = h.overcharge_pct > 10
  const undercharged = h.overcharge_pct < -10

  return (
    <div style={{
      background: rank === 1 ? 'rgba(14,165,233,0.07)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${rank === 1 ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 16, padding: '20px 24px', marginBottom: 12,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Rank */}
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', width: 28, textAlign: 'center' }}>
          {rank === 1 ? '🏆' : `#${rank}`}
        </div>

        {/* Value score */}
        <ValueBadge score={h.value_score} />

        {/* Hospital info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{h.name}</span>
            {h.is_academic && <span style={{ fontSize: 10, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', borderRadius: 4, padding: '2px 6px', fontWeight: 600 }}>ACADEMIC</span>}
            {h.is_safety_net && <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.1)', color: '#4ade80', borderRadius: 4, padding: '2px 6px', fontWeight: 600 }}>SAFETY NET</span>}
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{h.city}, {h.state} · {h.distance_miles} mi away · Quality: {h.quality_score}/100</div>
        </div>

        {/* Prices */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: undercharged ? '#22c55e' : overcharged ? '#ef4444' : '#f1f5f9', letterSpacing: '-1px' }}>
            ${h.cash_price.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>cash price</div>
          {overcharged && (
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: 2 }}>
              +{h.overcharge_pct}% vs avg
            </div>
          )}
          {undercharged && (
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginTop: 2 }}>
              {h.overcharge_pct}% vs avg 🔥
            </div>
          )}
        </div>

        {/* Expand */}
        <button onClick={() => setExpanded(!expanded)} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, color: '#64748b', padding: '6px 12px', cursor: 'pointer', fontSize: 13,
        }}>
          {expanded ? '▲ Less' : '▼ More'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>PRICE COMPARISON</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Cash price</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>${h.cash_price.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Insurance price</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>${h.insurance_price.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>National avg (cash)</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>${nationalAvg.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>SAVINGS INSIGHT</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              {h.savings_vs_worst > 0 ? (
                <>Choosing this hospital saves you <strong style={{ color: '#22c55e' }}>${h.savings_vs_worst.toLocaleString()}</strong> vs the most expensive option in your search.</>
              ) : (
                <>This is the most expensive option in your search area.</>
              )}
            </div>
            {h.insurance_price > h.cash_price && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#7dd3fc' }}>
                💡 Cash is <strong>${(h.insurance_price - h.cash_price).toLocaleString()}</strong> cheaper than insurance here
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>QUALITY METRICS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Quality score</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: h.quality_score >= 90 ? '#22c55e' : h.quality_score >= 80 ? '#f59e0b' : '#ef4444' }}>{h.quality_score}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Type</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{h.is_academic ? 'Academic' : h.is_safety_net ? 'Safety Net' : 'Community'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Search() {
  const [procedures, setProcedures] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProc, setSelectedProc] = useState(null)
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState(50)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState(null)
  const [coords, setCoords] = useState(null)
  const [priceW, setPriceW] = useState(40)
  const [qualityW, setQualityW] = useState(40)
  const [distanceW, setDistanceW] = useState(20)
  const resultsRef = useRef(null)

  useEffect(() => {
    axios.get(`${API}/procedures`).then(r => {
      setProcedures(r.data)
      const cats = ['All', ...new Set(r.data.map(p => p.category))]
      setCategories(cats)
    })
  }, [])

  const filteredProcs = selectedCategory === 'All'
    ? procedures
    : procedures.filter(p => p.category === selectedCategory)

  const handleWeightChange = (type, val) => {
    val = parseInt(val)
    if (type === 'price') {
      const rem = 100 - val
      setPriceW(val)
      setQualityW(Math.round(rem * qualityW / (qualityW + distanceW)))
      setDistanceW(100 - val - Math.round(rem * qualityW / (qualityW + distanceW)))
    } else if (type === 'quality') {
      const rem = 100 - val
      setQualityW(val)
      setPriceW(Math.round(rem * priceW / (priceW + distanceW)))
      setDistanceW(100 - val - Math.round(rem * priceW / (priceW + distanceW)))
    } else {
      const rem = 100 - val
      setDistanceW(val)
      setPriceW(Math.round(rem * priceW / (priceW + qualityW)))
      setQualityW(100 - val - Math.round(rem * priceW / (priceW + qualityW)))
    }
  }

  const handleSearch = async () => {
    if (!location || !selectedProc) {
      setError('Please enter a location and select a procedure.')
      return
    }
    setError(null)
    setGeocoding(true)

    try {
      const geo = await axios.get(`${API}/geocode?q=${encodeURIComponent(location)}`)
      const { lat, lon } = geo.data
      setCoords({ lat, lon })
      setGeocoding(false)
      setLoading(true)

      const res = await axios.get(`${API}/search`, {
        params: {
          lat, lon,
          procedure_id: selectedProc.id,
          radius,
          price_w: priceW / 100,
          quality_w: qualityW / 100,
          distance_w: distanceW / 100,
        }
      })
      setResults(res.data)
      setLoading(false)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      setGeocoding(false)
      setLoading(false)
      setError('Could not find that location. Try a city name or zip code.')
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-1px' }}>Find Your Best Value Hospital</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Compare real cash prices across 101 hospitals with our Hospital Value Score algorithm.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Location */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: '0.08em' }}>YOUR LOCATION</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Seattle, WA or 98101"
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '12px 16px', color: '#f1f5f9', fontSize: 15, outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Radius */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, letterSpacing: '0.08em' }}>SEARCH RADIUS: {radius} MILES</label>
          <input type="range" min={10} max={200} value={radius} onChange={e => setRadius(parseInt(e.target.value))}
            style={{ width: '100%', marginTop: 12, accentColor: '#0ea5e9' }} />
        </div>
      </div>

      {/* Procedure selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 10, letterSpacing: '0.08em' }}>SELECT PROCEDURE</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setSelectedCategory(c)} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: selectedCategory === c ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.04)',
              color: selectedCategory === c ? '#0ea5e9' : '#64748b',
              border: `1px solid ${selectedCategory === c ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
          {filteredProcs.map(p => (
            <button key={p.id} onClick={() => setSelectedProc(p)} style={{
              padding: '10px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer', textAlign: 'left',
              background: selectedProc?.id === p.id ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)',
              color: selectedProc?.id === p.id ? '#0ea5e9' : '#94a3b8',
              border: `1px solid ${selectedProc?.id === p.id ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.06)'}`,
              fontWeight: selectedProc?.id === p.id ? 600 : 400,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{p.name}</span>
              <span style={{ fontSize: 12, color: '#475569' }}>avg ${p.national_avg_cash.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Value Score Weights */}
      <div style={{
        background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)',
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#7dd3fc', marginBottom: 16, letterSpacing: '0.05em' }}>
          ⚖️ ADJUST VALUE SCORE WEIGHTS — Total: {priceW + qualityW + distanceW}%
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'Price', val: priceW, type: 'price', color: '#22c55e' },
            { label: 'Quality', val: qualityW, type: 'quality', color: '#a78bfa' },
            { label: 'Distance', val: distanceW, type: 'distance', color: '#f59e0b' },
          ].map(w => (
            <div key={w.type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{w.label}</span>
                <span style={{ fontSize: 13, color: w.color, fontWeight: 700 }}>{w.val}%</span>
              </div>
              <input type="range" min={0} max={100} value={w.val}
                onChange={e => handleWeightChange(w.type, e.target.value)}
                style={{ width: '100%', accentColor: w.color }} />
            </div>
          ))}
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 14, marginBottom: 16 }}>{error}</div>}

      <button onClick={handleSearch} disabled={loading || geocoding} style={{
        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        color: '#fff', border: 'none', borderRadius: 12,
        padding: '14px 40px', fontSize: 16, fontWeight: 700,
        cursor: loading || geocoding ? 'not-allowed' : 'pointer',
        opacity: loading || geocoding ? 0.7 : 1,
        marginBottom: 40, boxShadow: '0 0 24px rgba(14,165,233,0.2)',
        width: '100%',
      }}>
        {geocoding ? 'Finding location...' : loading ? 'Searching hospitals...' : 'Find Best Value Hospitals →'}
      </button>

      {/* Results */}
      {results && (
        <div ref={resultsRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4, letterSpacing: '-0.5px' }}>
                {results.total_found} hospitals found
              </h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                {results.procedure.name} · National avg: <strong style={{ color: '#f1f5f9' }}>${results.national_avg_cash.toLocaleString()}</strong> cash
              </p>
            </div>
            {results.hospitals.length >= 2 && (
              <div style={{
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 12, padding: '10px 16px',
              }}>
                <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, letterSpacing: '0.05em' }}>MAX POTENTIAL SAVINGS</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', letterSpacing: '-1px' }}>
                  ${results.hospitals[results.hospitals.length - 1]?.savings_vs_worst.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>best vs worst in your search</div>
              </div>
            )}
          </div>

          {/* Price chart */}
          {results.hospitals.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 16, letterSpacing: '0.05em' }}>PRICE COMPARISON (CASH)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={results.hospitals.slice(0, 10).map(h => ({ name: h.name.split(' ')[0], cash: h.cash_price, insurance: h.insurance_price }))}>
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#0d1929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    formatter={v => [`$${v.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="cash" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Cash" />
                  <Bar dataKey="insurance" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Insurance" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Hospital cards */}
          {results.hospitals.map((h, i) => (
            <HospitalCard key={h.id} h={h} nationalAvg={results.national_avg_cash} rank={i + 1} />
          ))}

          {results.hospitals.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 24px' }}>
              No hospitals found within {radius} miles. Try increasing your radius.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
