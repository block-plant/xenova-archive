import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import EntryGate from './pages/EntryGate'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryGate />} />
      </Routes>
    </Router>
  )
}

export default App