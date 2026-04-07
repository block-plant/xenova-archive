// src/pages/Artifacts.jsx — VOID CHAMBERS v3: BEAST MODE
// Dependencies: three, @react-three/fiber, @react-three/drei, framer-motion, react-router-dom

import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, PerspectiveCamera, Trail, Sphere, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"
import { artifacts } from "../data/artifacts"

// ── UTILITY ───────────────────────────────────────────────────
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

// ── NEBULA BACKGROUND CANVAS (full-screen alien atmosphere) ───
function useNebulaCanvas(artifact) {
  const canvasRef = useRef()
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const start = Date.now()
    const color = artifact.glowColor
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Pre-generate star field
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
    }))

    // Pre-generate dust particles
    const dust = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.00015,
      driftY: (Math.random() - 0.5) * 0.00008,
    }))

    const loop = () => {
      const t = (Date.now() - start) / 1000
      const w = canvas.width, h = canvas.height

      // Clear with deep space
      ctx.fillStyle = '#050810'
      ctx.fillRect(0, 0, w, h)

      // === NEBULA CLOUDS ===
      // Central nebula bloom
      const grad1 = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.55)
      grad1.addColorStop(0, `rgba(${r},${g},${b},0.045)`)
      grad1.addColorStop(0.4, `rgba(${r},${g},${b},0.018)`)
      grad1.addColorStop(1, 'transparent')
      ctx.fillStyle = grad1
      ctx.fillRect(0, 0, w, h)

      // Left nebula arm
      const grad2 = ctx.createRadialGradient(w * 0.15, h * 0.35 + Math.sin(t * 0.08) * h * 0.04, 0, w * 0.15, h * 0.35, w * 0.38)
      grad2.addColorStop(0, `rgba(${Math.floor(r * 0.4)},${Math.floor(g * 0.6)},${Math.floor(b * 1.0)},0.055)`)
      grad2.addColorStop(1, 'transparent')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, w, h)

      // Right nebula arm
      const grad3 = ctx.createRadialGradient(w * 0.85, h * 0.55 + Math.cos(t * 0.06) * h * 0.03, 0, w * 0.85, h * 0.55, w * 0.42)
      grad3.addColorStop(0, `rgba(${Math.floor(r * 0.8)},${Math.floor(g * 0.3)},${Math.floor(b * 0.5)},0.04)`)
      grad3.addColorStop(1, 'transparent')
      ctx.fillStyle = grad3
      ctx.fillRect(0, 0, w, h)

      // Top nebula streak
      const grad4 = ctx.createRadialGradient(w * 0.6, h * 0.08, 0, w * 0.6, h * 0.08, w * 0.3)
      grad4.addColorStop(0, `rgba(${r},${g},${b},0.03)`)
      grad4.addColorStop(1, 'transparent')
      ctx.fillStyle = grad4
      ctx.fillRect(0, 0, w, h)

      // === HEX GRID OVERLAY (alien tech) ===
      ctx.save()
      ctx.globalAlpha = 0.025 + Math.sin(t * 0.3) * 0.008
      const hexSize = 52
      const hh = hexSize * Math.sqrt(3)
      ctx.strokeStyle = `rgb(${r},${g},${b})`
      ctx.lineWidth = 0.5
      for (let col = -1; col < w / hexSize + 1; col++) {
        for (let row = -1; row < h / hh + 1; row++) {
          const cx = col * hexSize * 1.5
          const cy = row * hh + (col % 2) * hh * 0.5
          ctx.beginPath()
          for (let k = 0; k < 6; k++) {
            const angle = (Math.PI / 3) * k - Math.PI / 6
            const px = cx + hexSize * 0.5 * Math.cos(angle)
            const py = cy + hexSize * 0.5 * Math.sin(angle)
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }
      }
      ctx.restore()

      // === ALIEN RUNE SYMBOLS (faint, scattered) ===
      ctx.save()
      ctx.font = '11px monospace'
      const runes = ['Ξ', 'Ω', 'Λ', 'Σ', 'Φ', 'Ψ', '∞', '⟁', '⊗', '⊕', '⟴', '↯']
      for (let i = 0; i < 18; i++) {
        const bx = ((i * 137.508) % 1) * w
        const by = ((i * 91.3) % 1) * h
        const drift = Math.sin(t * 0.12 + i * 0.7) * 18
        const alpha = 0.04 + Math.sin(t * 0.4 + i) * 0.02
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, alpha)})`
        ctx.fillText(runes[i % runes.length], bx + drift, by)
      }
      ctx.restore()

      // === STARS ===
      for (const s of stars) {
        const alpha = 0.4 + Math.sin(t * s.speed + s.twinkle) * 0.35
        ctx.fillStyle = `rgba(232,244,248,${Math.max(0, alpha)})`
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // === COSMIC DUST ===
      for (const d of dust) {
        d.x += d.drift
        d.y += d.driftY
        if (d.x < 0) d.x = 1; if (d.x > 1) d.x = 0
        if (d.y < 0) d.y = 1; if (d.y > 1) d.y = 0
        const alpha = (0.06 + Math.sin(t * 0.5 + d.phase) * 0.04)
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, alpha)})`
        ctx.beginPath()
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // === SCAN LINE (subtle) ===
      const scanY = ((t * 0.08) % 1) * h
      const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60)
      scanGrad.addColorStop(0, 'transparent')
      scanGrad.addColorStop(0.5, `rgba(${r},${g},${b},0.015)`)
      scanGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanY - 60, w, 120)

      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [artifact])
  return canvasRef
}

// ── UNIQUE 3D ARTIFACT MESHES ─────────────────────────────────

// 0: Seed Lattice — actual DNA double helix
function SeedLattice({ color }) {
  const group = useRef()
  const strand1 = useRef()
  const strand2 = useRef()

  const helixPoints1 = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 6 - Math.PI * 3
      pts.push(new THREE.Vector3(Math.cos(t) * 0.7, t * 0.22, Math.sin(t) * 0.7))
    }
    return pts
  }, [])

  const helixPoints2 = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * Math.PI * 6 - Math.PI * 3
      pts.push(new THREE.Vector3(Math.cos(t + Math.PI) * 0.7, t * 0.22, Math.sin(t + Math.PI) * 0.7))
    }
    return pts
  }, [])

  const curve1 = useMemo(() => new THREE.CatmullRomCurve3(helixPoints1), [helixPoints1])
  const curve2 = useMemo(() => new THREE.CatmullRomCurve3(helixPoints2), [helixPoints2])

  const tubeGeo1 = useMemo(() => new THREE.TubeGeometry(curve1, 200, 0.045, 8, false), [curve1])
  const tubeGeo2 = useMemo(() => new THREE.TubeGeometry(curve2, 200, 0.045, 8, false), [curve2])

  // Rungs between strands
  const rungs = useMemo(() => {
    const r = []
    for (let i = 0; i < 18; i++) {
      const t = (i / 18) * Math.PI * 6 - Math.PI * 3
      const y = t * 0.22
      r.push({ y, t })
    }
    return r
  }, [])

  const c = hexToVec3(color)

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    group.current.rotation.y = elapsed * 0.35
    group.current.position.y = Math.sin(elapsed * 0.5) * 0.18
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh geometry={tubeGeo1} ref={strand1}>
        <meshStandardMaterial color={new THREE.Color(c.r, c.g, c.b)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.2} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh geometry={tubeGeo2} ref={strand2}>
        <meshStandardMaterial color={new THREE.Color(c.r * 0.5, c.g * 0.8, c.b)} emissive={new THREE.Color(c.r * 0.5, c.g * 0.8, c.b)} emissiveIntensity={1.0} metalness={0.6} roughness={0.2} />
      </mesh>
      {rungs.map((rung, i) => (
        <mesh key={i} position={[0, rung.y, 0]} rotation={[0, rung.t, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 1.38, 6]} />
          <meshStandardMaterial color={new THREE.Color(c.r, c.g, c.b)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={0.7} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// 1: Codex Fragment — shattered multi-shard
function CodexFragment({ color }) {
  const group = useRef()
  const c = hexToVec3(color)

  const shards = useMemo(() => {
    const s = []
    for (let i = 0; i < 7; i++) {
      s.push({
        pos: [
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
        ],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 0.4 + Math.random() * 0.5,
      })
    }
    return s
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    group.current.rotation.y = t * 0.22
    group.current.rotation.x = Math.sin(t * 0.15) * 0.3
    group.current.position.y = Math.sin(t * 0.4) * 0.14
  })

  return (
    <group ref={group}>
      {/* Central core */}
      <mesh>
        <octahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.1, c.g * 0.1, c.b * 0.1)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.1} metalness={0.9} roughness={0.05} transparent opacity={0.9} />
      </mesh>
      {/* Wireframe shell */}
      <mesh scale={1.03}>
        <octahedronGeometry args={[0.85, 0]} />
        <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} wireframe transparent opacity={0.4} />
      </mesh>
      {/* Orbiting shards */}
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale}>
          <tetrahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color={new THREE.Color(c.r * 0.2, c.g * 0.2, c.b * 0.2)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={0.6} metalness={0.8} roughness={0.1} transparent opacity={0.75} />
        </mesh>
      ))}
      {/* Energy cracks (lines) */}
      {[0, 1, 2].map(i => (
        <mesh key={`crack-${i}`} rotation={[0, (i / 3) * Math.PI * 2, Math.PI / 4]}>
          <torusGeometry args={[1.05, 0.008, 4, 40, Math.PI * 0.7]} />
          <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// 2: Strain Omega — torus knot with corruption tendrils
function StrainOmega({ color }) {
  const group = useRef()
  const core = useRef()
  const c = hexToVec3(color)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    group.current.rotation.y = t * 0.18
    group.current.rotation.z = t * 0.08
    core.current.position.y = Math.sin(t * 0.6) * 0.1
    // Pulsing danger
    const pulse = 0.7 + Math.sin(t * 3.5) * 0.3
    core.current.material.emissiveIntensity = pulse
  })

  return (
    <group ref={group}>
      <mesh ref={core}>
        <torusKnotGeometry args={[0.75, 0.22, 220, 22, 3, 7]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.08, c.g * 0.08, c.b * 0.08)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={0.9} metalness={0.7} roughness={0.12} transparent opacity={0.92} />
      </mesh>
      {/* Outer ghost */}
      <mesh scale={1.07}>
        <torusKnotGeometry args={[0.75, 0.22, 220, 22, 3, 7]} />
        <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} wireframe transparent opacity={0.18} />
      </mesh>
      {/* Containment rings */}
      {[1.4, 1.7, 2.0].map((r2, i) => (
        <mesh key={i} rotation={[Math.PI / (2 + i * 0.5), i * 0.6, 0]}>
          <torusGeometry args={[r2, 0.012, 4, 80]} />
          <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} transparent opacity={0.3 - i * 0.08} />
        </mesh>
      ))}
    </group>
  )
}

// 3: Vex'al Light Prism — dodecahedron with light rays
function VexalPrism({ color }) {
  const group = useRef()
  const rays = useRef([])
  const c = hexToVec3(color)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    group.current.rotation.y = t * 0.3
    group.current.rotation.x = Math.sin(t * 0.2) * 0.2
    group.current.position.y = Math.sin(t * 0.55) * 0.15
    rays.current.forEach((r, i) => {
      if (r) r.material.opacity = 0.15 + Math.sin(t * 2 + i * 0.8) * 0.12
    })
  })

  return (
    <group ref={group}>
      {/* Core dodecahedron */}
      <mesh>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.05, c.g * 0.1, c.b * 0.05)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.3} metalness={0.3} roughness={0.0} transparent opacity={0.6} />
      </mesh>
      {/* Faceted glass outer shell */}
      <mesh scale={1.06}>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color={new THREE.Color(c.r, c.g, c.b)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={0.2} wireframe transparent opacity={0.35} />
      </mesh>
      {/* Light rays — 8 directions */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} ref={el => rays.current[i] = el}
            position={[Math.cos(angle) * 1.4, Math.sin(angle * 0.5) * 0.4, Math.sin(angle) * 1.4]}
            rotation={[0, -angle, Math.PI / 2]}>
            <coneGeometry args={[0.04, 1.8, 4]} />
            <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} transparent opacity={0.22} />
          </mesh>
        )
      })}
    </group>
  )
}

// 4: Bio-Synthetic Heart — sphere with circuit extrusions + pulse
function BioHeart({ color }) {
  const group = useRef()
  const core = useRef()
  const pulse = useRef()
  const c = hexToVec3(color)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    group.current.rotation.y = t * 0.2
    // Heartbeat: quick double-beat
    const beat = t % 2
    let scale = 1
    if (beat < 0.1) scale = 1 + beat * 3
    else if (beat < 0.25) scale = 1.3 - (beat - 0.1) * 2
    else if (beat < 0.4) scale = 1 + (beat - 0.25) * 2
    else if (beat < 0.55) scale = 1.3 - (beat - 0.4) * 2
    core.current.scale.setScalar(scale)
    group.current.position.y = Math.sin(t * 0.4) * 0.1
  })

  return (
    <group ref={group}>
      <mesh ref={core}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.05, c.g * 0.15, c.b * 0.1)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.0} metalness={0.5} roughness={0.3} transparent opacity={0.85} />
      </mesh>
      {/* Circuit veins — torii at different orientations */}
      {[
        [0, 0, 0], [Math.PI / 2, 0, 0], [0, 0, Math.PI / 2],
        [Math.PI / 4, Math.PI / 4, 0], [0, Math.PI / 3, Math.PI / 3]
      ].map((rot, i) => (
        <mesh key={i} rotation={rot}>
          <torusGeometry args={[0.88, 0.015, 4, 80]} />
          <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} transparent opacity={0.55 - i * 0.06} />
        </mesh>
      ))}
      {/* Outer pulse ring */}
      <mesh ref={pulse} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.025, 4, 80]} />
        <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// 5: Cascade Emitter — stacked discs with energy cone
function CascadeEmitter({ color }) {
  const group = useRef()
  const discs = useRef([])
  const c = hexToVec3(color)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    group.current.rotation.y = t * 0.25
    group.current.position.y = Math.sin(t * 0.45) * 0.12
    discs.current.forEach((d, i) => {
      if (d) d.rotation.z = t * (0.5 + i * 0.3) * (i % 2 === 0 ? 1 : -1)
    })
  })

  return (
    <group ref={group}>
      {/* Stacked ring array */}
      {[-0.9, -0.5, -0.1, 0.3, 0.7, 1.1].map((y, i) => (
        <mesh key={i} ref={el => discs.current[i] = el} position={[0, y, 0]}>
          <torusGeometry args={[0.65 - i * 0.07, 0.035, 4, 60]} />
          <meshStandardMaterial color={new THREE.Color(c.r, c.g, c.b)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={0.9 - i * 0.1} metalness={0.7} roughness={0.2} transparent opacity={0.85 - i * 0.08} />
        </mesh>
      ))}
      {/* Central core cylinder */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 2.2, 12]} />
        <meshStandardMaterial color={new THREE.Color(c.r, c.g, c.b)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.8} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Emission cone top */}
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.5, 0.8, 16, 1, true]} />
        <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// 6: Genesis Engine — triple nested gyroscope rings
function GenesisEngine({ color }) {
  const outerRing = useRef()
  const middleRing = useRef()
  const innerRing = useRef()
  const core = useRef()
  const c = hexToVec3(color)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    outerRing.current.rotation.y = t * 0.4
    middleRing.current.rotation.x = t * 0.55
    innerRing.current.rotation.z = t * 0.7
    core.current.rotation.y = t * 1.1
    core.current.position.y = Math.sin(t * 0.5) * 0.1
  })

  return (
    <group>
      <mesh ref={outerRing}>
        <torusGeometry args={[1.4, 0.055, 8, 120]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.2, c.g * 0.2, c.b * 0.2)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={0.8} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh ref={middleRing}>
        <torusGeometry args={[1.0, 0.045, 8, 100]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.15, c.g * 0.2, c.b * 0.15)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.0} metalness={0.85} roughness={0.1} />
      </mesh>
      <mesh ref={innerRing}>
        <torusGeometry args={[0.65, 0.035, 8, 80]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.1, c.g * 0.15, c.b * 0.1)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.3} metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Spoke connectors */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} ref={i === 0 ? core : null} rotation={[0, (i / 4) * Math.PI * 2, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 1.35, 4]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={new THREE.Color(c.r, c.g, c.b)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Central orb */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.1, c.g * 0.1, c.b * 0.1)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={2.5} metalness={0.5} roughness={0.0} />
      </mesh>
    </group>
  )
}

// 7: The Last Breath — dissolving particle sphere + crumbling shell
function LastBreath({ color }) {
  const group = useRef()
  const particlesRef = useRef()
  const c = hexToVec3(color)
  const count = 600

  const { positions, opacities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const opa = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = 0.7 + Math.random() * 0.5
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      opa[i] = Math.random()
    }
    return { positions: pos, opacities: opa }
  }, [])

  const speeds = useMemo(() => new Float32Array(count).map(() => 0.1 + Math.random() * 0.6), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    group.current.rotation.y = t * 0.12
    group.current.position.y = Math.sin(t * 0.3) * 0.08

    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position
      for (let i = 0; i < count; i++) {
        const drift = Math.sin(t * speeds[i] + i * 0.3) * 0.04
        pos.setY(i, positions[i * 3 + 1] + drift)
      }
      pos.needsUpdate = true
    }
  })

  return (
    <group ref={group}>
      {/* Crumbling shell fragments */}
      {Array.from({ length: 14 }, (_, i) => {
        const phi = Math.acos(2 * (i / 14) - 1)
        const theta = (i * 137.508 * Math.PI) / 180
        return (
          <mesh key={i}
            position={[Math.sin(phi) * Math.cos(theta) * 0.95, Math.sin(phi) * Math.sin(theta) * 0.95, Math.cos(phi) * 0.95]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}>
            <tetrahedronGeometry args={[0.12 + Math.random() * 0.08, 0]} />
            <meshStandardMaterial color={new THREE.Color(c.r * 0.15, c.g * 0.15, c.b * 0.15)} emissive={new THREE.Color(c.r * 0.5, c.g * 0.5, c.b * 0.5)} emissiveIntensity={0.6} metalness={0.6} roughness={0.4} transparent opacity={0.55} />
          </mesh>
        )
      })}
      {/* Dissolving particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color={new THREE.Color(c.r, c.g, c.b)} size={0.025} transparent opacity={0.55} sizeAttenuation />
      </points>
      {/* Fading core */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.1, c.g * 0.1, c.b * 0.1)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.2} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

const ARTIFACT_MESHES = [
  SeedLattice, CodexFragment, StrainOmega, VexalPrism,
  BioHeart, CascadeEmitter, GenesisEngine, LastBreath
]

// ── FLOATING ORBITAL PARTICLES ─────────────────────────────────
function OrbitalParticles({ color }) {
  const ref = useRef()
  const c = hexToVec3(color)
  const count = 120
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const radii = new Float32Array(count)
    const speeds = new Float32Array(count)
    const phases = new Float32Array(count)
    const inclinations = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      radii[i] = 1.8 + Math.random() * 1.4
      speeds[i] = 0.15 + Math.random() * 0.5
      phases[i] = Math.random() * Math.PI * 2
      inclinations[i] = (Math.random() - 0.5) * Math.PI
      pos[i * 3] = radii[i] * Math.cos(phases[i])
      pos[i * 3 + 1] = 0
      pos[i * 3 + 2] = radii[i] * Math.sin(phases[i])
    }
    return { pos, radii, speeds, phases, inclinations }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pos = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      const angle = data.phases[i] + t * data.speeds[i]
      const r = data.radii[i]
      const inc = data.inclinations[i]
      pos.setXYZ(i,
        r * Math.cos(angle) * Math.cos(inc),
        r * Math.sin(inc) + Math.sin(t * data.speeds[i] * 0.5 + i) * 0.2,
        r * Math.sin(angle) * Math.cos(inc)
      )
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data.pos} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={new THREE.Color(c.r, c.g, c.b)} size={0.035} transparent opacity={0.65} sizeAttenuation />
    </points>
  )
}

// ── ALIEN PEDESTAL ─────────────────────────────────────────────
function Pedestal({ color }) {
  const c = hexToVec3(color)
  const glowRing = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (glowRing.current) {
      glowRing.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.8
    }
  })

  return (
    <group position={[0, -1.8, 0]}>
      {/* Main base */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.6, 0.18, 8]} />
        <meshStandardMaterial color={new THREE.Color(0.04, 0.06, 0.1)} emissive={new THREE.Color(c.r * 0.08, c.g * 0.08, c.b * 0.08)} roughness={0.35} metalness={0.85} />
      </mesh>
      {/* Rune engravings on base */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.0, 0.12, Math.sin(angle) * 1.0]} rotation={[Math.PI / 2, 0, angle]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 4]} />
            <meshStandardMaterial color={new THREE.Color(c.r, c.g, c.b)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.2} />
          </mesh>
        )
      })}
      {/* Column */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.28, 0.42, 1.4, 8]} />
        <meshStandardMaterial color={new THREE.Color(0.06, 0.08, 0.14)} emissive={new THREE.Color(c.r * 0.06, c.g * 0.06, c.b * 0.06)} roughness={0.45} metalness={0.75} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 1.65, 0]}>
        <cylinderGeometry args={[0.52, 0.28, 0.1, 8]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.12, c.g * 0.12, c.b * 0.12)} emissive={new THREE.Color(c.r * 0.35, c.g * 0.35, c.b * 0.35)} roughness={0.2} metalness={0.92} />
      </mesh>
      {/* Glow ring */}
      <mesh ref={glowRing} position={[0, 1.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.022, 8, 64]} />
        <meshStandardMaterial color={new THREE.Color(c.r, c.g, c.b)} emissive={new THREE.Color(c.r, c.g, c.b)} emissiveIntensity={1.8} />
      </mesh>
      {/* Ground glow plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial color={new THREE.Color(c.r * 0.15, c.g * 0.15, c.b * 0.15)} transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

// ── ALIEN CRYSTAL SPIRES ───────────────────────────────────────
function CrystalSpires({ color }) {
  const c = hexToVec3(color)
  const spires = useMemo(() => [
    { pos: [-7, -3.5, -5], s: 1.2, sides: 5 },
    { pos: [8, -3.5, -7], s: 0.9, sides: 6 },
    { pos: [-11, -3.5, -11], s: 1.5, sides: 4 },
    { pos: [12, -3.5, -13], s: 1.0, sides: 5 },
    { pos: [-4, -3.5, -16], s: 0.7, sides: 6 },
    { pos: [9, -3.5, -4], s: 0.8, sides: 5 },
    { pos: [-15, -3.5, -8], s: 1.3, sides: 4 },
    { pos: [16, -3.5, -17], s: 1.1, sides: 6 },
  ], [])

  return (
    <>
      {spires.map((sp, i) => (
        <group key={i} position={sp.pos}>
          <mesh>
            <coneGeometry args={[0.1 * sp.s, 2.2 * sp.s, sp.sides]} />
            <meshStandardMaterial color={new THREE.Color(c.r * 0.08, c.g * 0.08, c.b * 0.08)} emissive={new THREE.Color(c.r * 0.4, c.g * 0.4, c.b * 0.4)} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} transparent opacity={0.75} />
          </mesh>
          {/* Inner glow */}
          <mesh scale={0.4}>
            <coneGeometry args={[0.1 * sp.s, 2.2 * sp.s, sp.sides]} />
            <meshBasicMaterial color={new THREE.Color(c.r, c.g, c.b)} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── ATMOSPHERIC GROUND ─────────────────────────────────────────
function AlienGround({ color }) {
  const meshRef = useRef()
  const c = hexToVec3(color)

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(100, 100, 100, 100)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i)
      const y = Math.sin(x * 0.35) * 0.9 + Math.cos(z * 0.28) * 0.7
        + Math.sin(x * 1.1 + z * 0.7) * 0.35 + Math.cos(x * 0.6 - z * 1.0) * 0.45
      pos.setY(i, y - 3)
    }
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[0, 0, 0]} receiveShadow>
      <meshStandardMaterial
        color={new THREE.Color(c.r * 0.04, c.g * 0.05, c.b * 0.05)}
        emissive={new THREE.Color(c.r * 0.03, c.g * 0.03, c.b * 0.03)}
        roughness={0.95} metalness={0.05}
      />
    </mesh>
  )
}

// ── DISTANT ALIEN PLANETS ──────────────────────────────────────
function DistantPlanets({ color, index }) {
  const c = hexToVec3(color)
  const planet1 = useRef()
  const planet2 = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.03 + index * 1.5
    if (planet1.current) {
      planet1.current.position.x = Math.cos(t) * 32
      planet1.current.position.z = Math.sin(t) * 14 - 22
      planet1.current.rotation.y += 0.004
    }
    if (planet2.current) {
      planet2.current.position.x = Math.cos(t + Math.PI) * 45
      planet2.current.position.z = Math.sin(t + Math.PI) * 18 - 30
      planet2.current.rotation.y -= 0.003
    }
  })

  return (
    <>
      <mesh ref={planet1} position={[28, 9, -28]}>
        <sphereGeometry args={[3.5, 24, 24]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.12, c.g * 0.12, c.b * 0.12)} emissive={new THREE.Color(c.r * 0.3, c.g * 0.3, c.b * 0.3)} roughness={0.85} />
      </mesh>
      <mesh ref={planet1} position={[28, 9, -28]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[5.2, 0.22, 4, 64]} />
        <meshBasicMaterial color={new THREE.Color(c.r * 0.5, c.g * 0.5, c.b * 0.5)} transparent opacity={0.4} />
      </mesh>
      <mesh ref={planet2} position={[-30, 14, -40]}>
        <sphereGeometry args={[2.8, 20, 20]} />
        <meshStandardMaterial color={new THREE.Color(c.r * 0.08, c.g * 0.1, c.b * 0.12)} emissive={new THREE.Color(c.r * 0.2, c.g * 0.25, c.b * 0.3)} roughness={0.9} />
      </mesh>
    </>
  )
}

// ── FULL 3D SCENE ──────────────────────────────────────────────
function AlienWorldScene({ artifact, index }) {
  const color = artifact.glowColor
  const c = hexToVec3(color)
  const ArtifactMesh = ARTIFACT_MESHES[index % 8]

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 6.5]} fov={50} />

      {/* Lighting rig — unique per artifact */}
      <ambientLight intensity={0.06} />
      <directionalLight position={[10, 16, 8]} intensity={0.5} color={new THREE.Color(c.r * 0.3 + 0.7, c.g * 0.3 + 0.7, c.b * 0.3 + 0.7)} castShadow />
      {/* Bottom uplighting — alien ground glow */}
      <pointLight position={[0, -2.5, 0]} intensity={2.2} color={new THREE.Color(c.r, c.g, c.b)} distance={10} />
      {/* Front fill */}
      <pointLight position={[0, 1.5, 4]} intensity={0.8} color={new THREE.Color(c.r * 0.5 + 0.5, c.g * 0.5 + 0.5, c.b * 0.5 + 0.5)} distance={14} />
      {/* Rim light */}
      <pointLight position={[-5, 3, -3]} intensity={0.5} color={new THREE.Color(c.r, c.g, c.b)} distance={12} />

      {/* Stars */}
      <Stars radius={140} depth={70} count={4000} factor={3.5} saturation={0.3} fade speed={0.3} />

      {/* Scene fog */}
      <fog attach="fog" args={['#050810', 24, 65]} />

      {/* Environment */}
      <AlienGround color={color} />
      <gridHelper args={[100, 48,
        new THREE.Color(c.r * 0.3, c.g * 0.3, c.b * 0.3),
        new THREE.Color(c.r * 0.08, c.g * 0.08, c.b * 0.08)
      ]} position={[0, -2.98, 0]} />

      {/* Crystal spires */}
      <CrystalSpires color={color} />

      {/* Distant planets */}
      <DistantPlanets color={color} index={index} />

      {/* Pedestal */}
      <Pedestal color={color} />

      {/* Artifact */}
      <group position={[0, 0.1, 0]}>
        <ArtifactMesh color={color} />
        <OrbitalParticles color={color} />
      </group>

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={3}
        maxDistance={14}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0, 0]}
        rotateSpeed={0.45}
        zoomSpeed={0.55}
      />
    </>
  )
}

// ── CUSTOM CURSOR ──────────────────────────────────────────────
function CustomCursor() {
  const cx = useMotionValue(-100), cy = useMotionValue(-100)
  const sx = useSpring(cx, { stiffness: 100, damping: 20 })
  const sy = useSpring(cy, { stiffness: 100, damping: 20 })
  const dx = useSpring(cx, { stiffness: 600, damping: 38 })
  const dy = useSpring(cy, { stiffness: 600, damping: 38 })
  useEffect(() => {
    const m = e => { cx.set(e.clientX); cy.set(e.clientY) }
    window.addEventListener('mousemove', m)
    return () => window.removeEventListener('mousemove', m)
  }, [])
  return (
    <>
      <motion.div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none', x: dx, y: dy, translateX: '-50%', translateY: '-50%', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00FFD1', boxShadow: '0 0 14px #00FFD1, 0 0 30px #00FFD144' }} />
      <motion.div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none', x: sx, y: sy, translateX: '-50%', translateY: '-50%', width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(0,255,209,0.55)', mixBlendMode: 'difference' }} />
    </>
  )
}

// ── WARP FLASH ─────────────────────────────────────────────────
function WarpFlash({ color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.9, 0.9, 0], scale: [0.05, 1, 2, 5] }}
      transition={{ duration: 0.8, times: [0, 0.2, 0.55, 1], ease: 'easeOut' }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, pointerEvents: 'none', background: `radial-gradient(circle, ${color}ee 0%, ${color}44 30%, transparent 65%)` }}
    />
  )
}

// ── LORE PANEL ─────────────────────────────────────────────────
function LorePanel({ artifact, onClose }) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 34 }}
      style={{ position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 300, width: 'min(580px,90vw)', background: 'rgba(5,8,16,0.97)', backdropFilter: 'blur(32px)', borderLeft: `1px solid ${artifact.glowColor}44`, overflowY: 'auto', cursor: 'none' }}
    >
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.25 }}
        style={{ height: 2, background: `linear-gradient(to right,transparent,${artifact.glowColor},transparent)`, boxShadow: `0 0 20px ${artifact.glowColor}`, transformOrigin: 'left' }} />

      <div style={{ padding: '44px 44px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 28, background: 'none', border: `1px solid ${artifact.glowColor}44`, color: artifact.glowColor, fontFamily: 'monospace', fontSize: 13, width: 36, height: 36, cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <p style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.3em', marginBottom: 10 }}>{artifact.codexId} · {artifact.type}</p>
        <h2 style={{ color: '#E8F4F8', fontFamily: 'serif', fontSize: 'clamp(22px,3vw,38px)', letterSpacing: '.03em', marginBottom: 6, lineHeight: 1.1 }}>{artifact.name}</h2>
        <p style={{ color: artifact.eraColor, fontFamily: 'monospace', fontSize: 10, letterSpacing: '.3em', marginBottom: 32 }}>{artifact.era} · {artifact.rarity}</p>

        {/* Animated orb display */}
        <div style={{ height: 180, backgroundColor: '#020508', border: `1px solid ${artifact.glowColor}22`, borderRadius: 3, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse,${artifact.glowColor}0e,transparent 70%)` }} />
          {[110, 80, 52].map((sz, i) => (
            <motion.div key={i}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 9 + i * 5, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', width: sz, height: sz, border: `1px solid ${artifact.glowColor}${['44', '28', '18'][i]}`, borderRadius: '50%', borderTopColor: i === 0 ? artifact.glowColor : 'transparent' }} />
          ))}
          <motion.div
            animate={{ scale: [1, 1.14, 1], boxShadow: [`0 0 20px ${artifact.glowColor}55`, `0 0 44px ${artifact.glowColor}aa`, `0 0 20px ${artifact.glowColor}55`] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            style={{ width: 52, height: 52, borderRadius: '50%', zIndex: 2, background: `radial-gradient(circle at 35% 35%,${artifact.glowColor}dd,${artifact.glowColor}22)`, border: `2px solid ${artifact.glowColor}` }} />
          <div className="scanline" style={{ background: `linear-gradient(transparent,${artifact.glowColor}44,transparent)` }} />
        </div>

        {/* Scan progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: artifact.glowColor, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.25em' }}>ARCHIVE SCAN</span>
            <span style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 9 }}>100%</span>
          </div>
          <div style={{ height: 2, background: 'rgba(122,175,196,0.12)', borderRadius: 1 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.4, delay: 0.4, ease: 'easeOut' }}
              style={{ height: '100%', background: `linear-gradient(to right, ${artifact.glowColor}, ${artifact.glowColor}88)`, boxShadow: `0 0 8px ${artifact.glowColor}` }} />
          </div>
        </div>

        <p style={{ color: '#E8F4F8', fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.95, marginBottom: 24 }}>{artifact.description}</p>

        <div style={{ borderTop: `1px solid ${artifact.glowColor}22`, paddingTop: 18, marginBottom: 22 }}>
          <p style={{ color: artifact.glowColor, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.28em', marginBottom: 10 }}>ARCHIVE NOTES:</p>
          <p style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 11.5, lineHeight: 1.9, fontStyle: 'italic' }}>{artifact.details}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(122,175,196,0.08)' }}>
          <span style={{ color: artifact.glowColor, fontFamily: 'monospace', fontSize: 10, letterSpacing: '.2em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.span animate={{ opacity: [1, .15, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
              style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: artifact.glowColor, boxShadow: `0 0 8px ${artifact.glowColor}` }} />
            STATUS: {artifact.status}
          </span>
          <span style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 9 }}>CLICK OUTSIDE TO CLOSE</span>
        </div>
      </div>
    </motion.div>
  )
}

// ── CHAMBER ────────────────────────────────────────────────────
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

function Chamber({ artifact, index, direction, onExamine }) {
  const nebulaRef = useNebulaCanvas(artifact)

  const variants = {
    enter: d => ({ opacity: 0, scale: .93, filter: 'blur(24px)', x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, scale: 1, filter: 'blur(0px)', x: 0 },
    exit: d => ({ opacity: 0, scale: .96, filter: 'blur(16px)', x: d < 0 ? 60 : -60 }),
  }

  return (
    <motion.div
      key={artifact.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: .7, ease: [0.215, 0.61, 0.355, 1] }}
      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
    >
      {/* Nebula background — fills full viewport */}
      <canvas
        ref={nebulaRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* 3D Scene on top of nebula */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Suspense fallback={null}>
            <AlienWorldScene artifact={artifact} index={index} />
          </Suspense>
        </Canvas>
      </div>

      {/* Edge vignettes */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 25%, rgba(5,8,16,0.5) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', background: 'linear-gradient(to top,rgba(5,8,16,0.92),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20%', background: 'linear-gradient(to bottom,rgba(5,8,16,0.78),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, left: 0, width: '8%', background: 'linear-gradient(to right,rgba(5,8,16,0.6),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, right: 0, left: 'auto', width: '8%', background: 'linear-gradient(to left,rgba(5,8,16,0.6),transparent)', pointerEvents: 'none' }} />

      {/* Chamber title */}
      <motion.div
        initial={{ opacity: 0, y: -22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .3, duration: .7 }}
        style={{ position: 'absolute', top: 88, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: '1.2em' }}
          animate={{ opacity: 1, letterSpacing: '.55em' }}
          transition={{ delay: .38, duration: 1.0 }}
          style={{ color: `${artifact.glowColor}77`, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.55em', marginBottom: 11 }}
        >
          DIMENSIONAL CHAMBER {ROMAN[index]}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .52, duration: .75, ease: [.215, .61, .355, 1] }}
          style={{ color: '#E8F4F8', fontFamily: 'serif', fontSize: 'clamp(22px,4.5vw,58px)', fontWeight: 700, letterSpacing: '.05em', margin: 0, textShadow: `0 0 80px ${artifact.glowColor}55, 0 2px 40px rgba(0,0,0,.8)` }}
        >
          {artifact.name}
        </motion.h2>
      </motion.div>

      {/* Orbit hint — left side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: .8 }}
        style={{ position: 'absolute', top: '50%', left: 22, transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <p style={{ color: `${artifact.glowColor}38`, fontFamily: 'monospace', fontSize: 8, letterSpacing: '.22em', writingMode: 'vertical-rl' }}>
          DRAG · ORBIT · ZOOM
        </p>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .48, duration: .7 }}
        style={{ position: 'absolute', bottom: 70, left: 52, right: 52, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}
      >
        <div>
          <p style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.22em', marginBottom: 4 }}>{artifact.codexId}</p>
          <p style={{ color: artifact.eraColor, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.3em', marginBottom: 4 }}>{artifact.era}</p>
          <p style={{ color: `${artifact.glowColor}88`, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.2em', display: 'flex', alignItems: 'center', gap: 5 }}>
            <motion.span animate={{ opacity: [1, .12, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: artifact.glowColor, display: 'inline-block', boxShadow: `0 0 6px ${artifact.glowColor}` }} />
            {artifact.status}
          </p>
        </div>
        <div style={{ textAlign: 'right', pointerEvents: 'auto' }}>
          <p style={{ color: '#7AAFC4', fontFamily: 'monospace', fontSize: 9, letterSpacing: '.2em', marginBottom: 10 }}>
            {artifact.type} · {artifact.rarity}
          </p>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: `0 0 36px ${artifact.glowColor}66, inset 0 0 20px ${artifact.glowColor}22` }}
            whileTap={{ scale: .96 }}
            onClick={onExamine}
            style={{ background: `${artifact.glowColor}12`, border: `1px solid ${artifact.glowColor}55`, color: artifact.glowColor, fontFamily: 'monospace', fontSize: 10, letterSpacing: '.22em', padding: '12px 28px', cursor: 'none', transition: 'background .3s', backdropFilter: 'blur(8px)' }}
          >
            EXAMINE ARTIFACT →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── MAIN EXPORT ────────────────────────────────────────────────
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
    setTimeout(() => setCurrent(nextIdx), 380)
    setTimeout(() => { setWarpColor(null); setTransitioning(false) }, 820)
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

      <AnimatePresence>
        {showLore && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLore(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 200, cursor: 'none', backgroundColor: 'rgba(5,8,16,.6)', backdropFilter: 'blur(8px)' }}
            />
            <LorePanel artifact={artifact} onClose={() => setShowLore(false)} />
          </>
        )}
      </AnimatePresence>

      {/* Top nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400, padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom,rgba(5,8,16,.85),transparent)', backdropFilter: 'blur(12px)' }}>
        <motion.button whileHover={{ x: -4, color: '#00FFD1' }} whileTap={{ scale: .97 }} onClick={() => navigate('/archive')}
          style={{ background: 'none', border: '1px solid rgba(0,255,209,.22)', color: '#00FFD1', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.22em', padding: '9px 18px', cursor: 'none' }}>
          ← ARCHIVE
        </motion.button>
        <p style={{ color: 'rgba(232,244,248,.25)', fontFamily: 'monospace', fontSize: 9, letterSpacing: '.45em' }}>XENOVA · VOID CHAMBERS</p>
        <p style={{ color: 'rgba(122,175,196,.55)', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.18em' }}>
          {String(current + 1).padStart(2, '0')} / {String(artifacts.length).padStart(2, '0')}
        </p>
      </div>

      {/* Prev arrow */}
      <motion.button whileHover={{ x: -5, opacity: 1 }} whileTap={{ scale: .93 }} onClick={prev}
        style={{ position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 400, background: 'rgba(5,8,16,.65)', border: `1px solid ${artifact.glowColor}33`, color: artifact.glowColor, fontSize: 20, width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', backdropFilter: 'blur(10px)', opacity: .5, borderRadius: 2 }}>
        ←
      </motion.button>

      {/* Next arrow */}
      <motion.button whileHover={{ x: 5, opacity: 1 }} whileTap={{ scale: .93 }} onClick={next}
        style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 400, background: 'rgba(5,8,16,.65)', border: `1px solid ${artifact.glowColor}33`, color: artifact.glowColor, fontSize: 20, width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', backdropFilter: 'blur(10px)', opacity: .5, borderRadius: 2 }}>
        →
      </motion.button>

      {/* Dot navigation */}
      <div style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 400, display: 'flex', gap: 9, alignItems: 'center' }}>
        {artifacts.map((a, i) => (
          <motion.button key={i} onClick={() => goTo(i)} whileHover={{ scale: 1.6 }}
            style={{ width: i === current ? 30 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'none', background: i === current ? artifact.glowColor : 'rgba(122,175,196,.25)', transition: 'all .4s ease', boxShadow: i === current ? `0 0 12px ${artifact.glowColor}` : 'none' }} />
        ))}
      </div>

      {/* Hint bar */}
      <div style={{ position: 'fixed', bottom: 48, left: '50%', transform: 'translateX(-50%)', zIndex: 400 }}>
        <p style={{ color: 'rgba(122,175,196,.25)', fontFamily: 'monospace', fontSize: 9, letterSpacing: '.3em', whiteSpace: 'nowrap' }}>
          ← → NAVIGATE · DRAG SCENE TO ORBIT · SCROLL TO ZOOM · CLICK BUTTON TO EXAMINE
        </p>
      </div>
    </div>
  )
}