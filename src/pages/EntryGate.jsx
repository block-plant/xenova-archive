import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVisitor } from '../context/VisitorContext'

function EntryGate() {
  const navigate = useNavigate()
  const { setHasPass, setVisitorName } = useVisitor()
  const [phase, setPhase] = useState('loading')
  // phase = 'loading' → 'reveal' → 'ready' → 'applying'
  const [nameInput, setNameInput] = useState('')
  const [inputError, setInputError] = useState(false)

  useEffect(() => {
    // After 0.5s → move to reveal phase
    const t1 = setTimeout(() => setPhase('reveal'), 500)
    // After 1.0s → show the enter button
    const t2 = setTimeout(() => setPhase('ready'), 1000)

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

        {/* Enter buttons — only shows when ready */}
        {phase === 'ready' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <button
              className="enter-btn"
              onClick={() => setPhase('applying')}
            >
              <span className="btn-text">AUTHENTICATE OBSERVER</span>
              <span className="btn-glow" />
            </button>
            <button
              className="enter-btn guest-btn"
              onClick={() => {
                setHasPass(false);
                setVisitorName('ANONYMOUS');
                navigate('/archive');
              }}
              style={{ background: 'transparent', border: '1px solid rgba(0, 255, 209, 0.3)' }}
            >
              <span className="btn-text" style={{ color: 'rgba(0, 255, 209, 0.6)' }}>PROCEED UNREGISTERED</span>
            </button>
          </div>
        )}

        {/* Application Modal */}
        {phase === 'applying' && (
          <div className="fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(8, 15, 26, 0.85), rgba(5, 8, 16, 0.95))',
            padding: '40px 50px',
            border: '1px solid rgba(0, 255, 209, 0.2)',
            borderRadius: '8px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 40px rgba(0, 255, 209, 0.1), inset 0 0 20px rgba(0, 255, 209, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top scanning line effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00FFD1, transparent)',
              animation: 'scroll-pulse 2s ease-in-out infinite'
            }} />

            {/* Header info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '40px', height: '2px', background: '#00FFD1', marginBottom: '8px', boxShadow: '0 0 10px #00FFD1' }} />
              <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#00FFD1', letterSpacing: '4px', textShadow: '0 0 10px rgba(0, 255, 209, 0.5)' }}>
                IDENTITY VERIFICATION
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#7AAFC4', letterSpacing: '2px' }}>
                PLEASE STATE YOUR OBSERVER DESIGNATION
              </div>
            </div>

            {/* Input Wrapper with glowing borders */}
            <div style={{ position: 'relative', width: '100%', marginTop: '10px' }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (inputError) setInputError(false);
                }}
                placeholder={inputError ? "DESIGNATION REQUIRED" : "ENTER DESIGNATION"}
                className="holographic-input"
                style={{
                  background: inputError ? 'rgba(255, 58, 58, 0.05)' : 'rgba(0, 255, 209, 0.03)',
                  border: `1px solid ${inputError ? 'rgba(255, 58, 58, 0.5)' : 'rgba(0, 255, 209, 0.3)'}`,
                  borderLeft: `3px solid ${inputError ? '#FF3A3A' : '#00FFD1'}`,
                  borderRight: `3px solid ${inputError ? '#FF3A3A' : '#00FFD1'}`,
                  padding: '16px 24px',
                  color: inputError ? '#FF3A3A' : '#E8F4F8',
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  letterSpacing: '3px',
                  outline: 'none',
                  width: '320px',
                  textAlign: 'center',
                  boxShadow: `inset 0 0 15px ${inputError ? 'rgba(255, 58, 58, 0.1)' : 'rgba(0, 255, 209, 0.05)'}`,
                  transition: 'all 0.3s ease',
                  transform: inputError ? 'translateX(2px)' : 'none'
                }}
                onFocus={(e) => {
                  if (inputError) return;
                  e.target.style.background = 'rgba(0, 255, 209, 0.08)';
                  e.target.style.boxShadow = '0 0 20px rgba(0, 255, 209, 0.2), inset 0 0 15px rgba(0, 255, 209, 0.1)';
                  e.target.style.borderColor = '#00FFD1';
                }}
                onBlur={(e) => {
                  if (inputError) return;
                  e.target.style.background = 'rgba(0, 255, 209, 0.03)';
                  e.target.style.boxShadow = 'inset 0 0 15px rgba(0, 255, 209, 0.05)';
                  e.target.style.borderColor = 'rgba(0, 255, 209, 0.3)';
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (!nameInput.trim()) {
                      setInputError(true);
                      setTimeout(() => setInputError(false), 800);
                      return;
                    }
                    setHasPass(true);
                    setVisitorName(nameInput.trim());
                    navigate('/archive');
                  }
                }}
              />
              {/* Corner brackets for tech aesthetic */}
              <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '10px', height: '10px', borderTop: `2px solid ${inputError ? '#FF3A3A' : '#00FFD1'}`, borderLeft: `2px solid ${inputError ? '#FF3A3A' : '#00FFD1'}` }} />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '10px', height: '10px', borderBottom: `2px solid ${inputError ? '#FF3A3A' : '#00FFD1'}`, borderRight: `2px solid ${inputError ? '#FF3A3A' : '#00FFD1'}` }} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '12px', marginTop: '10px' }}>
              <button
                className="enter-btn"
                style={{ width: '100%', padding: '14px 0', margin: '0', background: 'rgba(0, 255, 209, 0.1)', border: '1px solid #00FFD1', display: 'flex', justifyContent: 'center' }}
                onClick={() => {
                  if (!nameInput.trim()) {
                    setInputError(true);
                    setTimeout(() => setInputError(false), 800);
                    return;
                  }
                  setHasPass(true);
                  setVisitorName(nameInput.trim());
                  navigate('/archive');
                }}
              >
                <span className="btn-text">ISSUE PASSPORT</span>
                <span className="btn-glow" />
              </button>
              
              <button
                onClick={() => setPhase('ready')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 58, 58, 0.3)',
                  color: 'rgba(255, 58, 58, 0.8)',
                  padding: '10px 0',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  letterSpacing: '2px',
                  fontSize: '12px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 58, 58, 0.1)'; e.target.style.color = '#FF3A3A'; e.target.style.borderColor = '#FF3A3A'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(255, 58, 58, 0.8)'; e.target.style.borderColor = 'rgba(255, 58, 58, 0.3)'; }}
              >
                ABORT SEQUENCE
              </button>
            </div>
          </div>
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