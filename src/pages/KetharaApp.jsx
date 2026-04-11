import React, { useState } from 'react'
import SolarSystemScene from '../components/KetharaMap/SolarSystemScene'

export default function KetharaApp() {
  const [selectedPlanet, setSelectedPlanet] = useState(null)

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
      
      {/* Embedded styles for the pulsing status dot */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; box-shadow: 0 0 10px #0088FF; }
          50% { opacity: 0.4; box-shadow: 0 0 2px #0088FF; }
          100% { opacity: 1; box-shadow: 0 0 10px #0088FF; }
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
