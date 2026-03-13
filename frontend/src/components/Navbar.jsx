import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()
  const links = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Search' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/map', label: 'Price Map' },
  ]

  return (
    <nav style={{
      background: 'rgba(6,13,26,0.95)',
      borderBottom: '1px solid rgba(14,165,233,0.2)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            ClearCare
          </span>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500, letterSpacing: '0.05em' }}>PRICE TRANSPARENCY</span>
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              textDecoration: 'none',
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: loc.pathname === l.to ? '#0ea5e9' : '#94a3b8',
              background: loc.pathname === l.to ? 'rgba(14,165,233,0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
