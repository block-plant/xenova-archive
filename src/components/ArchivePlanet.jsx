import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function PlanetMesh() {
  const meshRef = useRef()
  const moonRef = useRef()
  const moonPivotRef = useRef()

  const planetTexture = useTexture('/images/planet.jpg')
  const moonTexture = useTexture('/images/moon.jpg')

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) meshRef.current.rotation.y = t * 0.045
    if (moonPivotRef.current) moonPivotRef.current.rotation.y = t * 0.25
    if (moonRef.current) moonRef.current.rotation.y = t * 0.1
  })

  return (
    <>
      {/* ── LIGHTING ── */}
      <ambientLight intensity={0.3} />

      <directionalLight
        color="#fff6e8"
        intensity={4.0}
        position={[-6, 2, 5]}
      />

      <pointLight
        color="#c8e8ff"
        intensity={0.6}
        distance={20}
        position={[6, -2, -6]}
      />

      {/* ── PLANET ── */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={planetTexture}
          roughness={0.85}
          metalness={0.04}
        />
      </mesh>

      {/* ── RINGS ── */}
      <mesh rotation={[Math.PI / 2.5, 0.05, 0.25]}>
        <torusGeometry args={[3.05, 0.055, 2, 220]} />
        <meshBasicMaterial color="#00FFD1" transparent opacity={0.42} />
      </mesh>

      <mesh rotation={[Math.PI / 2.5, 0.05, 0.25]}>
        <torusGeometry args={[3.40, 0.032, 2, 220]} />
        <meshBasicMaterial color="#7AAFC4" transparent opacity={0.20} />
      </mesh>

      <mesh rotation={[Math.PI / 2.5, 0.05, 0.25]}>
        <torusGeometry args={[3.72, 0.018, 2, 220]} />
        <meshBasicMaterial color="#00FFD1" transparent opacity={0.09} />
      </mesh>

      <mesh rotation={[Math.PI / 2.5, 0.05, 0.25]}>
        <torusGeometry args={[4.05, 0.010, 2, 220]} />
        <meshBasicMaterial color="#00FFD1" transparent opacity={0.04} />
      </mesh>

      {/* ── MOON ── */}
      <group ref={moonPivotRef}>
        <mesh ref={moonRef} position={[4.2, 0.3, 0]}>
          <sphereGeometry args={[0.28, 64, 64]} />
          <meshStandardMaterial
            map={moonTexture}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </group>
    </>
  )
}

export default function Planet() {
  return (
    <div
      style={{
        position: 'absolute',
        right: '-5%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '780px',
        height: '780px',
        zIndex: 1,
        cursor: 'grab',
        overflow: 'visible',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.2, 20], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ overflow: 'visible' }}
      >
        <PlanetMesh />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          rotateSpeed={0.45}
          zoomSpeed={0.5}
          minDistance={4}
          maxDistance={12}
        />
      </Canvas>
    </div>
  )
}

useTexture.preload('/images/planet.jpg')
useTexture.preload('/images/moon.jpg')