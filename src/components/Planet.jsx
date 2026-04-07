import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function hash3(x, y, z) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123
  return n - Math.floor(n)
}

function smoothstep(t) { return t * t * (3 - 2 * t) }

function valueNoise3D(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z)
  const fx = x-ix, fy = y-iy, fz = z-iz
  const ux = smoothstep(fx), uy = smoothstep(fy), uz = smoothstep(fz)
  return (
    hash3(ix,   iy,   iz)   * (1-ux)*(1-uy)*(1-uz) +
    hash3(ix+1, iy,   iz)   * ux*(1-uy)*(1-uz) +
    hash3(ix,   iy+1, iz)   * (1-ux)*uy*(1-uz) +
    hash3(ix+1, iy+1, iz)   * ux*uy*(1-uz) +
    hash3(ix,   iy,   iz+1) * (1-ux)*(1-uy)*uz +
    hash3(ix+1, iy,   iz+1) * ux*(1-uy)*uz +
    hash3(ix,   iy+1, iz+1) * (1-ux)*uy*uz +
    hash3(ix+1, iy+1, iz+1) * ux*uy*uz
  )
}

function fbm3D(x, y, z, octaves=8, lacunarity=2.1, gain=0.48) {
  let val=0, amp=0.5, freq=1, max=0
  for(let i=0;i<octaves;i++){
    val += valueNoise3D(x*freq, y*freq, z*freq) * amp
    max += amp; amp *= gain; freq *= lacunarity
  }
  return val/max
}

function domainWarp(x,y,z,strength=0.6){
  const wx = fbm3D(x+1.7, y+9.2, z+5.1, 4)
  const wy = fbm3D(x+8.3, y+2.8, z+1.2, 4)
  const wz = fbm3D(x+3.1, y+6.7, z+8.4, 4)
  return fbm3D(x+strength*wx, y+strength*wy, z+strength*wz, 8)
}

function buildColorMap() {
  const W=2048, H=1024
  const canvas = document.createElement('canvas')
  canvas.width=W; canvas.height=H
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W,H)
  const d = img.data

  for(let py=0;py<H;py++){
    for(let px=0;px<W;px++){
      const u=px/W, v=py/H
      const lon=u*Math.PI*2, lat=v*Math.PI
      const sx=Math.sin(lat)*Math.cos(lon)
      const sy=Math.cos(lat)
      const sz=Math.sin(lat)*Math.sin(lon)

      const elev     = domainWarp(sx*1.8+2, sy*1.8+2, sz*1.8+2, 0.55)
      const detail   = fbm3D(sx*6+1, sy*6+1, sz*6+1, 6)
      const moisture = fbm3D(sx*2.5+7, sy*2.5+7, sz*2.5+7, 5)
      const veins    = fbm3D(sx*14+3, sy*14+3, sz*14+3, 4)
      const city     = fbm3D(sx*28+9, sy*28+9, sz*28+9, 3)
      const polar    = Math.abs(sy)

      let r=0,g=0,b=0

      if(elev < 0.33){
        const t=elev/0.33; r=0; g=(8+t*18)|0; b=(18+t*30)|0
      } else if(elev < 0.40){
        const t=(elev-0.33)/0.07; r=0; g=(26+t*20)|0; b=(48+t*25)|0
        if(veins>0.60){const vt=(veins-0.60)/0.40; g=Math.min(255,g+vt*100)|0; b=Math.min(255,b+vt*70)|0}
      } else if(elev < 0.455){
        const t=(elev-0.40)/0.055; r=(t*5)|0; g=(46+t*40)|0; b=(73+t*30)|0
      } else if(elev < 0.50){
        const t=(elev-0.455)/0.045; r=(5+t*20)|0; g=(65+t*30+detail*15)|0; b=(50+t*20)|0
      } else if(elev < 0.565){
        r=(8+moisture*12+detail*8)|0; g=(60+(elev-0.50)/0.065*35+moisture*25+detail*20)|0; b=(25+moisture*18+detail*10)|0
      } else if(elev < 0.635){
        const t=(elev-0.565)/0.07; r=(10+detail*14+t*8)|0; g=(75+t*20+detail*22+moisture*15)|0; b=(28+detail*12+moisture*10)|0
      } else if(elev < 0.70){
        const t=(elev-0.635)/0.065; r=(18+t*25+detail*18)|0; g=(72+t*15+detail*18)|0; b=(32+t*12+detail*12)|0
      } else if(elev < 0.78){
        const t=(elev-0.70)/0.08; r=(30+t*30+detail*20)|0; g=(70+t*25+detail*18)|0; b=(45+t*25+detail*15)|0
      } else {
        const t=Math.min(1,(elev-0.78)/0.22); r=(55+t*80+detail*30)|0; g=(100+t*120+detail*30)|0; b=(90+t*120+detail*25)|0
      }

      if(polar > 0.78){
        const iceFactor=Math.min(1,(polar-0.78)/0.18)
        const id=fbm3D(sx*18,sy*18,sz*18,4)
        r=(r+(220+id*35-r)*iceFactor)|0; g=(g+(245+id*10-g)*iceFactor)|0; b=(b+(255-b)*iceFactor)|0
      } else if(polar > 0.70){
        const t=(polar-0.70)/0.08
        r=Math.min(255,r+t*40)|0; g=Math.min(255,g+t*50)|0; b=Math.min(255,b+t*70)|0
      }

      if(elev>0.455 && veins>0.64){
        const vt=((veins-0.64)/0.36)**1.5
        g=Math.min(255,g+(210*vt))|0; b=Math.min(255,b+(160*vt))|0
      }

      if(city>0.80&&elev>0.455&&elev<0.68&&polar<0.72){
        const ct=((city-0.80)/0.20)**2
        g=Math.min(255,g+ct*255)|0; b=Math.min(255,b+ct*190)|0
      }

      const i=(py*W+px)*4
      d[i]=Math.min(255,Math.max(0,r)); d[i+1]=Math.min(255,Math.max(0,g))
      d[i+2]=Math.min(255,Math.max(0,b)); d[i+3]=255
    }
  }
  ctx.putImageData(img,0,0)
  return new THREE.CanvasTexture(canvas)
}

function buildEmissiveMap() {
  const W=1024,H=512
  const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H
  const ctx=canvas.getContext('2d'); const img=ctx.createImageData(W,H); const d=img.data
  for(let py=0;py<H;py++){for(let px=0;px<W;px++){
    const u=px/W,v=py/H,lon=u*Math.PI*2,lat=v*Math.PI
    const sx=Math.sin(lat)*Math.cos(lon),sy=Math.cos(lat),sz=Math.sin(lat)*Math.sin(lon)
    const elev=domainWarp(sx*1.8+2,sy*1.8+2,sz*1.8+2,0.55)
    const veins=fbm3D(sx*14+3,sy*14+3,sz*14+3,4)
    const city=fbm3D(sx*28+9,sy*28+9,sz*28+9,3)
    const polar=Math.abs(sy)
    let r=0,g=0,b=0
    if(elev>0.455&&veins>0.64){const vt=((veins-0.64)/0.36)**1.5; g=(vt*180)|0; b=(vt*120)|0}
    if(city>0.80&&elev>0.455&&elev<0.68&&polar<0.72){const ct=((city-0.80)/0.20)**2; g=Math.min(255,g+ct*255)|0; b=Math.min(255,b+ct*200)|0}
    const i=(py*W+px)*4; d[i]=r; d[i+1]=g; d[i+2]=b; d[i+3]=255
  }}
  ctx.putImageData(img,0,0); return new THREE.CanvasTexture(canvas)
}

function buildRoughnessMap() {
  const W=512,H=256
  const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H
  const ctx=canvas.getContext('2d'); const img=ctx.createImageData(W,H); const d=img.data
  for(let py=0;py<H;py++){for(let px=0;px<W;px++){
    const u=px/W,v=py/H,lon=u*Math.PI*2,lat=v*Math.PI
    const sx=Math.sin(lat)*Math.cos(lon),sy=Math.cos(lat),sz=Math.sin(lat)*Math.sin(lon)
    const elev=domainWarp(sx*1.8+2,sy*1.8+2,sz*1.8+2,0.55)
    const roughness=elev<0.44?0.1+elev*0.8:0.7+fbm3D(sx*8,sy*8,sz*8,3)*0.3
    const v8=(roughness*255)|0; const i=(py*W+px)*4
    d[i]=v8; d[i+1]=v8; d[i+2]=v8; d[i+3]=255
  }}
  ctx.putImageData(img,0,0); return new THREE.CanvasTexture(canvas)
}

function PlanetMesh(){
  const meshRef=useRef(),cloudRef=useRef(),glowRef=useRef(),pivotRef=useRef()
  const maps=useMemo(()=>({color:buildColorMap(),emissive:buildEmissiveMap(),roughness:buildRoughnessMap()}),[])

  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    if(meshRef.current)  meshRef.current.rotation.y=t*0.045
    if(cloudRef.current) cloudRef.current.rotation.y=t*0.060
    if(pivotRef.current) pivotRef.current.rotation.y=t*0.20
    if(glowRef.current)  glowRef.current.material.opacity=0.18+Math.sin(t*0.5)*0.07
  })

  return(<>
    <ambientLight intensity={0.10}/>
    <directionalLight color="#fff6e8" intensity={4.0} position={[-6,2,5]}/>
    <pointLight color="#00FFD1" intensity={1.0} distance={20} position={[6,-2,-6]}/>
    <pointLight color="#FFB347" intensity={0.5} distance={15} position={[4,6,2]}/>
    <mesh ref={meshRef}>
      <sphereGeometry args={[2,256,256]}/>
      <meshStandardMaterial map={maps.color} emissiveMap={maps.emissive} roughnessMap={maps.roughness} emissive="#00FFD1" emissiveIntensity={0.40} roughness={0.85} metalness={0.04}/>
    </mesh>
    <mesh ref={cloudRef}>
      <sphereGeometry args={[2.038,64,64]}/>
      <meshStandardMaterial color="#c8fff5" transparent opacity={0.045} depthWrite={false} roughness={1}/>
    </mesh>
    <mesh ref={glowRef}>
      <sphereGeometry args={[2.22,64,64]}/>
      <meshBasicMaterial color="#00FFD1" transparent opacity={0.18} side={THREE.BackSide} depthWrite={false}/>
    </mesh>
    <mesh>
      <sphereGeometry args={[2.55,64,64]}/>
      <meshBasicMaterial color="#003322" transparent opacity={0.045} side={THREE.BackSide} depthWrite={false}/>
    </mesh>
    <mesh rotation={[Math.PI/2.5,0.05,0.25]}><torusGeometry args={[3.05,0.055,2,220]}/><meshBasicMaterial color="#00FFD1" transparent opacity={0.42}/></mesh>
    <mesh rotation={[Math.PI/2.5,0.05,0.25]}><torusGeometry args={[3.40,0.032,2,220]}/><meshBasicMaterial color="#7AAFC4" transparent opacity={0.20}/></mesh>
    <mesh rotation={[Math.PI/2.5,0.05,0.25]}><torusGeometry args={[3.72,0.018,2,220]}/><meshBasicMaterial color="#00FFD1" transparent opacity={0.09}/></mesh>
    <mesh rotation={[Math.PI/2.5,0.05,0.25]}><torusGeometry args={[4.05,0.010,2,220]}/><meshBasicMaterial color="#00FFD1" transparent opacity={0.04}/></mesh>
    <group ref={pivotRef}>
      <mesh position={[4.1,0.4,0]}><sphereGeometry args={[0.27,64,64]}/><meshStandardMaterial color="#1a3d2e" emissive="#00FFD1" emissiveIntensity={0.45} roughness={1}/></mesh>
      <mesh position={[4.1,0.4,0]}><sphereGeometry args={[0.40,32,32]}/><meshBasicMaterial color="#00FFD1" transparent opacity={0.06} side={THREE.BackSide}/></mesh>
    </group>
  </>)
}

export default function Planet(){
  return(
    <div style={{position:'absolute',right:'-2%',top:'50%',transform:'translateY(-50%)',width:'620px',height:'620px',zIndex:1,cursor:'grab'}}>
      <Canvas camera={{position:[0,1.2,7.5],fov:40}} gl={{antialias:true,alpha:true}}>
        <PlanetMesh/>
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.45}/>
      </Canvas>
    </div>
  )
}