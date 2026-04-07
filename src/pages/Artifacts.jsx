// src/pages/Artifacts.jsx — THE VOID CHAMBERS (v2: Alien World + Sacred Geometry)
// Dependencies: three, @react-three/fiber, @react-three/drei, framer-motion, react-router-dom

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"
import { artifacts } from "../data/artifacts"

// ── UTILITY ──────────────────────────────────────────────────
function rgba(hex, a) {
  if (!hex || hex.length < 7) return `rgba(0,255,209,${a})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function hexToVec3(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return new THREE.Color(r, g, b)
}

// ── 8 SUBTLE PARTICLE SYSTEMS (background canvas) ────────────
function drawHelix(ctx, w, h, t, color) {
  const cx = w / 2
  for (let i = 0; i < 60; i++) {
    const y = h * 0.08 + h * 0.84 * (i / 60)
    const phase = (i / 60) * Math.PI * 8 + t * 0.8
    const spread = Math.min(w, h) * 0.08
    const x1 = cx + Math.cos(phase) * spread
    const x2 = cx + Math.cos(phase + Math.PI) * spread
    const bright = 0.3 + 0.7 * Math.abs(Math.sin(phase))
    ctx.fillStyle = rgba(color, bright * 0.25)
    ctx.beginPath(); ctx.arc(x1, y, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x2, y, 1.5, 0, Math.PI * 2); ctx.fill()
  }
}
function drawMatrix(ctx, w, h, t, color) {
  ctx.font = '10px monospace'
  const cols = Math.floor(w / 28)
  const chars = '01ΞΩΛΣΦΨ∞∂∆↯'
  for (let c = 0; c < cols; c++) {
    const x = c * 28 + 14
    const offset = Math.sin(c * 1.7) * 600
    for (let r = 0; r < 12; r++) {
      const y = ((offset + r * 48 + t * 45 * (0.5 + (c % 5) * 0.12)) % (h + 80)) - 30
      ctx.fillStyle = rgba(color, Math.max(0, (1 - r / 12) * 0.2))
      ctx.fillText(chars[(c * 7 + r * 13) % chars.length], x - 6, y)
    }
  }
}
function drawVortex(ctx, w, h, t, color) {
  const cx = w / 2, cy = h / 2, maxR = Math.min(w, h) * 0.44
  for (let i = 0; i < 180; i++) {
    const p = ((i / 180) + t * 0.07) % 1
    const angle = p * Math.PI * 14
    const r = (1 - p) * maxR
    ctx.fillStyle = rgba(color, p * 0.3)
    ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.55, 0.5 + p * 2, 0, Math.PI * 2); ctx.fill()
  }
}
function drawRays(ctx, w, h, t, color) {
  const cx = w / 2, cy = h / 2
  for (let r = 0; r < 14; r++) {
    const angle = (r / 14) * Math.PI * 2 + t * 0.18
    for (let d = 0; d < 35; d++) {
      const dist = 25 + d * Math.min(w, h) / 120
      ctx.fillStyle = rgba(color, (1 - d / 35) * 0.15)
      ctx.beginPath()
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
function drawPulse(ctx, w, h, t, color) {
  const cx = w / 2, cy = h / 2, maxR = Math.min(w, h) * 0.43
  for (let ring = 0; ring < 5; ring++) {
    const phase = ((t * 0.45 + ring / 5) % 1)
    ctx.strokeStyle = rgba(color, (1 - phase) * 0.2); ctx.lineWidth = 1.5 * (1 - phase) + 0.3
    ctx.beginPath(); ctx.arc(cx, cy, phase * maxR, 0, Math.PI * 2); ctx.stroke()
  }
}
function drawCascade(ctx, w, h, t, color) {
  for (let i = 0; i < 80; i++) {
    const s = i * 137.508
    const x = (Math.sin(s) * 0.5 + 0.5) * w
    const speed = 0.8 + (i % 5) * 0.28
    const y = ((Math.cos(s * 0.7) * 500 + t * speed * 60 + i * 45) % (h + 100)) - 20
    ctx.fillStyle = rgba(color, 0.15)
    ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill()
  }
}
function drawGalaxy(ctx, w, h, t, color) {
  const cx = w / 2, cy = h / 2
  for (let arm = 0; arm < 3; arm++) {
    const aOff = (arm / 3) * Math.PI * 2
    for (let i = 0; i < 100; i++) {
      const r = i * Math.min(w, h) / 340
      const angle = aOff + i * 0.12 + t * 0.05
      const x = cx + Math.cos(angle) * r + Math.sin(i * 127.3) * r * 0.18
      const y = cy + Math.sin(angle) * r * 0.44
      const alpha = Math.max(0, 0.45 - r / (Math.min(w, h) * 0.5))
      ctx.fillStyle = rgba(color, alpha * 0.4)
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
    }
  }
}
function drawDrift(ctx, w, h, t, color) {
  for (let i = 0; i < 70; i++) {
    const s = i * 127.3
    const bx = (Math.sin(s) * 0.5 + 0.5) * w
    const by = (Math.cos(s * 1.7) * 0.5 + 0.5) * h
    const x = (bx + Math.sin(t * 0.18 + s) * 50) % w
    const y = (by + Math.cos(t * 0.13 + s * 1.3) * 50) % h
    const life = Math.sin(t * 0.35 + i * 0.7) * 0.5 + 0.5
    ctx.fillStyle = rgba(color, life * 0.18)
    ctx.beginPath(); ctx.arc(x, y, life * 1.8, 0, Math.PI * 2); ctx.fill()
  }
}
const DRAW_FNS = [drawHelix, drawMatrix, drawVortex, drawRays, drawPulse, drawCascade, drawGalaxy, drawDrift]

function useParticleCanvas(artifact, index) {
  const canvasRef = useRef()
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const startTime = Date.now()
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const drawFn = DRAW_FNS[index % 8]
    const loop = () => {
      const t = (Date.now() - startTime) / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawFn(ctx, canvas.width, canvas.height, t, artifact.glowColor)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [artifact, index])
  return canvasRef
}

// ── 3D PLANET ENVIRONMENT ─────────────────────────────────────

// Alien terrain ground mesh
function AlienGround({ color }) {
  const meshRef = useRef()
  const geo = useRef()

  useEffect(() => {
    if (!geo.current) return
    const pos = geo.current.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      const y = Math.sin(x * 0.4) * 0.8 + Math.cos(z * 0.3) * 0.6 +
        Math.sin(x * 1.2 + z * 0.8) * 0.3 + Math.cos(x * 0.7 - z * 1.1) * 0.4
      pos.setY(i, y - 2.2)
    }
    pos.needsUpdate = true
    geo.current.computeVertexNormals()
  }, [])

  useFrame((_, delta) => {
    // subtle shimmer
  })

  const c = hexToVec3(color)
  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]} receiveShadow>
      <planeGeometry ref={geo} args={[80, 80, 80, 80]} />
      <meshStandardMaterial
        color={new THREE.Color(c.r * 0.06, c.g * 0.06, c.b * 0.06)}
        emissive={new THREE.Color(c.r * 0.04, c.g * 0.04, c.b * 0.04)}
        wireframe={false}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}

// Glowing grid lines on the ground
function GridLines({ color }) {
  const c = hexToVec3(color)
  return (
    <gridHelper
      args={[80, 40, new THREE.Color(c.r * 0.4, c.g * 0.4, c.b * 0.4), new THREE.Color(c.r * 0.12, c.g * 0.12, c.b * 0.12)]}
      position={[0, -2.15, 0]}
    />
  )
}

// Distant orbiting planet in the sky
function OrbitalPlanet({ color, index }) {
  const meshRef = useRef()
  const startAngle = index * 1.2

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.04 + startAngle
    meshRef.current.position.x = Math.cos(t) * 35
    meshRef.current.position.z = Math.sin(t) * 15 - 20
    meshRef.current.rotation.y += 0.003
  })

  const c = hexToVec3(color)
  const size = 3.5 + (index % 3) * 1.2

  return (
    <mesh ref={meshRef} position={[30, 8, -30]} castShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={new THREE.Color(c.r * 0.15, c.g * 0.15, c.b * 0.15)}
        emissive={new THREE.Color(c.r * 0.35, c.g * 0.35, c.b * 0.35)}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}

// Atmospheric rings around the orbital planet
function PlanetRings({ color, index }) {
  const ref = useRef()
  const startAngle = index * 1.2

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.04 + startAngle
    ref.current.position.x = Math.cos(t) * 35
    ref.current.position.z = Math.sin(t) * 15 - 20
    ref.current.rotation.z += 0.002
  })

  const c = hexToVec3(color)
  return (
    <mesh ref={ref} position={[30, 8, -30]} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[5.5 + (index % 3) * 1.2, 0.25, 4, 64]} />
      <meshStandardMaterial
        color={new THREE.Color(c.r * 0.5, c.g * 0.5, c.b * 0.5)}
        emissive={new THREE.Color(c.r * 0.6, c.g * 0.6, c.b * 0.6)}
        transparent
        opacity={0.55}
      />
    </mesh>
  )
}

// Floating crystal spires on the terrain
function CrystalSpire({ position, color, scale = 1 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.2 * scale
  })
  const c = hexToVec3(color)
  return (
    <mesh ref={ref} position={position} castShadow>
      <coneGeometry args={[0.12 * scale, 1.8 * scale, 5]} />
      <meshStandardMaterial
        color={new THREE.Color(c.r * 0.3, c.g * 0.3, c.b * 0.3)}
        emissive={new THREE.Color(c.r * 0.5, c.g * 0.5, c.b * 0.5)}
        transparent
        opacity={0.7}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  )
}

// Artifact pedestal
function Pedestal({ color }) {
  const c = hexToVec3(color)
  return (
    <group position={[0, -2.2, 0]}>
      {/* Base disc */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.15, 32]} />
        <meshStandardMaterial
          color={new THREE.Color(0.04, 0.06, 0.1)}
          emissive={new THREE.Color(c.r * 0.12, c.g * 0.12, c.b * 0.12)}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      {/* Column */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 1.5, 16]} />
        <meshStandardMaterial
          color={new THREE.Color(0.06, 0.08, 0.14)}
          emissive={new THREE.Color(c.r * 0.1, c.g * 0.1, c.b * 0.1)}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>
      {/* Top platform */}
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.6, 0.35, 0.12, 32]} />
        <meshStandardMaterial
          color={new THREE.Color(c.r * 0.15, c.g * 0.15, c.b * 0.15)}
          emissive={new THREE.Color(c.r * 0.4, c.g * 0.4, c.b * 0.4)}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, 1.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.025, 8, 64]} />
        <meshStandardMaterial
          color={new THREE.Color(c.r, c.g, c.b)}
          emissive={new THREE.Color(c.r, c.g, c.b)}
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  )
}

// ── 8 SACRED GEOMETRY ARTIFACT MESHES ────────────────────────
const GEOMETRY_CONFIGS = [
  // 0 - Seed Lattice: Icosahedron (sacred seed of life)
  { type: 'icosahedron', args: [1.1, 1] },
  // 1 - Codex Fragment: OctahedronGeometry (angular knowledge shard)
  { type: 'octahedron', args: [1.2, 0] },
  // 2 - Strain Omega: TorusKnot (corrupted, tangled)
  { type: 'torusKnot', args: [0.8, 0.28, 180, 20, 3, 7] },
  // 3 - Vex'al Light Prism: Dodecahedron (perfect 12-faced light)
  { type: 'dodecahedron', args: [1.1, 0] },
  // 4 - Bio-Synthetic Heart: Torus (closed loop, eternal)
  { type: 'torus', args: [0.9, 0.4, 24, 64] },
  // 5 - Cascade Emitter: TorusKnot (flowing cascade, p2,q3)
  { type: 'torusKnot', args: [0.75, 0.25, 160, 16, 2, 3] },
  // 6 - Genesis Engine: Icosahedron detail-2 (complex generator)
  { type: 'icosahedron', args: [1.1, 2] },
  // 7 - The Last Breath: Tetrahedron (simplest form, dying)
  { type: 'tetrahedron', args: [1.3, 2] },
]

function buildGeometry(cfg) {
  switch (cfg.type) {
    case 'icosahedron': return new THREE.IcosahedronGeometry(...cfg.args)
    case 'octahedron': return new THREE.OctahedronGeometry(...cfg.args)
    case 'torusKnot': return new THREE.TorusKnotGeometry(...cfg.args)
    case 'dodecahedron': return new THREE.DodecahedronGeometry(...cfg.args)
    case 'torus': return new THREE.TorusGeometry(...cfg.args)
    case 'tetrahedron': return new THREE.TetrahedronGeometry(...cfg.args)
    default: return new THREE.IcosahedronGeometry(1, 1)
  }
}

function ArtifactModel({ artifact, index }) {
  const meshRef = useRef()
  const wireRef = useRef()
  const glowRef = useRef()
  const color = hexToVec3(artifact.glowColor)

  const geo = buildGeometry(GEOMETRY_CONFIGS[index % 8])

  // Slow auto-rotate, user can also orbit
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    meshRef.current.rotation.y = t * 0.28
    meshRef.current.rotation.x = Math.sin(t * 0.18) * 0.25
    meshRef.current.position.y = -0.35 + Math.sin(t * 0.6) * 0.12

    wireRef.current.rotation.y = -t * 0.18
    wireRef.current.rotation.z = t * 0.12

    // pulsing emissive
    const pulse = 0.6 + Math.sin(t * 2.2) * 0.35
    meshRef.current.material.emissiveIntensity = pulse
    glowRef.current.material.emissiveIntensity = pulse * 1.8
  })

  return (
    <group position={[0, -0.35, 0]}>
      {/* Main solid mesh */}
      <mesh ref={meshRef} geometry={geo} castShadow>
        <meshStandardMaterial
          color={new THREE.Color(color.r * 0.12, color.g * 0.12, color.b * 0.12)}
          emissive={new THREE.Color(color.r, color.g, color.b)}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.85}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireRef} geometry={geo} scale={1.02}>
        <meshBasicMaterial
          color={new THREE.Color(color.r, color.g, color.b)}
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* Inner glow core — slightly smaller */}
      <mesh ref={glowRef} geometry={geo} scale={0.62}>
        <meshStandardMaterial
          color={new THREE.Color(color.r, color.g, color.b)}
          emissive={new THREE.Color(color.r, color.g, color.b)}
          emissiveIntensity={2}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  )
}

// Floating energy particles around the artifact
function ArtifactParticles({ color }) {
  const ref = useRef()
  const count = 80
  const positions = useRef(
    new Float32Array(count * 3).map((_, i) => {
      const idx = Math.floor(i / 3)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 1.5 + Math.random() * 1.2
      if (i % 3 === 0) return r * Math.sin(phi) * Math.cos(theta)
      if (i % 3 === 1) return r * Math.cos(phi)
      return r * Math.sin(phi) * Math.sin(theta)
    })
  )
  const speeds = useRef(new Float32Array(count).map(() => 0.2 + Math.random() * 0.6))
  const phases = useRef(new Float32Array(count).map(() => Math.random() * Math.PI * 2))

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pos = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      const theta = phases.current[i] + t * speeds.current[i] * 0.4
      const r = 1.6 + Math.sin(t * speeds.current[i] + i) * 0.4
      const base_y = positions.current[i * 3 + 1]
      pos.setXYZ(
        i,
        r * Math.cos(theta),
        base_y + Math.sin(t * speeds.current[i] * 0.5) * 0.3,
        r * Math.sin(theta)
      )
    }
    pos.needsUpdate = true
  })

  const c = hexToVec3(color)
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.current}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={new THREE.Color(c.r, c.g, c.b)}
        size={0.045}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

// Atmospheric haze / fog layer near horizon
function AtmosphericHaze({ color }) {
  const c = hexToVec3(color)
  return (
    <>
      {/* Horizon glow */}
      <mesh position={[0, -1.8, -30]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 8]} />
        <meshBasicMaterial
          color={new THREE.Color(c.r * 0.3, c.g * 0.3, c.b * 0.3)}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Nebula cloud left */}
      <mesh position={[-18, 4, -28]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(c.r * 0.2, c.g * 0.2, c.b * 0.2)}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Nebula cloud right */}
      <mesh position={[22, 6, -35]}>
        <sphereGeometry args={[10, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(c.r * 0.15, c.g * 0.15, c.b * 0.15)}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}

// Full 3D scene
function AlienWorldScene({ artifact, index }) {
  const color = artifact.glowColor
  const c = hexToVec3(color)

  // Spire positions
  const spires = [
    [-6, -2.2, -4], [7, -2.2, -6], [-10, -2.2, -10], [11, -2.2, -12],
    [-4, -2.2, -14], [8, -2.2, -3], [-14, -2.2, -7], [15, -2.2, -16],
  ]

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.8, 6.5]} fov={52} />

      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.08} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={0.6}
        color={new THREE.Color(c.r * 0.4 + 0.6, c.g * 0.4 + 0.6, c.b * 0.4 + 0.6)}
        castShadow
      />
      {/* Colored fill from below */}
      <pointLight position={[0, -1.5, 0]} intensity={1.8} color={new THREE.Color(c.r, c.g, c.b)} distance={8} />
      {/* Artifact key light */}
      <pointLight position={[0, 2, 3]} intensity={0.9} color={new THREE.Color(c.r * 0.6 + 0.4, c.g * 0.6 + 0.4, c.b * 0.6 + 0.4)} distance={12} />

      {/* Stars */}
      <Stars radius={120} depth={60} count={3000} factor={3} saturation={0.4} fade speed={0.4} />

      {/* Fog */}
      <fog attach="fog" args={['#050810', 28, 70]} />

      {/* Environment */}
      <AlienGround color={color} />
      <GridLines color={color} />
      <AtmosphericHaze color={color} />

      {/* Crystal spires */}
      {spires.map((pos, i) => (
        <CrystalSpire key={i} position={pos} color={color} scale={0.6 + (i % 3) * 0.4} />
      ))}

      {/* Orbiting planet + rings */}
      <OrbitalPlanet color={color} index={index} />
      <PlanetRings color={color} index={index} />

      {/* Pedestal */}
      <Pedestal color={color} />

      {/* Sacred geometry artifact on pedestal */}
      <group position={[0, 0.2, 0]}>
        <ArtifactModel artifact={artifact} index={index} />
        <ArtifactParticles color={color} />
      </group>

      {/* OrbitControls — user can drag/rotate the camera */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3.5}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
      />
    </>
  )
}

// ── CUSTOM CURSOR ─────────────────────────────────────────────
function CustomCursor() {
  const cx = useMotionValue(-100), cy = useMotionValue(-100)
  const sx = useSpring(cx, { stiffness: 120, damping: 22 })
  const sy = useSpring(cy, { stiffness: 120, damping: 22 })
  const dx = useSpring(cx, { stiffness: 500, damping: 40 })
  const dy = useSpring(cy, { stiffness: 500, damping: 40 })
  useEffect(() => {
    const m = e => { cx.set(e.clientX); cy.set(e.clientY) }
    window.addEventListener('mousemove', m)
    return () => window.removeEventListener('mousemove', m)
  }, [])
  return (
    <>
      <motion.div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none', x: dx, y: dy, translateX: '-50%', translateY: '-50%', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00FFD1', boxShadow: '0 0 10px #00FFD1' }} />
      <motion.div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none', x: sx, y: sy, translateX: '-50%', translateY: '-50%', width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(0,255,209,0.5)', mixBlendMode: 'difference' }} />
    </>
  )
}

// ── WARP FLASH ────────────────────────────────────────────────
function WarpFlash({ color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.75, 0.75, 0], scale: [0.1, 1, 1.8, 4] }}
      transition={{ duration: 0.75, times: [0, 0.25, 0.6, 1], ease: 'easeOut' }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, pointerEvents: 'none', background: `radial-gradient(circle, ${color}cc 0%, ${color}33 35%, transparent 70%)` }}
    />
  )
}

// ── LORE PANEL ────────────────────────────────────────────────
function LorePanel({ artifact, onClose }) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      style={{ position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 300, width: 'min(600px,90vw)', background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(28px)', borderLeft: `1px solid ${artifact.glowColor}44`, overflowY: 'auto', cursor: 'none' }}
    >
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .8, delay: .3 }}
        style={{ height: 2, background: `linear-gradient(to right,transparent,${artifact.glowColor},transparent)`, boxShadow: `0 0 16px ${artifact.glowColor}`, transformOrigin: 'left' }} />

      <div style={{ padding: '44px 48px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 28, background: 'none', border: '1px solid rgba(122,175,196,0.3)', color: '#7AAFC4', fontFamily: 'monospace', fontSize: 14, width: 34, height: 34, cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <p style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.3em', marginBottom: 10 }}>{artifact.codexId} · {artifact.type}</p>
        <h2 style={{ color: '#E8F4F8', fontFamily: 'serif', fontSize: 36, letterSpacing: '.03em', marginBottom: 6, lineHeight: 1.1 }}>{artifact.name}</h2>
        <p style={{ color: artifact.eraColor, fontFamily: 'monospace', fontSize: 11, letterSpacing: '.3em', marginBottom: 32 }}>{artifact.era} · {artifact.rarity}</p>

        <div style={{ height: 180, backgroundColor: '#050810', border: `1px solid ${artifact.glowColor}22`, borderRadius: 2, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse,${artifact.glowColor}0c,transparent 70%)` }} />
          {[100, 72, 48].map((sz, i) => (
            <motion.div key={i} animate={{ rotate: i % 2 === 0 ? 360 : -360 }} transition={{ duration: 8 + i * 5, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', width: sz, height: sz, border: `1px solid ${artifact.glowColor}${i === 0 ? '44' : i === 1 ? '28' : '18'}`, borderRadius: '50%', borderTopColor: i === 0 ? artifact.glowColor : 'transparent' }} />
          ))}
          <motion.div animate={{ scale: [1, 1.12, 1], boxShadow: [`0 0 20px ${artifact.glowColor}55`, `0 0 40px ${artifact.glowColor}99`, `0 0 20px ${artifact.glowColor}55`] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ width: 56, height: 56, borderRadius: '50%', zIndex: 2, background: `radial-gradient(circle at 35% 35%,${artifact.glowColor}cc,${artifact.glowColor}22)`, border: `2px solid ${artifact.glowColor}` }} />
          <div className="scanline" style={{ background: `linear-gradient(transparent,${artifact.glowColor}44,transparent)` }} />
        </div>

        <p style={{ color: '#E8F4F8', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.9, marginBottom: 24 }}>{artifact.description}</p>
        <div style={{ borderTop: `1px solid ${artifact.glowColor}22`, paddingTop: 20, marginBottom: 24 }}>
          <p style={{ color: artifact.glowColor, fontFamily: 'monospace', fontSize: 10, letterSpacing: '.25em', marginBottom: 12 }}>ARCHIVE NOTES:</p>
          <p style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.9, fontStyle: 'italic' }}>{artifact.details}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid rgba(122,175,196,0.08)' }}>
          <span style={{ color: artifact.glowColor, fontFamily: 'monospace', fontSize: 11, letterSpacing: '.2em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.span animate={{ opacity: [1, .2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: artifact.glowColor, boxShadow: `0 0 8px ${artifact.glowColor}` }} />
            STATUS: {artifact.status}
          </span>
          <span style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 10 }}>CLICK OUTSIDE TO CLOSE</span>
        </div>
      </div>
    </motion.div>
  )
}

// ── CHAMBER ───────────────────────────────────────────────────
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

function Chamber({ artifact, index, direction, onExamine }) {
  const canvasRef = useParticleCanvas(artifact, index)

  const variants = {
    enter: d => ({ opacity: 0, scale: .94, filter: 'blur(22px)', x: d > 0 ? 50 : -50 }),
    center: { opacity: 1, scale: 1, filter: 'blur(0px)', x: 0 },
    exit: d => ({ opacity: 0, scale: .96, filter: 'blur(16px)', x: d < 0 ? 50 : -50 }),
  }

  return (
    <motion.div
      key={artifact.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: .65, ease: [0.215, 0.61, 0.355, 1] }}
      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
    >
      {/* 3D Scene — fills the entire background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#050810' }}
        >
          <Suspense fallback={null}>
            <AlienWorldScene artifact={artifact} index={index} />
          </Suspense>
        </Canvas>
      </div>

      {/* Subtle particle canvas on top (very low opacity) */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.35 }}
      />

      {/* Vignette overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,8,16,0.55) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top,rgba(5,8,16,0.9),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '22%', background: 'linear-gradient(to bottom,rgba(5,8,16,0.75),transparent)', pointerEvents: 'none' }} />

      {/* Chamber title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .3, duration: .7 }}
        style={{ position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: '1em' }}
          animate={{ opacity: 1, letterSpacing: '.5em' }}
          transition={{ delay: .35, duration: .9 }}
          style={{ color: `${artifact.glowColor}88`, fontFamily: 'monospace', fontSize: 10, letterSpacing: '.5em', marginBottom: 12 }}
        >
          DIMENSIONAL CHAMBER {ROMAN[index]}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .5, duration: .7, ease: [.215, .61, .355, 1] }}
          style={{ color: '#E8F4F8', fontFamily: 'serif', fontSize: 'clamp(24px,4vw,52px)', fontWeight: 700, letterSpacing: '.06em', margin: 0, textShadow: `0 0 60px ${artifact.glowColor}44` }}
        >
          {artifact.name}
        </motion.h2>
      </motion.div>

      {/* Drag hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: .8 }}
        style={{ position: 'absolute', top: '50%', left: 28, transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <p style={{ color: `${artifact.glowColor}44`, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.25em', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          DRAG TO ORBIT · SCROLL TO ZOOM
        </p>
      </motion.div>

      {/* Bottom info bar */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .45, duration: .7 }}
        style={{ position: 'absolute', bottom: 72, left: 52, right: 52, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}
      >
        <div>
          <p style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.2em', marginBottom: 5 }}>{artifact.codexId}</p>
          <p style={{ color: artifact.eraColor, fontFamily: 'monospace', fontSize: 10, letterSpacing: '.3em', marginBottom: 5 }}>{artifact.era}</p>
          <p style={{ color: `${artifact.glowColor}99`, fontFamily: 'monospace', fontSize: 10, letterSpacing: '.2em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.span animate={{ opacity: [1, .15, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: artifact.glowColor, display: 'inline-block', boxShadow: `0 0 6px ${artifact.glowColor}` }} />
            {artifact.status}
          </p>
        </div>
        <div style={{ textAlign: 'right', pointerEvents: 'auto' }}>
          <p style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.2em', marginBottom: 12 }}>
            {artifact.type} · {artifact.rarity}
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${artifact.glowColor}55` }}
            whileTap={{ scale: .97 }}
            onClick={onExamine}
            style={{ background: `${artifact.glowColor}14`, border: `1px solid ${artifact.glowColor}55`, color: artifact.glowColor, fontFamily: 'monospace', fontSize: 11, letterSpacing: '.2em', padding: '13px 30px', cursor: 'none', transition: 'background .3s' }}
          >
            EXAMINE ARTIFACT →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────
export default function ArtifactsVault() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [warpColor, setWarpColor] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [showLore, setShowLore] = useState(false)
  const navigate = useNavigate()

  const goTo = useCallback((next) => {
    if (transitioning) return
    const nextIdx = ((next % artifacts.length) + artifacts.length) % artifacts.length
    const dir = next > current || (next === 0 && current === artifacts.length - 1) ? 1 : -1
    setDirection(dir)
    setWarpColor(artifacts[nextIdx].glowColor)
    setTransitioning(true)
    setShowLore(false)
    setTimeout(() => setCurrent(nextIdx), 360)
    setTimeout(() => { setWarpColor(null); setTransitioning(false) }, 780)
  }, [current, transitioning])

  const prev = useCallback(() => goTo(current - 1), [current, goTo])
  const next = useCallback(() => goTo(current + 1), [current, goTo])

  useEffect(() => {
    const h = e => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setShowLore(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [prev, next])

  const artifact = artifacts[current]

  return (
    <div style={{ backgroundColor: '#050810', width: '100vw', height: '100vh', overflow: 'hidden', cursor: 'none', position: 'relative' }}>
      <CustomCursor />

      <AnimatePresence custom={direction} mode="wait">
        <Chamber
          key={current}
          artifact={artifact}
          index={current}
          direction={direction}
          onExamine={() => setShowLore(true)}
        />
      </AnimatePresence>

      <AnimatePresence>
        {warpColor && <WarpFlash key="warp" color={warpColor} />}
      </AnimatePresence>

      {/* Lore overlay */}
      <AnimatePresence>
        {showLore && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLore(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 200, cursor: 'none', backgroundColor: 'rgba(5,8,16,.55)', backdropFilter: 'blur(6px)' }}
            />
            <LorePanel artifact={artifact} onClose={() => setShowLore(false)} />
          </>
        )}
      </AnimatePresence>

      {/* Fixed top nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400, padding: '20px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom,rgba(5,8,16,.8),transparent)', backdropFilter: 'blur(10px)' }}>
        <motion.button whileHover={{ x: -4 }} whileTap={{ scale: .97 }} onClick={() => navigate('/archive')}
          style={{ background: 'none', border: '1px solid rgba(0,255,209,.25)', color: '#00FFD1', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.2em', padding: '9px 18px', cursor: 'none' }}>
          ← ARCHIVE
        </motion.button>
        <p style={{ color: 'rgba(232,244,248,.3)', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.4em' }}>XENOVA · VOID CHAMBERS</p>
        <p style={{ color: 'rgba(122,175,196,.6)', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.15em' }}>
          {String(current + 1).padStart(2, '0')} / {String(artifacts.length).padStart(2, '0')}
        </p>
      </div>

      {/* Prev arrow */}
      <motion.button whileHover={{ x: -5, opacity: 1 }} whileTap={{ scale: .94 }} onClick={prev}
        style={{ position: 'fixed', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 400, background: 'rgba(5,8,16,.6)', border: `1px solid ${artifact.glowColor}33`, color: artifact.glowColor, fontSize: 22, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', backdropFilter: 'blur(8px)', opacity: .5 }}>
        ←
      </motion.button>

      {/* Next arrow */}
      <motion.button whileHover={{ x: 5, opacity: 1 }} whileTap={{ scale: .94 }} onClick={next}
        style={{ position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 400, background: 'rgba(5,8,16,.6)', border: `1px solid ${artifact.glowColor}33`, color: artifact.glowColor, fontSize: 22, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', backdropFilter: 'blur(8px)', opacity: .5 }}>
        →
      </motion.button>

      {/* Nav dots */}
      <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 400, display: 'flex', gap: 10, alignItems: 'center' }}>
        {artifacts.map((a, i) => (
          <motion.button key={i} onClick={() => goTo(i)} whileHover={{ scale: 1.5 }}
            style={{ width: i === current ? 30 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'none', background: i === current ? artifact.glowColor : 'rgba(122,175,196,.28)', transition: 'all .4s ease', boxShadow: i === current ? `0 0 10px ${artifact.glowColor}` : 'none' }} />
        ))}
      </div>

      {/* Hint */}
      <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)', zIndex: 400 }}>
        <p style={{ color: 'rgba(122,175,196,.3)', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.3em', whiteSpace: 'nowrap' }}>
          ← → NAVIGATE · DRAG SCENE TO ORBIT · SCROLL TO ZOOM · CLICK BUTTON TO EXAMINE
        </p>
      </div>
    </div>
  )
}