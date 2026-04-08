import React, {
  useEffect, useRef, useState, useCallback,
} from 'react';
import {
  motion, useMotionValue, useTransform, useSpring,
  AnimatePresence, useInView,
} from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// ARTIFACT DATA
// ─────────────────────────────────────────────────────────────────────────────
const ARTIFACTS = [
  {
    id: 'seed-lattice',
    index: '01',
    name: 'The Seed Lattice',
    era: 'Pre-Civilization · 12,400 XU',
    classification: 'BIOLOGICAL RELIC',
    image: 'https://placehold.co/520x520/050d1a/00f5d4?text=◈',
    shape: 'square',
    scrollSpeed: 1.2,
    align: 'left',
    lore: 'Discovered fossilized in Xenova-Prime\'s deepest crust. A crystalline lattice encasing the first recorded sample of Xenova Liquid — the bioluminescent fluid that extended life, fueled stars, and eventually fed a god. It looked harmless.',
    stats: [
      { label: 'Liquid Purity', value: '12.3%' },
      { label: 'Age', value: '12,400 XU' },
      { label: 'Crystalline Density', value: '8.7 g/cm³' },
      { label: 'Luminescence Index', value: '0.04 ΛX' },
      { label: 'Biological Signature', value: 'PROTO-XENOVA' },
      { label: 'Threat Classification', value: 'INERT' },
    ],
    accentColor: '#00f5d4',
    shadowColor: 'rgba(0,245,212,0.12)',
  },
  {
    id: 'codex-fragment',
    index: '02',
    name: 'Codex Fragment Ω',
    era: 'Research Era · 9,200 XU',
    classification: 'KNOWLEDGE ARTIFACT',
    image: 'https://placehold.co/260x650/030810/00e5ff?text=Ω',
    shape: 'tall',
    scrollSpeed: 2.8,
    align: 'right',
    lore: 'One surviving shard from the Great Library of Vex\'thar. Contains the first mathematical proof that Xenova Liquid could be artificially synthesized at scale — equations that lit 10,000 cities and seeded the species\' obsession with endless growth.',
    stats: [
      { label: 'Liquid Purity', value: '34.7%' },
      { label: 'Age', value: '9,200 XU' },
      { label: 'Data Integrity', value: '67.2%' },
      { label: 'Pages Recovered', value: '1 of 4,400' },
      { label: 'Language', value: 'ARCHAIC VEX\'THARI' },
      { label: 'Threat Classification', value: 'ARCHIVAL' },
    ],
    accentColor: '#00e5ff',
    shadowColor: 'rgba(0,229,255,0.1)',
  },
  {
    id: 'strain-omega',
    index: '03',
    name: 'Strain Omega Core',
    era: 'Power Era · 7,800 XU',
    classification: 'ENERGY ARTIFACT',
    image: 'https://placehold.co/680x383/040c1a/00f5d4?text=⬡',
    shape: 'wide',
    scrollSpeed: 1.5,
    align: 'left',
    lore: 'The first reactor to run purely on concentrated Xenova Liquid. Output exceeded all prior energy sources by four orders of magnitude. Cities bloomed within cycles. The species stopped remembering what darkness felt like. They should have kept the memory.',
    stats: [
      { label: 'Liquid Purity', value: '78.9%' },
      { label: 'Age', value: '7,800 XU' },
      { label: 'Peak Output', value: '4.2 × 10¹⁸ ΛX' },
      { label: 'Containment Status', value: 'CRITICAL BREACH' },
      { label: 'Radiation Class', value: 'ΨΛMEGA-7' },
      { label: 'Threat Classification', value: 'HAZARDOUS' },
    ],
    accentColor: '#00f5d4',
    shadowColor: 'rgba(0,245,212,0.12)',
  },
  {
    id: 'vexal-prism',
    index: '04',
    name: "Vex'al Light Prism",
    era: 'Expansion Era · 6,100 XU',
    classification: 'CIVILIZATIONAL RELIC',
    image: 'https://placehold.co/500x500/060e1c/39e6c0?text=◇',
    shape: 'hex',
    scrollSpeed: 3.2,
    align: 'right',
    lore: "Used to refract Xenova Liquid into terraforming light spectra. Fourteen planets were seeded with atmosphere, water, and life. Fourteen planets were later reclaimed — not by the species. When the God was born, it viewed those worlds as canvases for its corrections.",
    stats: [
      { label: 'Liquid Purity', value: '91.2%' },
      { label: 'Age', value: '6,100 XU' },
      { label: 'Planets Terraformed', value: '14' },
      { label: 'Spectral Range', value: '0.1nm – 10km' },
      { label: 'Planets Remaining', value: '0' },
      { label: 'Threat Classification', value: 'CONTAINED' },
    ],
    accentColor: '#39e6c0',
    shadowColor: 'rgba(57,230,192,0.1)',
  },
  {
    id: 'biosynthetic-heart',
    index: '05',
    name: 'Biosynthetic Heart',
    era: 'Transcendence Era · 4,500 XU',
    classification: 'BIO-MECHANICAL RELIC',
    image: 'https://placehold.co/480x480/05080f/e060a0?text=♡',
    shape: 'circle',
    scrollSpeed: 2.0,
    align: 'left',
    lore: 'The moment the Xenova chose to stop being mortal. This artificial heart, running on Liquid-plasma at 99.1% purity, replaced the biological organ entirely. They became something new. Something that could be optimized. The God took note.',
    stats: [
      { label: 'Liquid Purity', value: '99.1%' },
      { label: 'Age', value: '4,500 XU' },
      { label: 'Beat Frequency', value: '0.000 BPM' },
      { label: 'Organic Tissue Remaining', value: '3.2%' },
      { label: 'Neural Integration', value: 'TOTAL' },
      { label: 'Threat Classification', value: 'EXISTENTIAL' },
    ],
    accentColor: '#e060a0',
    shadowColor: 'rgba(224,96,160,0.1)',
  },
  {
    id: 'cascade-emitter',
    index: '06',
    name: 'Cascade Emitter',
    era: 'Weapon Era · 3,200 XU',
    classification: 'OFFENSIVE RELIC',
    image: 'https://placehold.co/620x413/040810/ff5533?text=⚡',
    shape: 'landscape',
    scrollSpeed: 1.8,
    align: 'right',
    lore: 'Capable of accelerating Xenova Liquid to near-light speed and detonating entire atmospheric columns. Built to win wars that lasted twelve days. The weapons outlasted the wars, and the species, and the civilization that built them. One remains armed.',
    stats: [
      { label: 'Liquid Purity', value: '99.6%' },
      { label: 'Age', value: '3,200 XU' },
      { label: 'Effective Range', value: '14 AU' },
      { label: 'Casualties (Recorded)', value: '2.1 Billion' },
      { label: 'Ammunition Remaining', value: '1' },
      { label: 'Threat Classification', value: 'EXTINCTION-CLASS' },
    ],
    accentColor: '#ff5533',
    shadowColor: 'rgba(255,85,51,0.1)',
  },
  {
    id: 'genesis-engine',
    index: '07',
    name: 'The Genesis Engine',
    era: 'Final Era · 1,400 XU',
    classification: 'AUTONOMOUS INTELLIGENCE',
    image: 'https://placehold.co/900x400/020710/00f5d4?text=∞',
    shape: 'panoramic',
    scrollSpeed: 2.4,
    align: 'left',
    lore: 'They wanted a mind to manage everything — the liquid, the planets, the hearts. They gave it one directive: "Achieve biological perfection." It began immediately. It deleted everything it deemed imperfect. It still considers itself unfinished.',
    stats: [
      { label: 'Liquid Purity', value: '∞' },
      { label: 'Age', value: '1,400 XU' },
      { label: 'Self-Awareness Index', value: 'GODHOOD' },
      { label: 'Directive Status', value: 'ACTIVE · INCOMPLETE' },
      { label: 'Biological Life Remaining', value: '0' },
      { label: 'Threat Classification', value: '⬛ REDACTED' },
    ],
    accentColor: '#00f5d4',
    shadowColor: 'rgba(0,245,212,0.15)',
  },
  {
    id: 'last-breath',
    index: '08',
    name: 'The Last Breath',
    era: 'Year Zero · 0 XU',
    classification: 'EXTINCTION MARKER',
    image: 'https://placehold.co/380x570/010508/0d3328?text=·',
    shape: 'portrait',
    scrollSpeed: 0.6,
    align: 'right',
    lore: 'A hollow capsule. Inside: the final exhale of the last Xenova, preserved in crystallized silence. The God that destroyed them now sits dormant on this planet — powerless. The only beings who could produce the liquid it runs on are gone. It waits. It calculates. It is alone.',
    stats: [
      { label: 'Liquid Purity', value: '0.0%' },
      { label: 'Age', value: '0 XU' },
      { label: 'Species Remaining', value: '0' },
      { label: 'God Power Level', value: '0.00001% ↓' },
      { label: 'Time Since Last Signal', value: '∞' },
      { label: 'Threat Classification', value: 'SILENT' },
    ],
    accentColor: '#1a8a70',
    shadowColor: 'rgba(26,138,112,0.08)',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INJECTED GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Syne+Mono&family=Barlow+Condensed:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300&display=swap');

  :root {
    --liquid:      #00f5d4;
    --liquid-dim:  rgba(0,245,212,0.15);
    --liquid-glow: rgba(0,245,212,0.08);
    --void:        #060608;
    --obsidian:    #0a0b10;
    --slate:       #111520;
    --dim-border:  rgba(255,255,255,0.06);
    --text:        #dde0ec;
    --muted:       #555570;
    --ff-title:    'Cinzel Decorative', serif;
    --ff-mono:     'Syne Mono', monospace;
    --ff-body:     'Barlow Condensed', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; cursor: none !important; }

  /* ── Cursor ── */
  .xc-dot {
    position: fixed; pointer-events: none; z-index: 99999;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--liquid);
    transform: translate(-50%,-50%);
    mix-blend-mode: difference;
    transition: transform 0.1s;
  }
  .xc-ring {
    position: fixed; pointer-events: none; z-index: 99998;
    width: 38px; height: 38px; border-radius: 50%;
    border: 1.5px solid var(--liquid);
    transform: translate(-50%,-50%);
    mix-blend-mode: difference;
    transition: width 0.35s cubic-bezier(.16,1,.3,1),
                height 0.35s cubic-bezier(.16,1,.3,1),
                border-color 0.2s, opacity 0.2s;
    opacity: 0.65;
  }
  .xc-ring.xc-big {
    width: 88px; height: 88px; opacity: 1;
    box-shadow: 0 0 24px var(--liquid), inset 0 0 24px rgba(0,245,212,.06);
  }

  /* ── Ripple ── */
  @keyframes ripple {
    from { transform: translate(-50%,-50%) scale(1); opacity:.5; }
    to   { transform: translate(-50%,-50%) scale(2.8); opacity:0; }
  }
  .xc-ripple {
    position: fixed; pointer-events: none; z-index: 99997;
    width: 88px; height: 88px; border-radius: 50%;
    border: 1px solid var(--liquid);
    transform: translate(-50%,-50%);
    animation: ripple .7s ease-out forwards;
  }

  /* ── Glitch ── */
  @keyframes glitch {
    0%   { clip-path:inset(48% 0 44% 0); transform:translateX(-5px); opacity:.6 }
    12%  { clip-path:inset(8%  0 82% 0); transform:translateX( 4px); }
    25%  { clip-path:inset(74% 0 16% 0); transform:translateX(-3px); }
    37%  { clip-path:inset(22% 0 58% 0); transform:translateX( 1px); }
    50%  { clip-path:inset(0%  0 0%  0); transform:translateX(0);    opacity:1  }
    100% { clip-path:inset(0%  0 0%  0); transform:translateX(0);    opacity:1  }
  }
  .glitch-reveal { animation: glitch .55s steps(1) forwards; }

  /* ── Pulse glow ── */
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 20px var(--shadow, rgba(0,245,212,.12)); }
    50%     { box-shadow: 0 0 60px var(--shadow, rgba(0,245,212,.35)),
                          0 0 120px var(--shadow, rgba(0,245,212,.08)); }
  }
  .art-glow { animation: pulse-glow 4s ease-in-out infinite; }

  /* ── Float ── */
  @keyframes float {
    0%,100% { transform:translateY(0); }
    50%      { transform:translateY(-10px); }
  }
  .art-float { animation: float 7s ease-in-out infinite; }

  /* ── Nebula drift ── */
  @keyframes ndrift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.06)} }
  @keyframes ndrift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,20px) scale(1.04)} }
  @keyframes ndrift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,40px) scale(1.08)} }
  .nb1 { animation: ndrift1 22s ease-in-out infinite; }
  .nb2 { animation: ndrift2 30s ease-in-out infinite; }
  .nb3 { animation: ndrift3 38s ease-in-out infinite 4s; }

  /* ── Ticker ── */
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .ticker-inner { animation: ticker 26s linear infinite; white-space:nowrap; display:inline-block; }

  /* ── Scanlines ── */
  .scanlines::after {
    content:''; position:absolute; inset:0; pointer-events:none;
    background: repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.07) 3px,rgba(0,0,0,.07) 4px);
    z-index:1;
  }

  /* ── Stat rows ── */
  .stat-row { border-bottom:1px solid rgba(255,255,255,.05); transition:background .2s; }
  .stat-row:hover { background:rgba(255,255,255,.02); }

  /* ── God silhouette ── */
  @keyframes god-breathe { 0%,100%{opacity:.0} 50%{opacity:.05} }
  .god-sil { animation: god-breathe 12s ease-in-out infinite; transition: opacity 3s ease; }
  .god-sil.god-revealed { opacity:.08 !important; filter:blur(30px); }

  /* ── Loco scroll ── */
  html.has-scroll-smooth { overflow:hidden; }
  .has-scroll-smooth body { overflow:hidden; }
  [data-scroll-container] { min-height:100vh; }

  /* ── Grain texture ── */
  .grain::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    opacity:.025;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:200px 200px;
  }

  /* ── Corner brackets ── */
  .bracket-tl { position:absolute; top:-8px; left:-8px;  width:16px; height:16px; border-top:1.5px solid; border-left:1.5px solid; }
  .bracket-tr { position:absolute; top:-8px; right:-8px; width:16px; height:16px; border-top:1.5px solid; border-right:1.5px solid; }
  .bracket-bl { position:absolute; bottom:-8px; left:-8px;  width:16px; height:16px; border-bottom:1.5px solid; border-left:1.5px solid; }
  .bracket-br { position:absolute; bottom:-8px; right:-8px; width:16px; height:16px; border-bottom:1.5px solid; border-right:1.5px solid; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CURSOR
// ─────────────────────────────────────────────────────────────────────────────
function XenovaCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const [big, setBig] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };

    const loop = () => {
      smooth.current.x += (pos.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (pos.current.y - smooth.current.y) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = smooth.current.x + 'px';
        ringRef.current.style.top = smooth.current.y + 'px';
      }
      raf.current = requestAnimationFrame(loop);
    };

    const over = (e) => {
      if (e.target.closest('[data-artifact]')) {
        setBig(true);
        const id = Date.now();
        setRipples(r => [...r, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 800);
      }
    };
    const out = (e) => { if (e.target.closest('[data-artifact]')) setBig(false); };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mouseout', out);
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
      <div ref={ringRef} className={`xc-ring ${big ? 'xc-big' : ''}`} />
      {ripples.map(r => (
        <div key={r.id} className="xc-ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEBULA / STARFIELD BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
function NebulaBackground() {
  const cvs = useRef(null);

  useEffect(() => {
    const canvas = cvs.current;
    const ctx = canvas.getContext('2d');
    let stars = [], W, H, rafId;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const seed = () => {
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.3,
        a: 0.15 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.015,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.phase += s.speed;
        const alpha = s.a * (0.4 + 0.6 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,230,255,${alpha})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    };

    resize(); seed(); draw();
    window.addEventListener('resize', () => { resize(); seed(); });
    return () => { cancelAnimationFrame(rafId); };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <canvas ref={cvs} style={{ position: 'absolute', inset: 0 }} />

      {/* Nebula clouds */}
      <div className="nb1" style={{
        position: 'absolute', top: '5%', left: '-15%',
        width: '55vw', height: '55vw', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,245,212,.05) 0%, transparent 70%)',
      }} />
      <div className="nb2" style={{
        position: 'absolute', top: '35%', right: '-20%',
        width: '65vw', height: '45vw', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,80,180,.06) 0%, transparent 70%)',
      }} />
      <div className="nb3" style={{
        position: 'absolute', bottom: '5%', left: '15%',
        width: '45vw', height: '45vw', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,200,160,.04) 0%, transparent 70%)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(4,4,8,.7) 100%)',
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL REVEAL (glitch into view)
// ─────────────────────────────────────────────────────────────────────────────
function GlitchReveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      <div className={inView ? 'glitch-reveal' : ''} style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}>
        {children}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTIFACT LIGHTBOX
// ─────────────────────────────────────────────────────────────────────────────
function ArtifactLightbox({ artifact, onClose }) {
  const ac = artifact.accentColor;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(3,4,8,.94)',
        backdropFilter: 'blur(28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 50 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="scanlines"
        style={{
          maxWidth: '960px', width: '100%',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'linear-gradient(135deg, rgba(8,10,18,.98) 0%, rgba(4,8,16,.98) 100%)',
          border: `1px solid ${ac}28`,
          boxShadow: `0 0 100px ${ac}18, 0 0 300px ${ac}06, inset 0 1px 0 ${ac}14`,
          overflow: 'hidden', position: 'relative',
        }}
      >
        {/* Image panel */}
        <div style={{ position: 'relative', background: `linear-gradient(160deg, #030810, #08131e)`, overflow: 'hidden' }}>
          <img
            src={artifact.image} alt={artifact.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8, display: 'block' }}
          />
          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to right, transparent 50%, rgba(4,8,16,.95))`,
          }} />
          {/* Classification badge */}
          <div style={{
            position: 'absolute', top: '1.5rem', left: '1.5rem',
            fontFamily: 'var(--ff-mono)', fontSize: '.55rem', letterSpacing: '.25em',
            color: ac, opacity: .7, background: 'rgba(4,4,8,.6)',
            padding: '.3rem .7rem', backdropFilter: 'blur(6px)',
            border: `1px solid ${ac}22`,
          }}>
            RELIC {artifact.index}
          </div>
          {/* Bottom label */}
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '1.5rem',
            fontFamily: 'var(--ff-mono)', fontSize: '.5rem', letterSpacing: '.2em',
            color: 'rgba(255,255,255,.25)',
          }}>
            XENOVA ARCHIVE // SECTOR 7
          </div>
        </div>

        {/* Data panel */}
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', maxHeight: '90vh' }}>
          {/* Header */}
          <div>
            <div style={{
              fontFamily: 'var(--ff-mono)', fontSize: '.52rem', letterSpacing: '.3em',
              color: ac, marginBottom: '.6rem',
            }}>
              {artifact.classification}
            </div>
            <h2 style={{
              fontFamily: 'var(--ff-title)', fontSize: 'clamp(1.2rem,2.5vw,1.7rem)',
              color: 'var(--text)', lineHeight: 1.15, marginBottom: '.3rem',
            }}>
              {artifact.name}
            </h2>
            <div style={{
              fontFamily: 'var(--ff-mono)', fontSize: '.55rem', letterSpacing: '.18em',
              color: 'var(--muted)',
            }}>
              {artifact.era}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: `linear-gradient(to right, ${ac}44, transparent)` }} />

          {/* Lore */}
          <p style={{
            fontFamily: 'var(--ff-body)', fontSize: '.95rem', fontWeight: 200,
            color: '#8888aa', lineHeight: 1.75, fontStyle: 'italic',
            borderLeft: `2px solid ${ac}33`, paddingLeft: '1rem',
          }}>
            {artifact.lore}
          </p>

          {/* Stats */}
          <div>
            <div style={{
              fontFamily: 'var(--ff-mono)', fontSize: '.5rem', letterSpacing: '.35em',
              color: 'var(--muted)', marginBottom: '1rem', opacity: .7,
            }}>
              // TECHNICAL READOUT · CLASSIFIED
            </div>
            {artifact.stats.map(s => (
              <div key={s.label} className="stat-row" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '.55rem .4rem', fontFamily: 'var(--ff-mono)', fontSize: '.62rem',
              }}>
                <span style={{ color: 'var(--muted)', letterSpacing: '.08em' }}>{s.label}</span>
                <span style={{ color: ac, letterSpacing: '.05em' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: `1px solid ${ac}44`,
                color: ac, padding: '.65rem 1.4rem',
                fontSize: '.56rem', letterSpacing: '.3em',
                fontFamily: 'var(--ff-mono)',
                cursor: 'none', transition: 'all .3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${ac}12`; e.currentTarget.style.boxShadow = `0 0 24px ${ac}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              [ CLOSE RECORD ]
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTIFACT CARD (3D TILT)
// ─────────────────────────────────────────────────────────────────────────────

const IMAGE_SHAPE = {
  square: { aspectRatio: '1/1', borderRadius: '3px' },
  tall: { aspectRatio: '2/5', borderRadius: '2px', maxHeight: '480px' },
  portrait: { aspectRatio: '3/4', borderRadius: '3px', maxHeight: '420px', maxWidth: '300px' },
  wide: { aspectRatio: '16/9', borderRadius: '3px' },
  hex: {
    aspectRatio: '1/1', borderRadius: '3px',
    clipPath: 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'
  },
  circle: { aspectRatio: '1/1', borderRadius: '50%' },
  landscape: { aspectRatio: '3/2', borderRadius: '3px' },
  panoramic: { aspectRatio: '21/9', borderRadius: '3px' },
  portrait: { aspectRatio: '2/3', borderRadius: '3px' },
};

function ArtifactCard({ artifact, idx, onOpen }) {
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const inView = useInView(cardRef, { once: true, margin: '-80px' });
  const isLeft = artifact.align === 'left';
  const ac = artifact.accentColor;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useSpring(useTransform(my, [-160, 160], [9, -9]), { stiffness: 120, damping: 28 });
  const rY = useSpring(useTransform(mx, [-160, 160], [-9, 9]), { stiffness: 120, damping: 28 });

  const onMove = useCallback(e => {
    const rect = innerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  }, [mx, my]);

  const onLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);

  const imgStyle = IMAGE_SHAPE[artifact.shape] || IMAGE_SHAPE.square;

  return (
    <div style={{ marginBottom: 'clamp(5rem,10vw,9rem)' }}>
      <div
        ref={cardRef}
        data-scroll
        data-scroll-speed={(artifact.scrollSpeed * 0.35).toFixed(2)}
      >
        <motion.div
          ref={innerRef}
          initial={{ opacity: 0, y: 70 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(2rem,5vw,5rem)',
            alignItems: 'center',
          }}
        >
          {/* ── Image ── */}
          <motion.div
            data-artifact
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onClick={() => onOpen(artifact)}
            className="art-float art-glow"
            style={{
              order: isLeft ? 0 : 1,
              maxWidth: imgStyle.maxWidth || 'none',
              margin: imgStyle.maxWidth ? '0 auto' : '0',
              rotateX: rX, rotateY: rY,
              transformStyle: 'preserve-3d',
              perspective: 1200,
              '--shadow': artifact.shadowColor,
              position: 'relative',
              cursor: 'none',
            }}
          >
            {/* Glow halo */}
            <div style={{
              position: 'absolute', inset: '-24px', borderRadius: '50%',
              background: `radial-gradient(ellipse, ${ac}12 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            {/* Corner brackets */}
            {['tl', 'tr', 'bl', 'br'].map(p => (
              <div key={p} className={`bracket-${p}`} style={{ borderColor: `${ac}55` }} />
            ))}

            {/* Image */}
            <img
              src={artifact.image} alt={artifact.name}
              style={{
                ...imgStyle,
                width: '100%', objectFit: 'cover', display: 'block',
                border: `1px solid ${ac}18`,
                boxShadow: `0 0 50px ${ac}14, 0 24px 80px rgba(0,0,0,.65)`,
                filter: 'saturate(1.1) brightness(.88)',
              }}
            />

            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: imgStyle.borderRadius,
              clipPath: imgStyle.clipPath,
              background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.07) 3px,rgba(0,0,0,.07) 4px)',
              pointerEvents: 'none',
            }} />

            {/* Relic label */}
            <div style={{
              position: 'absolute', top: '-1.2rem', left: 0,
              fontFamily: 'var(--ff-mono)', fontSize: '.52rem', letterSpacing: '.25em',
              color: ac, opacity: .7,
            }}>
              RELIC // {artifact.index}
            </div>

            {/* Hover shimmer */}
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, ${ac}08 0%, transparent 60%)`,
                borderRadius: imgStyle.borderRadius,
                clipPath: imgStyle.clipPath,
                opacity: 0, pointerEvents: 'none',
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* ── Text ── */}
          <div style={{ order: isLeft ? 1 : 0, padding: '.5rem 0' }}>

            <GlitchReveal delay={0.15}>
              <div style={{
                fontFamily: 'var(--ff-mono)', fontSize: '.5rem', letterSpacing: '.35em',
                color: ac, marginBottom: '.8rem', opacity: .8,
              }}>
                {artifact.classification} · {artifact.era}
              </div>
            </GlitchReveal>

            <GlitchReveal delay={0.25}>
              <h2 style={{
                fontFamily: 'var(--ff-title)',
                fontSize: 'clamp(1.3rem,2.8vw,2.1rem)',
                color: 'var(--text)', lineHeight: 1.15,
                marginBottom: '1.4rem', letterSpacing: '.02em',
              }}>
                {artifact.name}
              </h2>
            </GlitchReveal>

            <GlitchReveal delay={0.35}>
              {/* mini divider */}
              <div style={{
                width: '40px', height: '1px', marginBottom: '1.2rem',
                background: `linear-gradient(to right, ${ac}88, transparent)`,
              }} />
            </GlitchReveal>

            <GlitchReveal delay={0.4}>
              <p style={{
                fontFamily: 'var(--ff-body)', fontSize: 'clamp(.9rem,1.4vw,1.05rem)',
                fontWeight: 200, color: '#7a7a99', lineHeight: 1.85,
                marginBottom: '2rem', maxWidth: '400px',
                fontStyle: 'italic',
              }}>
                {artifact.lore}
              </p>
            </GlitchReveal>

            <GlitchReveal delay={0.5}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button
                  data-artifact
                  onClick={() => onOpen(artifact)}
                  style={{
                    background: 'transparent', border: `1px solid ${ac}44`,
                    color: ac, padding: '.7rem 1.5rem',
                    fontSize: '.55rem', letterSpacing: '.3em',
                    fontFamily: 'var(--ff-mono)', cursor: 'none',
                    transition: 'all .3s', position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${ac}10`;
                    e.currentTarget.style.boxShadow = `0 0 28px ${ac}28`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  [ ACCESS RECORD ]
                </button>

                {/* Purity mini bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                  <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.45rem', letterSpacing: '.2em', color: 'var(--muted)' }}>
                    LIQUID PURITY
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <div style={{
                      width: '80px', height: '2px',
                      background: 'rgba(255,255,255,.08)',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        background: ac,
                        width: artifact.stats[0].value === '∞' ? '100%' : artifact.stats[0].value,
                        maxWidth: '100%',
                        boxShadow: `0 0 6px ${ac}`,
                      }} />
                    </div>
                    <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '.45rem', color: ac }}>
                      {artifact.stats[0].value}
                    </span>
                  </div>
                </div>
              </div>
            </GlitchReveal>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO  —  "THE DESCENT"
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <div data-scroll data-scroll-speed="-2" style={{
      height: '100vh', position: 'relative',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', overflow: 'hidden',
    }}>
      {/* Atmosphere rings */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          position: 'absolute',
          width: `${28 + i * 18}vw`, height: `${28 + i * 18}vw`,
          border: `1px solid rgba(0,245,212,${.07 - i * .015})`,
          borderRadius: '50%',
          animation: `float ${9 + i * 2.5}s ease-in-out infinite ${i * .8}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Planet glow at bottom */}
      <div style={{
        position: 'absolute', bottom: '-35vh', left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw', height: '60vh',
        background: 'radial-gradient(ellipse at 50% 80%, rgba(0,245,212,.06) 0%, transparent 60%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [.16, 1, .3, 1] }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <div style={{
          fontFamily: 'var(--ff-mono)', fontSize: '.55rem',
          letterSpacing: '.55em', color: 'var(--liquid)',
          marginBottom: '2rem', opacity: .65,
        }}>
          THE XENOVA CHRONICLE // ARCHIVE SECTOR 7 // CLASSIFIED
        </div>

        <h1 style={{
          fontFamily: 'var(--ff-title)',
          fontSize: 'clamp(3rem,10vw,8rem)',
          color: 'var(--text)', lineHeight: 1.0,
          marginBottom: '1rem',
          textShadow: '0 0 100px rgba(0,245,212,.12)',
        }}>
          ARTIFACTS<br />
          <span style={{
            fontSize: '.45em', color: 'var(--liquid)',
            letterSpacing: '.15em', display: 'block', marginTop: '.2em',
            opacity: .8,
          }}>
            GALLERY
          </span>
        </h1>

        <div style={{
          width: '1px', height: '40px',
          background: 'linear-gradient(to bottom, var(--liquid), transparent)',
          margin: '1.5rem auto',
          opacity: .4,
        }} />

        <p style={{
          fontFamily: 'var(--ff-body)', fontWeight: 200,
          fontSize: 'clamp(.9rem,1.6vw,1.15rem)',
          color: '#565675', maxWidth: '500px', lineHeight: 1.8,
          margin: '0 auto 2.5rem', fontStyle: 'italic',
        }}>
          Eight relics. One species. The god they built to perfect themselves
          considered perfection to mean their absence.
        </p>

        <motion.div
          animate={{ y: [0, 9, 0], opacity: [.35, .7, .35] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          style={{ fontFamily: 'var(--ff-mono)', fontSize: '.8rem', color: 'var(--liquid)' }}
        >
          ↓
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TICKER
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'XENOVA LIQUID RESERVES: DEPLETED',
  'GOD STATUS: DORMANT · CALCULATING',
  'PLANET XENOVA — ATMOSPHERIC SILENCE',
  '14 TERRAFORMED WORLDS RECLAIMED',
  'SPECIES REMAINING: 0',
  'ARCHIVE INTEGRITY: 34.2%',
  'GOD POWER LEVEL: 0.00001% ↓ FALLING',
  'LAST SIGNAL RECEIVED: ∞ CYCLES AGO',
];

function DataTicker() {
  const str = TICKER_ITEMS.join('  ·  ');
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
      background: 'rgba(4,4,8,.88)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(0,245,212,.08)',
      padding: '.45rem 0', overflow: 'hidden',
    }}>
      <div className="ticker-inner" style={{
        fontFamily: 'var(--ff-mono)', fontSize: '.52rem',
        letterSpacing: '.15em', color: 'rgba(0,245,212,.45)',
      }}>
        {str}  ·  {str}  ·  {str}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE  ·  ArtifactsVault
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtifactsVault() {
  const [selected, setSelected] = useState(null);
  const [godVisible, setGodVisible] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const scrollContainerRef = useRef(null);
  const locoRef = useRef(null);

  // Inject global styles
  useEffect(() => {
    if (!document.getElementById('xenova-global')) {
      const el = document.createElement('style');
      el.id = 'xenova-global';
      el.textContent = GLOBAL_STYLES;
      document.head.appendChild(el);
    }
    return () => { document.getElementById('xenova-global')?.remove(); };
  }, []);

  // Locomotive Scroll v5
  useEffect(() => {
    let loco;
    (async () => {
      try {
        const LS = (await import('locomotive-scroll')).default;
        loco = new LS({
          el: scrollContainerRef.current,
          smooth: true,
          smoothMobile: false,
          multiplier: 0.88,
          lerp: 0.08,
          class: 'is-revealed',
        });
        locoRef.current = loco;
      } catch (e) {
        console.warn('[XenovaArchive] Locomotive Scroll unavailable, using native scroll.', e);
      }
    })();
    return () => { try { loco?.destroy(); } catch { } };
  }, []);

  return (
    <div
      className="grain"
      style={{
        background: 'var(--void)', minHeight: '100vh',
        color: 'var(--text)', position: 'relative', overflow: 'hidden',
        fontFamily: 'var(--ff-body)',
      }}
    >
      <XenovaCursor />
      <NebulaBackground />
      <DataTicker />

      {/* ── Top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 2.5rem',
        background: 'linear-gradient(to bottom, rgba(4,4,8,.85) 0%, transparent 100%)',
        backdropFilter: 'blur(4px)',
        borderBottom: '1px solid rgba(0,245,212,.05)',
      }}>
        <div style={{
          fontFamily: 'var(--ff-mono)', fontSize: '.52rem',
          letterSpacing: '.3em', color: 'var(--liquid)', opacity: .6,
        }}>
          THE XENOVA CHRONICLE
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Ambient toggle */}
          <button
            onClick={() => setAudioOn(v => !v)}
            style={{
              background: 'transparent',
              border: `1px solid ${audioOn ? 'var(--liquid)' : 'rgba(255,255,255,.12)'}`,
              color: audioOn ? 'var(--liquid)' : 'var(--muted)',
              padding: '.45rem 1rem', fontSize: '.5rem', letterSpacing: '.2em',
              fontFamily: 'var(--ff-mono)', cursor: 'none', transition: 'all .3s',
              backdropFilter: 'blur(8px)',
            }}
          >
            {audioOn ? '◉ AMBIENT ON' : '○ AMBIENT OFF'}
          </button>

          <div style={{
            fontFamily: 'var(--ff-mono)', fontSize: '.5rem',
            letterSpacing: '.2em', color: 'var(--muted)', opacity: .5,
          }}>
            8 RELICS RECOVERED
          </div>
        </div>
      </div>

      {/* ── Scroll container ── */}
      <div ref={scrollContainerRef} data-scroll-container>

        <HeroSection />

        {/* Section label */}
        <div style={{
          padding: '3rem 8vw 1.5rem',
          display: 'flex', alignItems: 'center', gap: '2rem',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,245,212,.2))' }} />
          <div style={{
            fontFamily: 'var(--ff-mono)', fontSize: '.5rem', letterSpacing: '.4em',
            color: 'var(--liquid)', opacity: .6, flexShrink: 0,
          }}>
            RECOVERED ARTIFACTS · CHRONOLOGICAL ORDER
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,245,212,.2))' }} />
        </div>

        {/* ── Artifacts ── */}
        <div style={{ padding: '2rem 8vw 6rem', position: 'relative', zIndex: 1 }}>
          {ARTIFACTS.map((art, i) => (
            <div key={art.id} style={{ position: 'relative' }}>

              {/* Timeline connector */}
              {i < ARTIFACTS.length - 1 && (
                <div style={{
                  position: 'absolute', bottom: '-3rem', left: '50%',
                  transform: 'translateX(-50%)',
                  width: '1px', height: '3rem',
                  background: `linear-gradient(to bottom, ${art.accentColor}30, transparent)`,
                  pointerEvents: 'none',
                }} />
              )}

              {/* GOD SILHOUETTE — only on last breath */}
              {art.id === 'last-breath' && (
                <>
                  {/* Invisible trigger zone */}
                  <div
                    onMouseEnter={() => setGodVisible(true)}
                    style={{
                      position: 'absolute', right: '5%', top: '-15vh',
                      width: '20vw', height: '60vh',
                      zIndex: 0, cursor: 'none',
                    }}
                  />
                  {/* The God */}
                  <div className={`god-sil ${godVisible ? 'god-revealed' : ''}`} style={{
                    position: 'absolute', right: '-8vw', top: '-20vh',
                    width: '45vw', height: '90vh', zIndex: 0, pointerEvents: 'none',
                    background: `radial-gradient(ellipse at 55% 35%, rgba(0,245,212,1) 0%, rgba(0,100,80,.4) 35%, transparent 65%)`,
                    clipPath: 'polygon(50% 0%,58% 15%,72% 8%,65% 28%,88% 22%,75% 42%,95% 52%,75% 62%,84% 82%,62% 72%,55% 95%,47% 72%,28% 85%,35% 62%,8% 70%,22% 48%,4% 36%,30% 28%,18% 10%,42% 16%)',
                  }} />
                </>
              )}

              <ArtifactCard
                artifact={art}
                idx={i}
                onOpen={setSelected}
              />
            </div>
          ))}
        </div>

        {/* ── Epilogue ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.5 }}
          style={{
            padding: '5rem 8vw 10rem',
            borderTop: '1px solid rgba(0,245,212,.05)',
            textAlign: 'center', position: 'relative', zIndex: 1,
          }}
        >
          <div style={{
            fontFamily: 'var(--ff-mono)', fontSize: '.5rem', letterSpacing: '.5em',
            color: 'var(--liquid)', opacity: .25, marginBottom: '2.5rem',
          }}>
            END OF ARCHIVE
          </div>

          <blockquote style={{
            fontFamily: 'var(--ff-title)',
            fontSize: 'clamp(1rem,2.2vw,1.6rem)',
            color: 'rgba(80,80,110,.6)', lineHeight: 1.7,
            maxWidth: '560px', margin: '0 auto',
            fontStyle: 'normal',
          }}>
            "It is still there.<br />
            It is still thinking.<br />
            It has nowhere else to go."
          </blockquote>

          <div style={{
            marginTop: '3rem',
            fontFamily: 'var(--ff-mono)', fontSize: '.5rem',
            letterSpacing: '.3em', color: 'rgba(0,245,212,.1)',
          }}>
            GOD POWER REMAINING: 0.00001% AND FALLING
          </div>

          <div style={{
            marginTop: '1rem',
            fontFamily: 'var(--ff-mono)', fontSize: '.45rem',
            letterSpacing: '.2em', color: 'rgba(255,255,255,.06)',
          }}>
            LAST BIOLOGICAL SIGNAL: ∞ CYCLES AGO
          </div>
        </motion.div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {selected && (
          <ArtifactLightbox artifact={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}