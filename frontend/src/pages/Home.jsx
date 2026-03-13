import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const STATS = [
  { value: '10x', label: 'Price variation for same procedure' },
  { value: '101', label: 'Hospitals in our database' },
  { value: '20', label: 'Common procedures tracked' },
  { value: '$0', label: 'Cost to use this tool' },
]

const FACTS = [
  'An MRI can cost $380 at one hospital and $3,200 at another across the street.',
  'Cash prices are often cheaper than using insurance at the same hospital.',
  'Hospitals are legally required to publish prices — almost nobody reads them.',
  'Driving 20 minutes could save you thousands on elective procedures.',
]

export default function Home() {
  const navigate = useNavigate()
  const [factIdx, setFactIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setFactIdx(i => (i + 1) % FACTS.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)',
          borderRadius: 20, padding: '5px 14px', marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, letterSpacing: '0.08em' }}>POWERED BY CMS PRICE TRANSPARENCY DATA</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 900,
          lineHeight: 1.05,
          marginBottom: 20,
          letterSpacing: '-2px',
          color: '#f8fafc',
        }}>
          Stop Overpaying<br />
          <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            For Healthcare
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
          The same surgery can cost <strong style={{ color: '#f1f5f9' }}>10x more</strong> at one hospital versus another nearby. 
          Find the best-value care based on price, quality, and distance.
        </p>

        {/* Rotating fact */}
        <div style={{
          background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)',
          borderRadius: 12, padding: '12px 20px', marginBottom: 40, maxWidth: 560,
          minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14, color: '#7dd3fc', lineHeight: 1.5 }}>
            💡 {FACTS[factIdx]}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/search')}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '14px 32px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '-0.2px',
              boxShadow: '0 0 30px rgba(14,165,233,0.3)',
            }}>
            Search Hospitals →
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            style={{
              background: 'transparent',
              color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12,
              padding: '14px 32px', fontSize: 16, fontWeight: 600,
              cursor: 'pointer',
            }}>
            Most Overpriced 🏆
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background: 'rgba(14,165,233,0.05)',
              border: '1px solid rgba(14,165,233,0.12)',
              borderRadius: 16, padding: '28px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#0ea5e9', letterSpacing: '-2px', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-1px' }}>How It Works</h2>
        <p style={{ color: '#64748b', marginBottom: 36 }}>Three steps to find the best-value care near you.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { step: '01', title: 'Enter your location', desc: 'Type your zip code or city. We find all hospitals within your chosen radius.' },
            { step: '02', title: 'Pick a procedure', desc: 'Choose from 20 common procedures. We show real cash and insurance prices side by side.' },
            { step: '03', title: 'Compare by value score', desc: 'Our algorithm weighs price, quality, and distance. Adjust the weights to match your priorities.' },
          ].map(item => (
            <div key={item.step} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '28px 24px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0ea5e9', letterSpacing: '0.1em', marginBottom: 12 }}>STEP {item.step}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{item.title}</div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
