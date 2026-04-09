import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

export default function Planet({ data, selected, onClick }) {
  const groupRef = useRef()
  const planetRef = useRef()
  
  // Start each planet at a random angle to spread them out
  const [angle] = useState(() => Math.random() * Math.PI * 2)
  const currentAngle = useRef(angle)

  useFrame((state, delta) => {
    // Continue orbiting whether selected or not
    currentAngle.current += data.orbitSpeed * delta * 0.1
    const x = Math.cos(currentAngle.current) * data.orbitRadius
    const z = Math.sin(currentAngle.current) * data.orbitRadius
    
    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z)
    }

    // Spin the planet on its own Y axis
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.2
    }

    // High precision camera tracking
    if (selected && groupRef.current) {
      const planetPos = groupRef.current.position.clone()
      const directionFromCenter = planetPos.clone().normalize()
      
      // Calculate a cinematic target position slightly above and outward from the planet
      const targetCamPos = planetPos.clone().add(directionFromCenter.multiplyScalar(15 + data.size))
      targetCamPos.y += 8

      state.camera.position.lerp(targetCamPos, delta * 2.5)

      // Smoothly steer the camera rotation to keep looking directly at the moving planet
      const startQuat = state.camera.quaternion.clone()
      state.camera.lookAt(planetPos)
      const endQuat = state.camera.quaternion.clone()
      state.camera.quaternion.copy(startQuat).slerp(endQuat, delta * 4)
    }
  })

  // Smooth scaling lerp if selected vs hovered
  const targetScale = selected ? 1.5 : 1.0
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Orbit Trail (Optional UI detail) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0,0,0]}>
         {/* Render a thin ring at origin representing the orbit path? Actually wait, the group is already translated.
             A global orbit path belongs in SolarSystemScene. */}
      </mesh>

      {/* The Planet Mesh */}
      <mesh
        ref={planetRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick(data.id)
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshStandardMaterial 
          color={data.color} 
          roughness={0.7} 
          metalness={0.2}
          emissive={data.color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Saturn Ring if applicable */}
      {data.hasRings && (
        <mesh rotation={[-Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[data.size * 1.5, data.size * 2.2, 64]} />
          <meshStandardMaterial color={data.color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Mini Name Label (Visible only when not selected) */}
      <Html 
        position={[0, data.size + 0.5, 0]} 
        center 
        style={{ transition: 'all 0.3s', opacity: selected ? 0 : 0.6, pointerEvents: 'none' }}
      >
        <div style={{
          color: 'var(--text-primary)',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          {data.name}
        </div>
      </Html>

      {/* Glassmorphic Info Card (Visible when selected) */}
      <Html position={[data.size * 1.5, data.size, 0]} zIndexRange={[100, 0]}>
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring', bounce: 0.3 }}
              style={{
                width: '320px',
                padding: '1.5rem',
                background: 'rgba(5, 10, 15, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${data.color}40`,
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'Space Mono, monospace',
                boxShadow: `0 8px 32px 0 rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)`,
                pointerEvents: 'auto',
                cursor: 'default'
              }}
            >
              <h2 style={{ 
                margin: '0 0 0.5rem 0', 
                fontFamily: 'Orbitron, sans-serif', 
                fontSize: '1.25rem', 
                color: data.color,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {data.name}
              </h2>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ATMOSPHERE:</span> <span style={{ color: data.color }}>{data.atmosphere}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TEMPERATURE:</span> <span>{data.temperature}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>POPULATION:</span> <span>{data.population}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DISCOVERED:</span> <span>{data.discoveryCycle}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.6', opacity: 0.9, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                {data.desc}
              </p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onClick(null); }}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  letterSpacing: '2px',
                  fontSize: '0.7rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              >
                UNLINK FEED
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>
    </group>
  )
}
