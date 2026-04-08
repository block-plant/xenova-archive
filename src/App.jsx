import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EntryGate from './pages/EntryGate'
import MainArchive from './pages/MainArchive'
import Artifacts from './pages/Artifacts'
import Timeline from './pages/Timeline'
import Codex from './pages/Codex'
import KetharaMap from './pages/KetharaMap'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryGate />} />
        <Route path="/archive" element={<MainArchive />} />
        <Route path="/artifacts" element={<Artifacts />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/codex" element={<Codex />} />
        <Route path="/map" element={<KetharaMap />} />
      </Routes>
    </Router>
  )
}

export default App