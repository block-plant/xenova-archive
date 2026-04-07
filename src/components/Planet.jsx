import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Pseudo-noise using trig — no library needed
function noise(x, y, seed = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453
  return s - Math.floor(s)
}

function smoothNoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = noise(ix,     iy,     seed)
  const b = noise(ix + 1, iy,     seed)
  const c = noise(ix,     iy + 1, seed)
  const d = noise(ix + 1, iy + 1, seed)
  return a + (b - a) * ux + (c - a) * uy + (d - c) * ux * uy + (b - a) * ux - (b - a) * ux * uy
}

function fbm(x, y, seed, octaves = 6) {
  let val = 0, amp = 0.5, freq = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x * freq, y * freq, seed + i * 100) * amp
    max += amp
    amp *= 0.5
    freq *= 2.1
  }
  return val / max
}

function buildPlanetTexture() {
  const W = 1024, H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  const d = img.data

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W
      const v = y / H

      // Spherical UV → 3D coords for sampling
      const sx = Math.cos(v * Math.PI) * Math.cos(u * Math.PI * 2)
      const sy = Math.sin(v * Math.PI)
      const sz = Math.cos(v * Math.PI) * Math.sin(u * Math.PI * 2)

      const elevation = fbm(sx * 3 + 2, sy * 3 + sz * 2, 42)
      const moisture  = fbm(sx * 2 + 5, sy * 2 + sz * 3, 137)
      const detail    = fbm(sx * 8,     sy * 8 + sz * 8, 999)
      const veins     = fbm(sx * 12,    sy * 12 + sz * 6, 77)

      let r, g, b

      if (elevation < 0.38) {
        // Deep ocean
        r = 0; g = 15 + elevation * 30 | 0; b = 25 + elevation * 40 | 0
      } else if (elevation < 0.44) {
        // Shallow coastal / reef glow
        const t = (elevation - 0.38) / 0.06
        r = 0; g = (20 + t * 60) | 0; b = (30 + t * 50) | 0
        // Bioluminescent coast tint
        if (veins > 0.62) { r = 0; g = Math.min(255, g + 80) | 0; b = Math.min(200, b + 60) | 0 }
      } else if (elevation < 0.52) {
        // Low land — mossy green
        const t = (elevation - 0.44) / 0.08
        r = (5  + moisture * 15) | 0
        g = (50 + moisture * 40 + t * 30 + detail * 20) | 0
        b = (20 + moisture * 20) | 0
      } else if (elevation < 0.62) {
        // Mid highlands
        const t = (elevation - 0.52) / 0.10
        r = (8  + detail * 15) | 0
        g = (70 + t * 20 + detail * 25) | 0
        b = (30 + detail * 10) | 0
      } else if (elevation < 0.72) {
        // Rocky highlands
        const t = (elevation - 0.62) / 0.10
        r = (15 + t * 20 + detail * 20) | 0
        g = (60 + t * 10 + detail * 15) | 0
        b = (25 + detail * 10) | 0
      } else {
        // Mountain peaks — faint ice/crystal teal
        const t = (elevation - 0.72) / 0.28
        r = (20 + t * 30) | 0
        g = (80 + t * 60) | 0
        b = (60 + t * 80) | 0
      }

      // Bioluminescent vein network overlay
      if (veins > 0.68 && elevation > 0.38) {
        const intensity = (veins - 0.68) / 0.32
        r = Math.min(255, r + (0   * intensity)) | 0
        g = Math.min(255, g + (180 * intensity)) | 0
        b = Math.min(255, b + (130 * intensity)) | 0
      }

      // Glowing city dots on landmass
      const cityNoise = fbm(sx * 20, sy * 20 + sz * 15, 333)
      if (cityNoise > 0.78 && elevation > 0.44 && elevation < 0.65) {
        r = Math.min(255, r + 100) | 0
        g = Math.min(255, g + 255) | 0
        b = Math.min(255, b + 180) | 0
      }

      const i = (y * W + x) * 4
      d[i]   = r
      d[i+1] = g
      d[i+2] = b
      d[i+3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  return new THREE.CanvasTexture(canvas)
}

function buildEmissiveMap() {
  const W = 1024, H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  const d = img.data

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H
      const sx = Math.cos(v * Math.PI) * Math.cos(u * Math.PI * 2)
      const sy = Math.sin(v * Math.PI)
      const sz = Math.cos(v * Math.PI) * Math.sin(u * Math.PI * 2)
      const elevation = fbm(sx * 3 + 2, sy * 3 + sz * 2, 42)
      const veins     = fbm(sx * 12, sy * 12 + sz * 6, 77)
      const city      = fbm(sx * 20, sy * 20 + sz * 15, 333)

      let r = 0, g = 0, b = 0

      // Vein glow
      if (veins > 0.68 && elevation > 0.38) {
        const t = (veins - 0.68) / 0.32
        g = (t * 200) | 0
        b = (t * 150) | 0
      }

      // City glow
      if (city > 0.78 && elevation > 0.44 && elevation < 0.65) {
        r = 0; g = 255; b = 180
      }

      const i = (y * W + x) * 4
      d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  return new THREE.CanvasTexture(canvas)
}

function PlanetMesh() {
  const meshRef   = useRef()
  const glowRef   = useRef()
  const cloudRef  = useRef()
  const pivotRef  = useRef()

  const { colorMap, emissiveMap } = useMemo(() => ({
    colorMap:    buildPlanetTexture(),
    emissiveMap: buildEmissiveMap(),
  }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current)  meshRef.current.rotation.y  = t * 0.05
    if (cloudRef.current) cloudRef.current.rotation.y = t * 0.065
    if (pivotRef.current) pivotRef.current.rotation.y = t * 0.22
    if (glowRef.current)  glowRef.current.material.opacity = 0.20 + Math.sin(t * 0.7) * 0.07
  })

  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.12} />
      {/* Bright key — simulates distant star */}
      <directionalLight color="#fff8f0" intensity={3.5} position={[-5, 2, 4]} />
      {/* Teal rim light from back */}
      <pointLight color="#00FFD1" intensity={1.2} distance={18} position={[5, -1, -5]} />
      {/* Warm amber fill */}
      <pointLight color="#FFB347" intensity={0.6} distance={15} position={[4, 5, 2]} />

      {/* ── Planet surface ── */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 256, 256]} />
        <meshStandardMaterial
          map={colorMap}
          emissiveMap={emissiveMap}
          emissive="#00FFD1"
          emissiveIntensity={0.35}
          roughness={0.88}
          metalness={0.04}
        />
      </mesh>

      {/* ── Thin cloud layer ── */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[2.035, 64, 64]} />
        <meshStandardMaterial
          color="#c8fff4"
          transparent opacity={0.055}
          depthWrite={false}
          roughness={1}
        />
      </mesh>

      {/* ── Atmosphere inner glow ── */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.20, 64, 64]} />
        <meshBasicMaterial
          color="#00FFD1"
          transparent opacity={0.20}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Outer haze ── */}
      <mesh>
        <sphereGeometry args={[2.50, 64, 64]} />
        <meshBasicMaterial
          color="#003322"
          transparent opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Rings ── */}
      <mesh rotation={[Math.PI / 2.5, 0.05, 0.25]}>
        <torusGeometry args={[3.0, 0.065, 2, 200]} />
        <meshBasicMaterial color="#00FFD1" transparent opacity={0.40} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.05, 0.25]}>
        <torusGeometry args={[3.45, 0.035, 2, 200]} />
        <meshBasicMaterial color="#7AAFC4" transparent opacity={0.18} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.05, 0.25]}>
        <torusGeometry args={[3.85, 0.018, 2, 200]} />
        <meshBasicMaterial color="#00FFD1" transparent opacity={0.07} />
      </mesh>

      {/* ── Orbiting moon ── */}
      <group ref={pivotRef}>
        <mesh position={[4.0, 0.3, 0]}>
          <sphereGeometry args={[0.26, 32, 32]} />
          <meshStandardMaterial
            color="#1a3d2e"
            emissive="#00FFD1"
            emissiveIntensity={0.5}
            roughness={1}
          />
        </mesh>
        <mesh position={[4.0, 0.3, 0]}>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshBasicMaterial color="#00FFD1" transparent opacity={0.07} side={THREE.BackSide} />
        </mesh>
      </group>
    </>
  )
}

function Planet() {
  return (
    <div style={{
      position: 'absolute',
      right: '-2%',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '600px',
      height: '600px',
      zIndex: 1,
      cursor: 'grab',
    }}>
      <Canvas
        camera={{ position: [0, 1.2, 7.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <PlanetMesh />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.45}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}

export default Planet