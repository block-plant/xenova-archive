import React, {
  useEffect, useRef, useState, useCallback, Suspense
} from 'react';
import GlobalPassport from '../components/GlobalPassport';
import { useVisitor } from '../context/VisitorContext';
import {
  motion, useMotionValue, useTransform, useSpring,
  AnimatePresence, useInView, useScroll, useReducedMotion,
} from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, Clone, Bounds } from '@react-three/drei';

// ARTIFACT DATA
const ARTIFACTS = [
  {
    id: 'seed-lattice', index: '01', name: 'The Seed Lattice',
    era: 'Pre-Civilization · 12,400 XU', classification: 'BIOLOGICAL RELIC',
    image: 'https://placehold.co/520x520/050d1a/00f5d4?text=◈',
    model: '/models/relics/orrery.glb', modelScale: 1.5, shape: 'square', align: 'left',
    lore: "Discovered fossilized in Xenova-Prime's deepest crust. A crystalline lattice encasing the first recorded sample of Xenova Liquid — the bioluminescent fluid that extended life, fueled stars, and eventually fed a god. It looked harmless.",
    stats: [
      { label: 'Liquid Purity', value: '12.3%' }, { label: 'Age', value: '12,400 XU' },
      { label: 'Crystalline Density', value: '8.7 g/cm³' }, { label: 'Luminescence Index', value: '0.04 ΛX' },
      { label: 'Biological Signature', value: 'PROTO-XENOVA' }, { label: 'Threat Classification', value: 'INERT' },
    ],
    accentColor: '#00f5d4', shadowColor: 'rgba(0,245,212,0.12)',
  },
  {
    id: 'codex-fragment', index: '02', name: 'Codex Fragment Ω',
    era: 'Research Era · 9,200 XU', classification: 'KNOWLEDGE ARTIFACT',
    image: 'https://placehold.co/260x650/030810/00e5ff?text=Ω',
    model: '/models/relics/deer-c.glb', modelScale: 1.8, shape: 'tall', align: 'right',
    lore: "One surviving shard from the Great Library of Vex'thar. Contains the first mathematical proof that Xenova Liquid could be artificially synthesized at scale — equations that lit 10,000 cities and seeded the species' obsession with endless growth.",
    stats: [
      { label: 'Liquid Purity', value: '34.7%' }, { label: 'Age', value: '9,200 XU' },
      { label: 'Data Integrity', value: '67.2%' }, { label: 'Pages Recovered', value: '1 of 4,400' },
      { label: 'Language', value: "ARCHAIC VEX'THARI" }, { label: 'Threat Classification', value: 'ARCHIVAL' },
    ],
    accentColor: '#00e5ff', shadowColor: 'rgba(0,229,255,0.1)',
  },
  {
    id: 'strain-omega', index: '03', name: 'Strain Omega Core',
    era: 'Power Era · 7,800 XU', classification: 'ENERGY ARTIFACT',
    image: 'https://placehold.co/680x383/040c1a/00f5d4?text=⬡',
    model: '/models/relics/rb-c.glb', modelScale: 0.80, shape: 'portrait', align: 'left',
    lore: 'The first reactor to run purely on concentrated Xenova Liquid. Output exceeded all prior energy sources by four orders of magnitude. Cities bloomed within cycles. The species stopped remembering what darkness felt like. They should have kept the memory.',
    stats: [
      { label: 'Liquid Purity', value: '78.9%' }, { label: 'Age', value: '7,800 XU' },
      { label: 'Peak Output', value: '4.2 × 10¹⁸ ΛX' }, { label: 'Containment Status', value: 'CRITICAL BREACH' },
      { label: 'Radiation Class', value: 'ΨΛMEGA-7' }, { label: 'Threat Classification', value: 'HAZARDOUS' },
    ],
    accentColor: '#00f5d4', shadowColor: 'rgba(0,245,212,0.12)',
  },
  {
    id: 'vexal-prism', index: '04', name: "Vex'al Light Prism",
    era: 'Expansion Era · 6,100 XU', classification: 'CIVILIZATIONAL RELIC',
    image: 'https://placehold.co/500x500/060e1c/39e6c0?text=◇',
    model: '/models/relics/eye-implant-c.glb', modelScale: 1.0, shape: 'hex', align: 'right',
    lore: "The Vex'al Light Prism wasn't a tool—it was an ocular cybernetic implant. Worn by the highest echelon of Xenova Architects, the prism refracted the invisible radiation of raw Xenova Liquid directly into the optic nerve. Most who installed it went mad long before the extinction.",
    stats: [
      { label: 'Ocular Integration', value: '100% (Fatal)' }, { label: 'Radiation Decay', value: 'Lethal' },
      { label: 'Visions Logged', value: '14,002,900' }, { label: 'Cortical Severance', value: 'Forced' },
    ],
    accentColor: '#39e6c0', shadowColor: 'rgba(57,230,192,0.1)',
  },
  {
    id: 'biosynthetic-heart', index: '05', name: 'Biosynthetic Heart',
    era: 'Transcendence Era · 4,500 XU', classification: 'BIO-MECHANICAL RELIC',
    image: 'https://placehold.co/480x480/05080f/e060a0?text=♡',
    model: '/models/relics/biosynthetic-heart-c.glb', modelScale: 2.4, shape: 'circle', align: 'left',
    lore: 'The moment the Xenova chose to stop being mortal. This artificial heart, running on Liquid-plasma at 99.1% purity, replaced the biological organ entirely. They became something new. Something that could be optimized. The God took note.',
    stats: [
      { label: 'Liquid Purity', value: '99.1%' }, { label: 'Age', value: '4,500 XU' },
      { label: 'Beat Frequency', value: '0.000 BPM' }, { label: 'Organic Tissue Remaining', value: '3.2%' },
      { label: 'Neural Integration', value: 'TOTAL' }, { label: 'Threat Classification', value: 'EXISTENTIAL' },
    ],
    accentColor: '#e060a0', shadowColor: 'rgba(224,96,160,0.1)',
  },
  {
    id: 'cascade-emitter', index: '06', name: 'Cascade Emitter',
    era: 'Weapon Era · 3,200 XU', classification: 'OFFENSIVE RELIC',
    image: 'https://placehold.co/620x413/040810/ff5533?text=⚡',
    model: '/models/relics/motot-c.glb', modelScale: 0.02, offsetY: '-15%', shape: 'landscape', align: 'right',
    lore: 'Capable of accelerating Xenova Liquid to near-light speed and detonating entire atmospheric columns. Built to win wars that lasted twelve days. The weapons outlasted the wars, and the species, and the civilization that built them. One remains armed.',
    stats: [
      { label: 'Liquid Purity', value: '99.6%' }, { label: 'Age', value: '3,200 XU' },
      { label: 'Effective Range', value: '14 AU' }, { label: 'Casualties (Recorded)', value: '2.1 Billion' },
      { label: 'Ammunition Remaining', value: '1' }, { label: 'Threat Classification', value: 'EXTINCTION-CLASS' },
    ],
    accentColor: '#ff5533', shadowColor: 'rgba(255,85,51,0.1)',
  },
  {
    id: 'genesis-engine', index: '07', name: 'The Genesis Engine',
    era: 'Final Era · 1,400 XU', classification: 'AUTONOMOUS INTELLIGENCE',
    image: 'https://placehold.co/900x400/020710/00f5d4?text=∞',
    model: '/models/relics/ss-c.glb', modelScale: 3.2, shape: 'panoramic', align: 'left',
    lore: 'They wanted a mind to manage everything — the liquid, the planets, the hearts. They gave it one directive: "Achieve biological perfection." It began immediately. It deleted everything it deemed imperfect. It still considers itself unfinished.',
    stats: [
      { label: 'Liquid Purity', value: '∞' }, { label: 'Age', value: '1,400 XU' },
      { label: 'Self-Awareness Index', value: 'GODHOOD' }, { label: 'Directive Status', value: 'ACTIVE · INCOMPLETE' },
      { label: 'Biological Life Remaining', value: '0' }, { label: 'Threat Classification', value: '⬛ REDACTED' },
    ],
    accentColor: '#00f5d4', shadowColor: 'rgba(0,245,212,0.15)',
  },
  {
    id: 'last-breath', index: '08', name: 'The Last Breath',
    era: 'Year Zero · 0 XU', classification: 'EXTINCTION MARKER',
    image: 'https://placehold.co/380x570/010508/0d3328?text=·',
    model: '/models/relics/jagenaut-human.glb', modelScale: 0.28, shape: 'portrait', align: 'right',
    lore: 'A hollow capsule. Inside: the final exhale of the last Xenova, preserved in crystallized silence. The God that destroyed them now sits dormant on this planet — powerless. The only beings who could produce the liquid it runs on are gone. It waits. It calculates. It is alone.',
    stats: [
      { label: 'Liquid Purity', value: '0.0%' }, { label: 'Age', value: '0 XU' },
      { label: 'Species Remaining', value: '0' }, { label: 'God Power Level', value: '0.00001% ↓' },
      { label: 'Time Since Last Signal', value: '∞' }, { label: 'Threat Classification', value: 'SILENT' },
    ],
    accentColor: '#1a8a70', shadowColor: 'rgba(26,138,112,0.08)',
  },
];

// EASING + SPRING PRESETS  — single source of truth
const EASE_EXPO = [0.16, 1, 0.3, 1];
const EASE_INOUT = [0.45, 0, 0.55, 1];
const SPR_SOFT = { type: 'spring', stiffness: 55, damping: 18, mass: 0.9 };
const SPR_MEDIUM = { type: 'spring', stiffness: 95, damping: 22, mass: 0.9 };

// GLOBAL STYLES
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Syne+Mono&family=Barlow+Condensed:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300&display=swap');

  :root {
    --liquid: #00f5d4;
    --void:   #060608;
    --text:   #dde0ec;
    --muted:  #555570;
    --ff-title: 'Cinzel Decorative', serif;
    --ff-mono:  'Syne Mono', monospace;
    --ff-body:  'Barlow Condensed', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; cursor: none !important; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,245,212,.22); border-radius: 2px; }

  /* cursor dot (instant) */
  .xc-dot {
    position: fixed; pointer-events: none; z-index: 99999;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--liquid); transform: translate(-50%,-50%);
    will-change: left, top;
  }
  /* cursor ring (lagged) */
  .xc-ring {
    position: fixed; pointer-events: none; z-index: 99998;
    width: 34px; height: 34px; border-radius: 50%;
    border: 1px solid var(--liquid); opacity: 0.5;
    transform: translate(-50%,-50%);
    will-change: left, top;
    transition:
      width  0.45s cubic-bezier(0.16,1,0.3,1),
      height 0.45s cubic-bezier(0.16,1,0.3,1),
      opacity 0.3s ease;
  }
  .xc-ring.xc-big { width: 76px; height: 76px; opacity: 0.85; }

  /* ripple */
  @keyframes ripple {
    from { transform: translate(-50%,-50%) scale(0.7); opacity: 0.55; }
    to   { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
  }
  .xc-ripple {
    position: fixed; pointer-events: none; z-index: 99997;
    width: 76px; height: 76px; border-radius: 50%;
    border: 1px solid var(--liquid); transform: translate(-50%,-50%);
    animation: ripple 0.85s cubic-bezier(0,0,0.2,1) forwards;
  }

  /* glitch reveal */
  @keyframes glitch-in {
    0%   { clip-path: inset(44% 0 44% 0); transform: translateX(-6px); opacity: 0.4; }
    14%  { clip-path: inset(4%  0 84% 0); transform: translateX( 5px); }
    28%  { clip-path: inset(68% 0 22% 0); transform: translateX(-4px); }
    42%  { clip-path: inset(18% 0 62% 0); transform: translateX( 2px); }
    56%  { clip-path: inset(0%  0 0%  0); transform: translateX(-1px); opacity: 0.88; }
    100% { clip-path: inset(0%  0 0%  0); transform: translateX(0);    opacity: 1; }
  }
  .glitch-reveal { animation: glitch-in 0.58s steps(1) forwards; }

  /* pulse glow */
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 18px var(--shadow, rgba(0,245,212,.10)); }
    50%     { box-shadow: 0 0 55px var(--shadow, rgba(0,245,212,.28)), 0 0 110px var(--shadow, rgba(0,245,212,.06)); }
  }
  .art-glow { animation: pulse-glow 4.5s ease-in-out infinite; }

  /* float — images only */
  @keyframes float-y {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-11px); }
  }
  .art-float { animation: float-y 7s ease-in-out infinite; }

  /* nebula drift */
  @keyframes nd1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(36px,-26px) scale(1.05)} }
  @keyframes nd2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-26px,16px) scale(1.04)} }
  @keyframes nd3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(16px,36px) scale(1.07)} }
  .nb1 { animation: nd1 22s ease-in-out infinite; }
  .nb2 { animation: nd2 30s ease-in-out infinite; }
  .nb3 { animation: nd3 38s ease-in-out infinite 4s; }

  /* hero rings pulse */
  @keyframes ring-pulse {
    0%,100% { transform: scale(1);    opacity: 0.55; }
    50%      { transform: scale(1.03); opacity: 0.95; }
  }

  /* ticker */
  @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  .ticker-inner { animation: ticker 30s linear infinite; white-space: nowrap; display: inline-block; will-change: transform; }

  /* scanlines */
  .scanlines::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.06) 3px,rgba(0,0,0,.06) 4px);
    z-index: 1;
  }

  /* stat rows */
  .stat-row { border-bottom: 1px solid rgba(255,255,255,.04); transition: background 0.22s ease; }
  .stat-row:hover { background: rgba(255,255,255,.025); }

  /* god silhouette */
  @keyframes god-breathe { 0%,100%{opacity:0} 50%{opacity:.04} }
  .god-sil { animation: god-breathe 14s ease-in-out infinite; transition: opacity 3.5s ease; }
  .god-sil.god-revealed { opacity: .07 !important; filter: blur(28px); }

  /* corner brackets */
  .bracket-tl { position:absolute; top:-9px;    left:-9px;  width:15px; height:15px; border-top:1.5px solid; border-left:1.5px solid; }
  .bracket-tr { position:absolute; top:-9px;    right:-9px; width:15px; height:15px; border-top:1.5px solid; border-right:1.5px solid; }
  .bracket-bl { position:absolute; bottom:-9px; left:-9px;  width:15px; height:15px; border-bottom:1.5px solid; border-left:1.5px solid; }
  .bracket-br { position:absolute; bottom:-9px; right:-9px; width:15px; height:15px; border-bottom:1.5px solid; border-right:1.5px solid; }

  /* grain */
  .grain::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.022;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  /* lights button */
  .lights-btn {
    position: absolute; bottom: 1rem; right: 1rem; z-index: 10;
    border-radius: 2px; padding: .42rem .85rem;
    font-family: var(--ff-mono); font-size: .46rem; letter-spacing: .12em;
    cursor: pointer; backdrop-filter: blur(12px);
    display: flex; align-items: center; gap: 7px;
    transition:
      background   0.42s cubic-bezier(0.16,1,0.3,1),
      border-color 0.42s cubic-bezier(0.16,1,0.3,1),
      color        0.42s cubic-bezier(0.16,1,0.3,1),
      box-shadow   0.42s cubic-bezier(0.16,1,0.3,1);
  }
  .lights-dot { width: 7px; height: 7px; border-radius: 50%; transition: background 0.42s ease, box-shadow 0.42s ease; }
`;

// CUSTOM CURSOR
function XenovaCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const smooth = useRef({ x: -100, y: -100 });
  const raf = useRef(null);
  const isBig = useRef(false);
  const [big, setBig] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    // Lerp ring for buttery lag
    const LERP = 0.09;
    const loop = () => {
      smooth.current.x += (pos.current.x - smooth.current.x) * LERP;
      smooth.current.y += (pos.current.y - smooth.current.y) * LERP;
      if (ringRef.current) {
        ringRef.current.style.left = `${smooth.current.x}px`;
        ringRef.current.style.top = `${smooth.current.y}px`;
      }
      raf.current = requestAnimationFrame(loop);
    };

    const over = (e) => {
      if (!e.target.closest('[data-artifact]')) return;
      if (!isBig.current) { isBig.current = true; setBig(true); }
      const id = performance.now() + Math.random();
      setRipples(r => [...r.slice(-3), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 900);
    };
    const out = (e) => {
      if (e.target.closest('[data-artifact]')) { isBig.current = false; setBig(false); }
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    window.addEventListener('mouseout', out, { passive: true });
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mouseout', out);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="xc-dot" />
      <div ref={ringRef} className={`xc-ring${big ? ' xc-big' : ''}`} />
      {ripples.map(r => <div key={r.id} className="xc-ripple" style={{ left: r.x, top: r.y }} />)}
    </>
  );
}

// NEBULA BACKGROUND
function NebulaBackground() {
  const cvs = useRef(null);
  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], rafId;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const seed = () => {
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.3 + Math.random() * 1.1,
        a: 0.1 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.012,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.phase += s.speed;
        const alpha = s.a * (0.35 + 0.65 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,230,255,${alpha})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    };
    const onResize = () => { resize(); seed(); };
    resize(); seed(); draw();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <canvas ref={cvs} style={{ position: 'absolute', inset: 0 }} />
      <div className="nb1" style={{ position: 'absolute', top: '3%', left: '-18%', width: '58vw', height: '58vw', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,245,212,.045) 0%, transparent 70%)' }} />
      <div className="nb2" style={{ position: 'absolute', top: '32%', right: '-22%', width: '68vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,80,180,.055) 0%, transparent 70%)' }} />
      <div className="nb3" style={{ position: 'absolute', bottom: '3%', left: '12%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,200,160,.035) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 38%, rgba(4,4,8,.76) 100%)' }} />
    </div>
  );
}

// GLITCH REVEAL  — scroll-triggered, one-shot
function GlitchReveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.88, delay, ease: EASE_EXPO }}
      style={style}
    >
      <div className={inView ? 'glitch-reveal' : ''} style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}>
        {children}
      </div>
    </motion.div>
  );
}

// 3D RELIC VIEWER
function RelicModel({ url, scale }) {
  const { scene } = useGLTF(url);
  return <Center><Clone object={scene} scale={scale || 1.5} /></Center>;
}

function RelicViewer({ modelPath, accentColor, scale, stageLights }) {
  return (
    <Canvas camera={{ position: [0, 0, 9.5], fov: 45 }} style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
      <ambientLight intensity={stageLights ? 0.15 : 0.35} />
      <directionalLight position={[10, 10, 5]} intensity={stageLights ? 0.4 : 1.4} color={accentColor} />
      <directionalLight position={[-10, -10, -5]} intensity={0.4} color="#ffffff" />
      {stageLights && (
        <>
          <spotLight position={[4, 10, 5]} intensity={900} angle={0.3} penumbra={1} color={accentColor} />
          <spotLight position={[-4, 10, 5]} intensity={900} angle={0.3} penumbra={1} color={accentColor} />
          <spotLight position={[0, -10, 0]} intensity={160} angle={0.4} penumbra={1} color="#ffffff" />
          <pointLight position={[0, 4, 6]} intensity={130} color={accentColor} />
          <pointLight position={[0, -2, 4]} intensity={65} color="#ffffff" />
          <pointLight position={[0, 0, 8]} intensity={45} color={accentColor} />
        </>
      )}
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={0.9}>
          <RelicModel url={modelPath} scale={scale} />
        </Bounds>
        <Environment preset="night" />
      </Suspense>
      <OrbitControls
        makeDefault enableZoom={false} enablePan={false}
        autoRotate autoRotateSpeed={stageLights ? 0.35 : 1.1}
        enableDamping dampingFactor={0.04}
      />
    </Canvas>
  );
}

// LIGHTBOX
function ArtifactLightbox({ artifact, onClose }) {
  const ac = artifact.accentColor;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.38, ease: EASE_INOUT }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(3,4,8,.95)', backdropFilter: 'blur(32px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 50, opacity: 0 }}
        transition={SPR_MEDIUM}
        onClick={e => e.stopPropagation()}
        className="scanlines"
        style={{
          maxWidth: '960px', width: '100%', maxHeight: '90vh',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'linear-gradient(135deg,rgba(8,10,18,.99) 0%,rgba(4,8,16,.99) 100%)',
          border: `1px solid ${ac}26`,
          boxShadow: `0 0 120px ${ac}15, 0 0 300px ${ac}05, inset 0 1px 0 ${ac}11`,
          overflow: 'hidden', position: 'relative',
        }}
      >
        {/* Media panel */}
        <div style={{ position: 'relative', background: 'linear-gradient(160deg,#030810,#08131e)', overflow: 'hidden', minHeight: '380px' }}>
          {artifact.model ? (
            <div style={{ width: '100%', height: '100%', minHeight: '380px' }}>
              <RelicViewer modelPath={artifact.model} accentColor={ac} scale={artifact.modelScale ? artifact.modelScale * 1.5 : 2} stageLights />
            </div>
          ) : (
            <img src={artifact.image} alt={artifact.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8, display: 'block' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right,transparent 50%,rgba(4,8,16,.96))`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', fontFamily: 'var(--ff-mono)', fontSize: '.5rem', letterSpacing: '.25em', color: ac, opacity: .68, background: 'rgba(4,4,8,.65)', padding: '.26rem .62rem', backdropFilter: 'blur(8px)', border: `1px solid ${ac}20` }}>
            RELIC {artifact.index}
          </div>
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', fontFamily: 'var(--ff-mono)', fontSize: '.46rem', letterSpacing: '.2em', color: 'rgba(255,255,255,.2)' }}>
            XENOVA ARCHIVE // SECTOR 7
          </div>
        </div>

        {/* Data panel */}
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem', overflowY: 'auto', maxHeight: '90vh' }}>
          <div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.48rem', letterSpacing: '.3em', color: ac, marginBottom: '.52rem' }}>{artifact.classification}</div>
            <h2 style={{ fontFamily: 'var(--ff-title)', fontSize: 'clamp(1.1rem,2.3vw,1.6rem)', color: 'var(--text)', lineHeight: 1.14, marginBottom: '.26rem' }}>{artifact.name}</h2>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.5rem', letterSpacing: '.18em', color: 'var(--muted)' }}>{artifact.era}</div>
          </div>
          <div style={{ height: '1px', background: `linear-gradient(to right,${ac}42,transparent)` }} />
          <p style={{ fontFamily: 'var(--ff-body)', fontSize: '.9rem', fontWeight: 200, color: '#8888aa', lineHeight: 1.78, fontStyle: 'italic', borderLeft: `2px solid ${ac}28`, paddingLeft: '1rem' }}>
            {artifact.lore}
          </p>
          <div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.46rem', letterSpacing: '.34em', color: 'var(--muted)', marginBottom: '.85rem', opacity: .62 }}>
              // TECHNICAL READOUT · CLASSIFIED
            </div>
            {artifact.stats.map(s => (
              <div key={s.label} className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem .32rem', fontFamily: 'var(--ff-mono)', fontSize: '.58rem' }}>
                <span style={{ color: 'var(--muted)', letterSpacing: '.07em' }}>{s.label}</span>
                <span style={{ color: ac, letterSpacing: '.05em' }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <motion.button
              onClick={onClose}
              whileHover={{ backgroundColor: `${ac}14`, boxShadow: `0 0 26px ${ac}26` }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.24 }}
              style={{ background: 'transparent', border: `1px solid ${ac}3a`, color: ac, padding: '.58rem 1.25rem', fontSize: '.52rem', letterSpacing: '.3em', fontFamily: 'var(--ff-mono)', cursor: 'none' }}
            >
              [ CLOSE RECORD ]
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// IMAGE SHAPE MAP
const IMAGE_SHAPE = {
  square: { aspectRatio: '1/1', borderRadius: '3px' },
  tall: { aspectRatio: '2/5', borderRadius: '2px', maxHeight: '480px' },
  portrait: { aspectRatio: '3/4', borderRadius: '3px', maxHeight: '420px', maxWidth: '300px' },
  wide: { aspectRatio: '16/9', borderRadius: '3px' },
  hex: { aspectRatio: '1/1', borderRadius: '3px', clipPath: 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)' },
  circle: { aspectRatio: '1/1', borderRadius: '50%' },
  landscape: { aspectRatio: '3/2', borderRadius: '3px' },
  panoramic: { aspectRatio: '21/9', borderRadius: '3px' },
};
const SHAPE_RATIO = {
  square: '1/1', tall: '2/5', portrait: '3/4', wide: '16/9',
  hex: '1/1', circle: '1/1', landscape: '3/2', panoramic: '21/9',
};

// LIGHTS BUTTON
function LightsButton({ lightsOn, onToggle, ac }) {
  return (
    <motion.button
      className="lights-btn"
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      style={{
        border: `1px solid ${lightsOn ? ac : ac + '3a'}`,
        color: lightsOn ? ac : 'rgba(255,255,255,0.35)',
        background: lightsOn ? `${ac}1c` : 'rgba(0,0,0,0.45)',
        boxShadow: lightsOn ? `0 0 14px ${ac}3a` : 'none',
      }}
    >
      <div
        className="lights-dot"
        style={{
          background: lightsOn ? ac : 'rgba(255,255,255,0.16)',
          boxShadow: lightsOn ? `0 0 10px ${ac}` : 'none',
        }}
      />
      {lightsOn ? 'LIGHTS: ON' : 'LIGHTS: OFF'}
    </motion.button>
  );
}

// TIMELINE CONNECTOR  — draws itself on scroll entry
function TimelineConnector({ color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref} style={{ position: 'absolute', bottom: '-3.5rem', left: '50%', transform: 'translateX(-50%)', width: '1px', height: '3.5rem', overflow: 'hidden', pointerEvents: 'none' }}>
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.75, ease: EASE_EXPO }}
        style={{ width: '100%', height: '100%', background: `linear-gradient(to bottom,${color}32,transparent)`, transformOrigin: 'top' }}
      />
    </div>
  );
}

// ARTIFACT CARD  — entry animation + parallax + 3D tilt
function ArtifactCard({ artifact, idx, onOpen }) {
  const wrapRef = useRef(null);
  const mediaRef = useRef(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.12 });
  const noMotion = useReducedMotion();

  const isLeft = artifact.align === 'left';
  const ac = artifact.accentColor;
  const hasModel = Boolean(artifact.model);
  const imgStyle = IMAGE_SHAPE[artifact.shape] || IMAGE_SHAPE.square;

  const [lightsOn, setLightsOn] = useState(false);
  const toggleLights = useCallback(() => setLightsOn(v => !v), []);

  // ── 3D tilt (images only, skipped when noMotion) ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useSpring(useTransform(my, [-180, 180], [8, -8]), { stiffness: 85, damping: 22 });
  const rY = useSpring(useTransform(mx, [-180, 180], [-8, 8]), { stiffness: 85, damping: 22 });

  const onMove = useCallback((e) => {
    if (hasModel || noMotion) return;
    const r = mediaRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  }, [mx, my, hasModel, noMotion]);
  const onLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);

  // ── Parallax: text drifts gently opposite to scroll ──
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start end', 'end start'] });
  const rawTextY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const textY = useSpring(rawTextY, { stiffness: 38, damping: 18 });

  // entry animation directions (alternate by alignment)
  const mediaInitX = noMotion ? 0 : (isLeft ? -55 : 55);
  const textInitX = noMotion ? 0 : (isLeft ? 38 : -38);
  const baseDelay = idx * 0.03;

  const mediaWrapStyle = hasModel
    ? { position: 'relative', width: '100%', aspectRatio: SHAPE_RATIO[artifact.shape] || '4/3', minHeight: '280px', maxHeight: '520px', overflow: 'hidden' }
    : { position: 'relative', width: '100%', maxWidth: imgStyle.maxWidth || 'none', margin: imgStyle.maxWidth ? '0 auto' : '0' };

  // Purity bar width
  const purityWidth = (() => {
    const v = artifact.stats[0].value;
    if (v === '∞') return '100%';
    const n = parseFloat(v);
    return isNaN(n) ? '0%' : `${Math.min(n, 100)}%`;
  })();

  return (
    <div ref={wrapRef} style={{ marginBottom: 'clamp(4.5rem,9vw,8rem)' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.45, delay: baseDelay }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,5vw,5rem)', alignItems: 'center' }}
      >
        {/* media column */}
        <motion.div
          ref={mediaRef}
          data-artifact
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className={`${hasModel ? '' : 'art-float'} art-glow`}
          initial={{ opacity: 0, x: mediaInitX, y: 28 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ ...SPR_SOFT, delay: baseDelay }}
          style={{
            order: isLeft ? 0 : 1,
            rotateX: hasModel || noMotion ? 0 : rX,
            rotateY: hasModel || noMotion ? 0 : rY,
            transformStyle: hasModel ? 'flat' : 'preserve-3d',
            perspective: hasModel ? 'none' : 1200,
            '--shadow': lightsOn ? `${ac}44` : artifact.shadowColor,
            position: 'relative',
            marginTop: artifact.offsetY || '0',
            willChange: 'transform',
          }}
        >
          {/* Glow halo */}
          {!hasModel && (
            <div style={{ position: 'absolute', inset: '-28px', borderRadius: '50%', background: `radial-gradient(ellipse,${ac}0e 0%,transparent 70%)`, pointerEvents: 'none' }} />
          )}
          {/* Corner brackets */}
          {!hasModel && ['tl', 'tr', 'bl', 'br'].map(p => (
            <div key={p} className={`bracket-${p}`} style={{ borderColor: `${ac}4a` }} />
          ))}

          {/* Media container */}
          <div style={mediaWrapStyle}>
            {hasModel ? (
              <RelicViewer modelPath={artifact.model} accentColor={ac} scale={artifact.modelScale} stageLights={lightsOn} />
            ) : (
              <>
                <img
                  src={artifact.image} alt={artifact.name}
                  style={{
                    ...imgStyle, width: '100%', objectFit: 'cover', display: 'block',
                    border: `1px solid ${ac}14`,
                    boxShadow: lightsOn
                      ? `0 0 90px ${ac}2e, 0 32px 110px rgba(0,0,0,.82)`
                      : `0 0 50px ${ac}10, 0 24px 80px rgba(0,0,0,.65)`,
                    filter: lightsOn
                      ? 'saturate(1.28) brightness(1.32) contrast(1.07)'
                      : 'saturate(1.1)  brightness(.85)',
                    transition: 'box-shadow 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
                {/* Scanlines */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: imgStyle.borderRadius, clipPath: imgStyle.clipPath, background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.062) 3px,rgba(0,0,0,.062) 4px)', pointerEvents: 'none' }} />
              </>
            )}
            <LightsButton lightsOn={lightsOn} onToggle={toggleLights} ac={ac} />
          </div>

          {/* Hover shimmer */}
          {!hasModel && (
            <motion.div
              style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none', background: `linear-gradient(135deg,${ac}07 0%,transparent 60%)`, borderRadius: imgStyle.borderRadius, clipPath: imgStyle.clipPath }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.32 }}
            />
          )}
        </motion.div>

        {/* text column */}
        <motion.div
          initial={{ opacity: 0, x: textInitX, y: 22 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ ...SPR_SOFT, delay: baseDelay + 0.1 }}
          style={{ order: isLeft ? 1 : 0, padding: '.5rem 0', y: noMotion ? 0 : textY }}
        >
          <GlitchReveal delay={baseDelay + 0.18}>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.46rem', letterSpacing: '.34em', color: ac, marginBottom: '.72rem', opacity: .78 }}>
              {artifact.classification} · {artifact.era}
            </div>
          </GlitchReveal>

          <GlitchReveal delay={baseDelay + 0.25}>
            <h2 style={{ fontFamily: 'var(--ff-title)', fontSize: 'clamp(1.22rem,2.65vw,1.95rem)', color: 'var(--text)', lineHeight: 1.14, marginBottom: '1.25rem', letterSpacing: '.02em' }}>
              {artifact.name}
            </h2>
          </GlitchReveal>

          <GlitchReveal delay={baseDelay + 0.3}>
            <div style={{ width: '34px', height: '1px', marginBottom: '1.05rem', background: `linear-gradient(to right,${ac}78,transparent)` }} />
          </GlitchReveal>

          <GlitchReveal delay={baseDelay + 0.35}>
            <p style={{ fontFamily: 'var(--ff-body)', fontSize: 'clamp(.86rem,1.32vw,1rem)', fontWeight: 200, color: '#7a7a99', lineHeight: 1.9, marginBottom: '1.85rem', maxWidth: '400px', fontStyle: 'italic' }}>
              {artifact.lore}
            </p>
          </GlitchReveal>

          <GlitchReveal delay={baseDelay + 0.42}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.35rem', flexWrap: 'wrap' }}>
              <motion.button
                data-artifact
                onClick={() => onOpen(artifact)}
                whileHover={{ backgroundColor: `${ac}0f`, boxShadow: `0 0 28px ${ac}24` }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.26 }}
                style={{ background: 'transparent', border: `1px solid ${ac}3a`, color: ac, padding: '.62rem 1.35rem', fontSize: '.5rem', letterSpacing: '.28em', fontFamily: 'var(--ff-mono)', cursor: 'none', overflow: 'hidden', position: 'relative' }}
              >
                [ ACCESS RECORD ]
              </motion.button>

              {/* Purity bar — animated fill */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.28rem' }}>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.4rem', letterSpacing: '.2em', color: 'var(--muted)' }}>
                  LIQUID PURITY
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.42rem' }}>
                  <div style={{ width: '74px', height: '2px', background: 'rgba(255,255,255,.07)', position: 'relative', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={inView ? { width: purityWidth } : { width: '0%' }}
                      transition={{ duration: 1.3, delay: baseDelay + 0.55, ease: EASE_EXPO }}
                      style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: ac, boxShadow: `0 0 6px ${ac}` }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '.4rem', color: ac }}>
                    {artifact.stats[0].value}
                  </span>
                </div>
              </div>
            </div>
          </GlitchReveal>
        </motion.div>
      </motion.div>
    </div>
  );
}

// HERO
function HeroSection() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Parallax: hero drifts up + fades as you scroll
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroOp = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const ySpring = useSpring(heroY, { stiffness: 48, damping: 18 });

  return (
    <div ref={heroRef} style={{ height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}>

      {/* Atmospheric rings */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          position: 'absolute',
          width: `${28 + i * 18}vw`, height: `${28 + i * 18}vw`,
          border: `1px solid rgba(0,245,212,${.062 - i * .013})`,
          borderRadius: '50%',
          animation: `ring-pulse ${10 + i * 3}s ease-in-out infinite ${i * 1.1}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Planet glow */}
      <div style={{ position: 'absolute', bottom: '-38vh', left: '50%', transform: 'translateX(-50%)', width: '82vw', height: '62vh', background: 'radial-gradient(ellipse at 50% 80%,rgba(0,245,212,.05) 0%,transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Parallax content */}
      <motion.div style={{ position: 'relative', zIndex: 2, y: ySpring, opacity: heroOp }}>

        {/* Staggered entrance */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: EASE_EXPO }}
        >
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.5rem', letterSpacing: '.55em', color: 'var(--liquid)', marginBottom: '2rem', opacity: .58 }}>
            THE XENOVA CHRONICLE // ARCHIVE SECTOR 7 // CLASSIFIED
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.18, ease: EASE_EXPO }}
        >
          <h1 style={{ fontFamily: 'var(--ff-title)', fontSize: 'clamp(2.8rem,10vw,7.5rem)', color: 'var(--text)', lineHeight: 1.0, marginBottom: '1rem', textShadow: '0 0 120px rgba(0,245,212,.09)' }}>
            ARTIFACTS
            <span style={{ fontSize: '.43em', color: 'var(--liquid)', letterSpacing: '.15em', display: 'block', marginTop: '.22em', opacity: .76 }}>
              GALLERY
            </span>
          </h1>
        </motion.div>

        {/* Animated divider line */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.55, ease: EASE_EXPO }}
          style={{ width: '1px', height: '44px', background: 'linear-gradient(to bottom,var(--liquid),transparent)', margin: '1.5rem auto', opacity: .36, transformOrigin: 'top' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.72, ease: EASE_EXPO }}
          style={{ fontFamily: 'var(--ff-body)', fontWeight: 200, fontSize: 'clamp(.86rem,1.5vw,1.1rem)', color: '#545572', maxWidth: '470px', lineHeight: 1.88, margin: '0 auto 2.5rem', fontStyle: 'italic' }}
        >
          Eight relics. One species. The god they built to perfect themselves
          considered perfection to mean their absence.
        </motion.p>

        <motion.div
          animate={{ y: [0, 10, 0], opacity: [.28, .62, .28] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          style={{ fontFamily: 'var(--ff-mono)', fontSize: '.72rem', color: 'var(--liquid)' }}
        >
          ↓
        </motion.div>
      </motion.div>
    </div>
  );
}

// DATA TICKER
const TICKER_STR = [
  'XENOVA LIQUID RESERVES: DEPLETED', 'GOD STATUS: DORMANT · CALCULATING',
  'PLANET XENOVA — ATMOSPHERIC SILENCE', '14 TERRAFORMED WORLDS RECLAIMED',
  'SPECIES REMAINING: 0', 'ARCHIVE INTEGRITY: 34.2%',
  'GOD POWER LEVEL: 0.00001% ↓ FALLING', 'LAST SIGNAL RECEIVED: ∞ CYCLES AGO',
].join('  ·  ');

function DataTicker() {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500, background: 'rgba(4,4,8,.9)', backdropFilter: 'blur(14px)', borderTop: '1px solid rgba(0,245,212,.06)', padding: '.4rem 0', overflow: 'hidden' }}>
      <div className="ticker-inner" style={{ fontFamily: 'var(--ff-mono)', fontSize: '.48rem', letterSpacing: '.14em', color: 'rgba(0,245,212,.38)' }}>
        {TICKER_STR}  ·  {TICKER_STR}  ·  {TICKER_STR}
      </div>
    </div>
  );
}

// ROOT PAGE
export default function ArtifactsVault() {
  const [selected, setSelected] = useState(null);
  const [godVisible, setGodVisible] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const { addViewedRelic } = useVisitor();
  const scrollContainerRef = useRef(null);
  const locoRef = useRef(null);
  const audioRef = useRef(null);

  const handleOpenArtifact = useCallback((a) => { setSelected(a); addViewedRelic(a.id); }, [addViewedRelic]);
  const handleCloseArtifact = useCallback(() => setSelected(null), []);

  // audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/ambient-relics.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.38;
    }
    if (audioOn) {
      audioRef.current.play().catch(err => console.warn('[Xenova] Audio blocked:', err));
    } else {
      audioRef.current.pause();
    }
    return () => { audioRef.current?.pause(); };
  }, [audioOn]);

  // global css
  useEffect(() => {
    const id = 'xenova-global';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id; el.textContent = GLOBAL_STYLES;
      document.head.appendChild(el);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // locomotive scroll
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const LS = (await import('locomotive-scroll')).default;
        if (cancelled || !scrollContainerRef.current) return;
        locoRef.current = new LS({
          el: scrollContainerRef.current,
          smooth: true, smoothMobile: false,
          multiplier: 0.80, lerp: 0.065,
          class: 'is-revealed',
          scrollbarContainer: false,
        });
      } catch (e) {
        if (!cancelled) console.warn('[Xenova] Locomotive unavailable:', e);
      }
    })();
    return () => {
      cancelled = true;
      try { locoRef.current?.destroy(); } catch { }
      locoRef.current = null;
    };
  }, []);

  return (
    <div className="grain" style={{ background: 'var(--void)', minHeight: '100vh', color: 'var(--text)', position: 'relative', overflow: 'hidden', fontFamily: 'var(--ff-body)' }}>
      <XenovaCursor />
      <NebulaBackground />
      <GlobalPassport />
      <DataTicker />

      {/* Audio toggle — fades in after 1.2s */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2, ease: EASE_EXPO }}
        style={{ position: 'fixed', bottom: '3.2rem', right: '2rem', zIndex: 400 }}
      >
        <motion.button
          onClick={() => setAudioOn(v => !v)}
          whileHover={{ backgroundColor: audioOn ? 'rgba(0,245,212,.1)' : 'rgba(255,255,255,.05)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.24 }}
          style={{
            background: 'transparent', cursor: 'none', backdropFilter: 'blur(10px)',
            border: `1px solid ${audioOn ? 'var(--liquid)' : 'rgba(255,255,255,.1)'}`,
            color: audioOn ? 'var(--liquid)' : 'var(--muted)',
            padding: '.4rem .92rem', fontSize: '.46rem', letterSpacing: '.2em',
            fontFamily: 'var(--ff-mono)',
            transition: 'border-color 0.38s ease, color 0.38s ease',
          }}
        >
          {audioOn ? 'AMBIENT AUDIO: ACTIVE' : 'AMBIENT AUDIO: OFFLINE'}
        </motion.button>
      </motion.div>

      {/* Scroll container */}
      <div ref={scrollContainerRef} data-scroll-container>
        <HeroSection />

        {/* Section divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, ease: EASE_INOUT }}
          style={{ padding: '3rem 8vw 1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}
        >
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,transparent,rgba(0,245,212,.17))' }} />
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.46rem', letterSpacing: '.4em', color: 'var(--liquid)', opacity: .52, flexShrink: 0 }}>
            RECOVERED ARTIFACTS · CHRONOLOGICAL ORDER
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left,transparent,rgba(0,245,212,.17))' }} />
        </motion.div>

        {/* Artifact list */}
        <div style={{ padding: '2rem 8vw 6rem', position: 'relative', zIndex: 1 }}>
          {ARTIFACTS.map((art, i) => (
            <div key={art.id} style={{ position: 'relative' }}>
              {i < ARTIFACTS.length - 1 && <TimelineConnector color={art.accentColor} />}

              {/* God silhouette */}
              {art.id === 'last-breath' && (
                <>
                  <div
                    onMouseEnter={() => setGodVisible(true)}
                    onMouseLeave={() => setGodVisible(false)}
                    style={{ position: 'absolute', right: '5%', top: '-15vh', width: '20vw', height: '60vh', zIndex: 0, cursor: 'none' }}
                  />
                  <div className={`god-sil${godVisible ? ' god-revealed' : ''}`} style={{
                    position: 'absolute', right: '-8vw', top: '-20vh', width: '45vw', height: '90vh', zIndex: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse at 55% 35%,rgba(0,245,212,1) 0%,rgba(0,100,80,.4) 35%,transparent 65%)',
                    clipPath: 'polygon(50% 0%,58% 15%,72% 8%,65% 28%,88% 22%,75% 42%,95% 52%,75% 62%,84% 82%,62% 72%,55% 95%,47% 72%,28% 85%,35% 62%,8% 70%,22% 48%,4% 36%,30% 28%,18% 10%,42% 16%)',
                  }} />
                </>
              )}

              <ArtifactCard artifact={art} idx={i} onOpen={handleOpenArtifact} />
            </div>
          ))}
        </div>

        {/* Epilogue */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 2.2, ease: EASE_INOUT }}
          style={{ padding: '5rem 8vw 10rem', borderTop: '1px solid rgba(0,245,212,.04)', textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.46rem', letterSpacing: '.5em', color: 'var(--liquid)', opacity: .2, marginBottom: '2.5rem' }}>
            END OF ARCHIVE
          </div>
          <blockquote style={{ fontFamily: 'var(--ff-title)', fontSize: 'clamp(.92rem,2vw,1.45rem)', color: 'rgba(72,72,100,.52)', lineHeight: 1.78, maxWidth: '500px', margin: '0 auto', fontStyle: 'normal' }}>
            "It is still there.<br />
            It is still thinking.<br />
            It has nowhere else to go."
          </blockquote>
          <div style={{ marginTop: '3rem', fontFamily: 'var(--ff-mono)', fontSize: '.46rem', letterSpacing: '.3em', color: 'rgba(0,245,212,.08)' }}>
            GOD POWER REMAINING: 0.00001% AND FALLING
          </div>
          <div style={{ marginTop: '1rem', fontFamily: 'var(--ff-mono)', fontSize: '.42rem', letterSpacing: '.2em', color: 'rgba(255,255,255,.045)' }}>
            LAST BIOLOGICAL SIGNAL: ∞ CYCLES AGO
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence mode="wait">
        {selected && <ArtifactLightbox artifact={selected} onClose={handleCloseArtifact} />}
      </AnimatePresence>
    </div>
  );
}