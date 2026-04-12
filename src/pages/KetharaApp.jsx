import React, { useState, useRef, useEffect } from 'react'
import SolarSystemScene from '../components/KetharaMap/SolarSystemScene'

// Accent colour matching Kethara's blue palette
const ACCENT = '#0088FF';

export default function KetharaApp() {
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [audioOn, setAudioOn] = useState(false)
  const audioRef = useRef(null)

  // Create / play / pause the ambient track
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/kethara-ambient.mp3')
      audioRef.current.loop = true
      audioRef.current.volume = 0.38
    }
    if (audioOn) {
      audioRef.current.play().catch(err => console.warn('[Kethara] Audio blocked:', err))
    } else {
      audioRef.current.pause()
    }
    // Pause on page leave
    return () => { audioRef.current?.pause() }
  }, [audioOn])

  return (
    <div className="page-container" style={{ overflow: 'hidden', padding: 0 }}>
      {/* Target Canvas Scene */}
      <SolarSystemScene 
        selectedPlanetId={selectedPlanet} 
        onSelectPlanet={setSelectedPlanet} 
      />

      {/* Cinematic Overlays */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 100px 20px rgba(0,0,0,0.8)',
          zIndex: 10
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          background: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.1),
            rgba(0,0,0,0.1) 1px,
            transparent 1px,
            transparent 2px
          )`,
          opacity: 0.5,
          zIndex: 11
        }}
      />

      {/* Corner Brackets */}
      <div style={cornerStyle('top', 'left')} />
      <div style={cornerStyle('top', 'right')} />
      <div style={cornerStyle('bottom', 'left')} />
      <div style={cornerStyle('bottom', 'right')} />

      {/* Bottom Status Bar */}
      <div style={{
        position: 'absolute', 
        bottom: '2rem', 
        left: '0',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 20
      }}>
        <div style={{
          padding: '0.75rem 2rem',
          background: 'rgba(0, 136, 255, 0.05)',
          border: '1px solid rgba(0, 136, 255, 0.3)',
          borderRadius: '50px',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#0088FF',
            boxShadow: '0 0 10px #0088FF',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ 
            color: '#0088FF', 
            fontFamily: 'Orbitron, sans-serif', 
            fontSize: '0.8rem', 
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {selectedPlanet ? 'LOCAL OBSERVATION FEED' : 'BLUE ENERGY CORE · ACTIVE'}
          </span>
        </div>
      </div>
      
      {/* Ambient Audio Button — bottom-left corner */}
      <button
        onClick={() => setAudioOn(v => !v)}
        style={{
          position: 'fixed',
          bottom: '2.8rem',
          left: '2rem',
          zIndex: 30,
          background: audioOn ? `rgba(0,136,255,0.12)` : 'rgba(0,0,0,0.45)',
          border: `1px solid ${audioOn ? ACCENT : 'rgba(0,136,255,0.25)'}`,
          color: audioOn ? ACCENT : 'rgba(180,200,255,0.45)',
          padding: '0.4rem 0.92rem',
          fontSize: '0.46rem',
          letterSpacing: '0.2em',
          fontFamily: 'Orbitron, monospace',
          textTransform: 'uppercase',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: audioOn ? `0 0 14px rgba(0,136,255,0.3)` : 'none',
          transition: 'background 0.35s ease, border-color 0.35s ease, color 0.35s ease, box-shadow 0.35s ease',
          animation: 'kethara-audio-fade 0.7s ease 1.2s both',
        }}
      >
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: audioOn ? ACCENT : 'rgba(0,136,255,0.3)',
          boxShadow: audioOn ? `0 0 10px ${ACCENT}` : 'none',
          transition: 'background 0.35s ease, box-shadow 0.35s ease',
          flexShrink: 0,
        }} />
        {audioOn ? 'AMBIENT AUDIO: ACTIVE' : 'AMBIENT AUDIO: OFFLINE'}
      </button>

      {/* Embedded styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; box-shadow: 0 0 10px #0088FF; }
          50% { opacity: 0.4; box-shadow: 0 0 2px #0088FF; }
          100% { opacity: 1; box-shadow: 0 0 10px #0088FF; }
        }
        @keyframes kethara-audio-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}

// Helper to generate the little target-lock corners
function cornerStyle(vertical, horizontal) {
  return {
    position: 'absolute',
    [vertical]: '2rem',
    [horizontal]: '2rem',
    width: '30px',
    height: '30px',
    borderTop: vertical === 'top' ? '2px solid rgba(0,136,255,0.4)' : 'none',
    borderBottom: vertical === 'bottom' ? '2px solid rgba(0,136,255,0.4)' : 'none',
    borderLeft: horizontal === 'left' ? '2px solid rgba(0,136,255,0.4)' : 'none',
    borderRight: horizontal === 'right' ? '2px solid rgba(0,136,255,0.4)' : 'none',
    pointerEvents: 'none',
    zIndex: 15,
    transition: 'all 0.3s ease'
  }
}
