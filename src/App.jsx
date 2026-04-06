import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages will go here one by one */}
        <Route path="/" element={<div style={{color: '#00FFD1', padding: '2rem'}}>Xenova Archive — Online</div>} />
      </Routes>
    </Router>
  )
}

export default App