import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function EntryGate() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('loading') 
  // phase = 'loading' → 'reveal' → 'ready'

  useEffect(() => {
    // After 2.5s → move to reveal phase
    const t1 = setTimeout(() => setPhase('reveal'), 2500)
    // After 4.5s → show the enter button
    const t2 = setTimeout(() => setPhase('ready'), 4500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="entry-gate">

      {/* ── Background particle field ── */}
      <div className="stars-bg" />

      {/* ── DNA Helix Visual ── */}
      <div className={`helix-container ${phase !== 'loading' ? 'helix-assembled' : ''}`}>
        {/* 12 helix nodes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="helix-node" style={{ '--i': i }} />
        ))}
      </div>

      {/* ── Center Content ── */}
      <div className="entry-content">

        {/* Classification text — fades in first */}
        <p className={`classification-text ${phase !== 'loading' ? 'fade-in' : ''}`}>
          XENOVA RESEARCH DIVISION · ARCHIVE ACCESS TERMINAL
        </p>

        {/* Main title — glitches in */}
        <h1 className={`xenova-title ${phase !== 'loading' ? 'title-reveal' : ''}`}>
          XENOVA
          <span className="title-sub">ARCHIVE</span>
        </h1>

        {/* Subtitle */}
        <p className={`entry-subtitle ${phase === 'ready' ? 'fade-in' : ''}`}>
          40,000 years of genetic mastery. One catastrophic mistake.
        </p>

        {/* Enter button — only shows when ready */}
        {phase === 'ready' && (
          <button
            className="enter-btn"
            onClick={() => navigate('/archive')}
          >
            <span className="btn-text">ENTER THE ARCHIVE</span>
            <span className="btn-glow" />
          </button>
        )}

      </div>

      {/* ── Bottom status bar ── */}
      <div className={`status-bar ${phase !== 'loading' ? 'fade-in' : ''}`}>
        <span className="status-dot" />
        <span>ARCHIVE STATUS: ONLINE</span>
        <span className="status-divider">·</span>
        <span>KETHARA-VII RUINS · SECTOR 14</span>
        <span className="status-divider">·</span>
        <span>CODEX FRAGMENTS: 847 RECOVERED</span>
      </div>

    </div>
  )
}

export default EntryGate