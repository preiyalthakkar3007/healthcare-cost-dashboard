import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://healthcare-cost-dashboard.onrender.com/api'

// State centroids for bubble map
const STATE_COORDS = {
  AL: [32.8, -86.8], AK: [64.2, -153.4], AZ: [34.3, -111.1], AR: [34.8, -92.2],
  CA: [36.8, -119.4], CO: [39.1, -105.4], CT: [41.6, -72.7], DC: [38.9, -77.0],
  DE: [39.0, -75.5], FL: [27.8, -81.6], GA: [32.2, -83.4], HI: [19.9, -155.6],
  ID: [44.4, -114.5], IL: [40.0, -89.2], IN: [39.8, -86.2], IA: [42.0, -93.2],
  KS: [38.5, -98.4], KY: [37.5, -85.3], LA: [31.2, -91.8], ME: [44.7, -69.4],
  MD: [39.1, -76.8], MA: [42.2, -71.5], MI: [44.3, -85.4], MN: [46.4, -93.1],
  MS: [32.7, -89.7], MO: [38.5, -92.5], MT: [47.0, -110.5], NE: [41.5, -99.9],
  NV: [38.5, -117.1], NH: [43.7, -71.6], NJ: [40.1, -74.5], NM: [34.8, -106.2],
  NY: [42.2, -74.9], NC: [35.5, -79.4], ND: [47.5, -100.5], OH: [40.4, -82.8],
  OK: [35.6, -96.9], OR: [44.6, -122.1], PA: [40.6, -77.2], RI: [41.7, -71.5],
  SC: [33.9, -80.9], SD: [44.4, -100.2], TN: [35.9, -86.4], TX: [31.5, -99.3],
  UT: [39.3, -111.1], VT: [44.1, -72.7], VA: [37.5, -78.9], WA: [47.4, -120.6],
  WV: [38.5, -80.8], WI: [44.3, -89.6], WY: [43.0, -107.6]
}

function getColor(value, min, max) {
  const ratio = (value - min) / (max - min)
  // Green → Yellow → Red
  if (ratio < 0.5) {
    const r = Math.round(255 * ratio * 2)
    return `rgb(${r}, 200, 80)`
  } else {
    const g = Math.round(200 * (1 - (ratio - 0.5) * 2))
    return `rgb(255, ${g}, 60)`
  }
}

export default function MapView() {
  const [mapData, setMapData] = useState([])
  const [procedures, setProcedures] = useState([])
  const [selectedProc, setSelectedProc] = useState('')
  const [selectedProcName, setSelectedProcName] = useState('All Procedures')
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    axios.get(`${API}/procedures`).then(r => setProcedures(r.data))
    fetchMapData()
  }, [])

  const fetchMapData = async (procId = '') => {
    setLoading(true)
    const res = await axios.get(`${API}/map-data${procId ? `?procedure_id=${procId}` : ''}`)
    setMapData(res.data)
    setLoading(false)
  }

  const handleProcChange = (id) => {
    setSelectedProc(id)
    const proc = procedures.find(p => p.id === parseInt(id))
    setSelectedProcName(proc ? proc.name : 'All Procedures')
    fetchMapData(id)
  }

  const values = mapData.map(d => d.avg_cash)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  // Simple SVG-based US map using state positions
  const viewBox = "-130 20 75 35"

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-1px' }}>US Price Map</h1>
        <p style={{ color: '#64748b' }}>Average cash prices by state. Darker red = more expensive. Use the filter to see specific procedures.</p>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 28, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={selectedProc}
          onChange={e => handleProcChange(e.target.value)}
          style={{
            background: '#0d1929', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '10px 16px', color: '#f1f5f9', fontSize: 14,
            outline: 'none', minWidth: 280, cursor: 'pointer',
          }}
        >
          <option style={{ background: '#0d1929', color: '#f1f5f9' }} value="">All Procedures (average)</option>
          {procedures.map(p => <option style={{ background: '#0d1929', color: '#f1f5f9' }} key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {!loading && mapData.length > 0 && (
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Showing {mapData.length} states · Range: <span style={{ color: '#22c55e', fontWeight: 700 }}>${Math.round(minVal).toLocaleString()}</span> – <span style={{ color: '#ef4444', fontWeight: 700 }}>${Math.round(maxVal).toLocaleString()}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Loading map data...</div>
      ) : (
        <>
          {/* Bubble map */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 20, letterSpacing: '0.05em' }}>
              AVERAGE CASH PRICE BY STATE — {selectedProcName.toUpperCase()}
            </div>

            {/* Simple grid layout of state bubbles */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {mapData
                .sort((a, b) => b.avg_cash - a.avg_cash)
                .map(d => {
                  const color = getColor(d.avg_cash, minVal, maxVal)
                  const size = 40 + ((d.avg_cash - minVal) / (maxVal - minVal)) * 50
                  return (
                    <div
                      key={d.state}
                      onMouseEnter={(e) => setTooltip({ state: d.state, data: d, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        width: size, height: size, borderRadius: '50%',
                        background: color,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'transform 0.2s',
                        boxShadow: `0 0 ${size/3}px ${color}40`,
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <span style={{ fontSize: Math.max(9, size / 5), fontWeight: 800, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{d.state}</span>
                      <span style={{ fontSize: Math.max(7, size / 6.5), color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                        ${Math.round(d.avg_cash / 1000 * 10) / 10}k
                      </span>
                    </div>
                  )
                })}
            </div>

            {/* Legend */}
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Lower cost</span>
              <div style={{ width: 200, height: 8, borderRadius: 4, background: 'linear-gradient(to right, rgb(0,200,80), rgb(255,200,60), rgb(255,60,60))' }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>Higher cost</span>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>STATE RANKINGS</span>
              <span style={{ fontSize: 12, color: '#475569' }}>Sorted by average cash price</span>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {mapData.sort((a, b) => b.avg_cash - a.avg_cash).map((d, i) => (
                <div key={d.state} style={{
                  padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}>
                  <span style={{ fontSize: 12, color: '#475569', width: 24 }}>#{i + 1}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', width: 40 }}>{d.state}</span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${((d.avg_cash - minVal) / (maxVal - minVal)) * 100}%`,
                      height: '100%', borderRadius: 3,
                      background: getColor(d.avg_cash, minVal, maxVal),
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: getColor(d.avg_cash, minVal, maxVal), minWidth: 80, textAlign: 'right' }}>
                    ${Math.round(d.avg_cash).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: '#475569', minWidth: 60, textAlign: 'right' }}>
                    {d.hospital_count} hosp.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tooltip && (
        <div style={{
          position: 'fixed', top: tooltip.y - 80, left: tooltip.x + 12,
          background: '#0d1929', border: '1px solid rgba(14,165,233,0.2)',
          borderRadius: 10, padding: '10px 14px', pointerEvents: 'none', zIndex: 1000,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{tooltip.state}</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Avg cash: <strong style={{ color: '#0ea5e9' }}>${Math.round(tooltip.data.avg_cash).toLocaleString()}</strong></div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Hospitals: {tooltip.data.hospital_count}</div>
        </div>
      )}
    </div>
  )
}
