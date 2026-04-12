import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { VisitorProvider } from './context/VisitorContext'
import EntryGate from './pages/EntryGate'
import MainArchive from './pages/MainArchive'
import Artifacts from './pages/Artifacts'
import Timeline from './pages/Timeline'
import Codex from './pages/Codex'
import KetharaApp from './pages/KetharaApp'
import Terminal from './pages/Terminal'
import GlobalPassport from './components/GlobalPassport'
import NavBar from './components/NavBar'
import ScrollToTop from './components/ScrollToTop'

function App() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent F12
      if(e.key === 'F12'){
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+I / Cmd+Option+I - Inspect
      if((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i'){
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+C / Cmd+Option+C - Inspect Element
      if((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c'){
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+J / Cmd+Option+J - Console
      if((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j'){
        e.preventDefault();
      }
      // Prevent Ctrl+U / Cmd+Option+U - View Source
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u'){
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <VisitorProvider>
      <Router>
        <ScrollToTop />
        <NavBar />
        <GlobalPassport />
        <Routes>
          <Route path="/" element={<EntryGate />} />
          <Route path="/archive" element={<MainArchive />} />
          <Route path="/artifacts" element={<Artifacts />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/codex" element={<Codex />} />
          <Route path="/map" element={<KetharaApp />} />
          <Route path="/terminal" element={<Terminal />} />
        </Routes>
      </Router>
    </VisitorProvider>
  )
}

export default App