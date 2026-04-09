import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import EnergyCore from './EnergyCore'
import Planet from './Planet'
import { PLANETS } from '../../data/planetData'

export default function SolarSystemScene({ selectedPlanetId, onSelectPlanet }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#02040A' }}>
      <Canvas
        camera={{ position: [0, 120, 180], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#02040A']} />
        
        {/* Parallax Stars */}
        <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Stars radius={300} depth={100} count={2000} factor={6} saturation={1} fade speed={0.5} />
        
        {/* Ambient lighting to just barely see things */}
        <ambientLight intensity={0.1} color="#0088FF" />

        {/* Global Controls */}
        <OrbitControls 
          makeDefault
          enabled={!selectedPlanetId}
          enablePan={false} 
          minDistance={10} 
          maxDistance={350} 
          autoRotate={!selectedPlanetId}
          autoRotateSpeed={0.5}
        />

        {/* Central God Computer Core */}
        <EnergyCore />

        {/* The 14 Planets */}
        {PLANETS.map((planet) => (
          <Planet 
            key={planet.id} 
            data={planet} 
            selected={selectedPlanetId === planet.id}
            onClick={onSelectPlanet}
          />
        ))}

        {/* Post Processing: Bloom makes the emissive materials pop */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={1.2} 
            intensity={1.5} 
            mipmapBlur={true} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
