import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [procedures, setProcedures] = useState([])
  const [selectedProc, setSelectedProc] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/procedures`).then(r => setProcedures(r.data))
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async (procId = '') => {
    setLoading(true)
    const res = await axios.get(`${API}/leaderboard${procId ? `?procedure_id=${procId}` : ''}`)
    setData(res.data)
    setLoading(false)
  }

  const handleProcChange = (id) => {
    setSelectedProc(id)
    fetchLeaderboard(id)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#fca5a5', letterSpacing: '0.08em', marginBottom: 12 }}>
          HALL OF SHAME
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#2e3841', marginBottom: 6, letterSpacing: '-1px' }}>Most Overpriced Hospitals</h1>
        <p style={{ color: '#64748b' }}>Real cash prices ranked by how much they charge above average. Data from CMS price transparency files.</p>
      </div>

      {/* Procedure filter */}
      <div style={{ marginBottom: 28, position: 'relative' }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: 8, display: 'block' }}>FILTER BY PROCEDURE</label>
        <select
          value={selectedProc}
          onChange={e => handleProcChange(e.target.value)}
          style={{
            background: '#0d1929', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '10px 16px', color: '#f1f5f9', fontSize: 14,
            outline: 'none', minWidth: 300, cursor: 'pointer', appearance: 'auto',
          }}
        >
          <option style={{ background: '#0d1929', color: '#f1f5f9' }} value="">All Procedures (average)</option>
          {procedures.map(p => <option style={{ background: '#0d1929', color: '#f1f5f9' }} key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Loading...</div>
      ) : (
        <div>
          {data.map((h, i) => {
            const isTop3 = i < 3
            const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
            const overchargePct = h.overcharge_pct

            return (
              <div key={i} style={{
                background: isTop3 ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isTop3 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 14, padding: '16px 20px', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                {/* Rank */}
                <div style={{ fontSize: isTop3 ? 24 : 14, fontWeight: 700, color: '#475569', width: 36, textAlign: 'center' }}>
                  {rankEmoji || `#${h.rank}`}
                </div>

                {/* Hospital info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{h.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {h.city}, {h.state}
                    {h.is_academic ? ' · Academic Medical Center' : ''}
                  </div>
                </div>

                {/* Cash price */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444', letterSpacing: '-1px' }}>
                    ${Math.round(h.cash_price).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>cash price</div>
                </div>

                {/* Overcharge badge */}
                {overchargePct !== undefined && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '6px 12px', textAlign: 'center', minWidth: 80,
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>+{overchargePct}%</div>
                    <div style={{ fontSize: 10, color: '#f87171', fontWeight: 600 }}>vs avg</div>
                  </div>
                )}

                {/* Insurance price */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>
                    ${Math.round(h.insurance_price).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>w/ insurance</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)', borderRadius: 12 }}>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          ℹ️ Prices are cash/self-pay rates from CMS hospital price transparency files (2024–2025). Higher prices don't always mean worse care — academic medical centers often treat more complex cases. Use the <a href="/search" style={{ color: '#0ea5e9' }}>Search tool</a> to compare by value score, which balances price with quality.
        </p>
      </div>
    </div>
  )
}
