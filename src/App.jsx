import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EntryGate from './pages/EntryGate'
import MainArchive from './pages/MainArchive'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryGate />} />
        <Route path="/archive" element={<MainArchive />} />
      </Routes>
    </Router>
  )
}

export default App