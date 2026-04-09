import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function EnergyCore() {
  const outerRingRef = useRef()
  const middleRingRef = useRef()
  const innerRingRef = useRef()
  const coreRef = useRef()

  useFrame((state, delta) => {
    // Independent axis rotations for the energy rings
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.2
      outerRingRef.current.rotation.y += delta * 0.3
    }
    if (middleRingRef.current) {
      middleRingRef.current.rotation.y += delta * 0.4
      middleRingRef.current.rotation.z += delta * 0.2
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x -= delta * 0.5
      innerRingRef.current.rotation.z -= delta * 0.3
    }
    
    // Core pulsing effect
    if (coreRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      coreRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <group>
      {/* Dynamic Lighting */}
      <pointLight position={[0, 0, 0]} intensity={200} color="#0088FF" distance={300} decay={1.5} />
      <pointLight position={[0, 0, 0]} intensity={100} color="#00FFFF" distance={100} decay={2} />

      {/* The Solid Emissive Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial color="#00C3FF" toneMapped={false} />
      </mesh>

      {/* Glow / Corona effect */}
      <mesh>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#0088FF" transparent opacity={0.3} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#0033FF" transparent opacity={0.15} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Energy Rings */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[4.5, 0.05, 16, 100]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      
      <mesh ref={middleRingRef} rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[3.8, 0.08, 16, 100]} />
        <meshBasicMaterial color="#00AAFF" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      
      <mesh ref={innerRingRef} rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[3.2, 0.03, 16, 100]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  )
}
