import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EntryGate from './pages/EntryGate'
import MainArchive from './pages/MainArchive'
import Artifacts from './pages/Artifacts'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryGate />} />
        <Route path="/archive" element={<MainArchive />} />
        <Route path="/artifacts" element={<Artifacts />} />
      </Routes>
    </Router>
  )
}

export default App