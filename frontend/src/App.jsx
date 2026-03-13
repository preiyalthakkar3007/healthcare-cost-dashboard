import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import Leaderboard from './pages/Leaderboard'
import MapView from './pages/MapView'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: '#060d1a' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
