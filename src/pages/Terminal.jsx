import { useState, useEffect, useRef, useCallback } from 'react';
import { useVisitor } from '../context/VisitorContext';
import { PLANETS as PLANET_DATA } from '../data/planetData';
import { artifacts as ARTIFACTS_DATA } from '../data/artifacts';

// injected css
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

  @keyframes xnv-flicker {
    0%   { opacity: 0.90; }
    5%   { opacity: 0.78; }
    10%  { opacity: 0.92; }
    15%  { opacity: 1;    }
    25%  { opacity: 0.82; }
    35%  { opacity: 0.96; }
    100% { opacity: 1;    }
  }
  @keyframes xnv-scanline {
    0%   { transform: translateY(-15%); }
    100% { transform: translateY(110%); }
  }
  @keyframes xnv-blink {
    0%,  49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes xnv-pulse {
    0%, 100% { opacity: 1;    }
    50%      { opacity: 0.42; }
  }
  @keyframes xnv-glitch-clip {
    0%   { clip-path: inset(8%  0 88% 0); transform: translateX(-6px); }
    20%  { clip-path: inset(55% 0 3%  0); transform: translateX( 6px); }
    40%  { clip-path: inset(25% 0 60% 0); transform: translateX(-4px); }
    60%  { clip-path: inset(75% 0 10% 0); transform: translateX( 5px); }
    80%  { clip-path: inset(3%  0 75% 0); transform: translateX(-2px); }
    100% { clip-path: inset(0   0 0   0); transform: translateX(0);    }
  }
  @keyframes xnv-glitch-rgb {
    0%   { text-shadow: 3px 0 #ff0050, -3px 0 #00ffd1, 0 0 8px #00ffd1; }
    33%  { text-shadow: -4px 0 #ff0050, 4px 0 #00ffd1, 0 0 6px #00ffd1; }
    66%  { text-shadow: 2px 0 #ff0050, -2px 0 #00ffd1, 0 0 10px #00ffd1; }
    100% { text-shadow: 0 0 5px rgba(0,255,209,0.7), 0 0 10px rgba(0,255,209,0.4); }
  }
  @keyframes xnv-fadein {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes xnv-bypass-glow {
    0%,100% { box-shadow: 0 0 8px rgba(255,51,102,0.4), inset 0 0 8px rgba(255,51,102,0.08); }
    50%     { box-shadow: 0 0 20px rgba(255,51,102,0.7), inset 0 0 12px rgba(255,51,102,0.15); }
  }
  @keyframes xnv-boot-bar {
    from { width: 0; }
    to   { width: 100%; }
  }

  /* root shell */
  .xnv-shell {
    position: relative;
    width: 100%;
    max-width: 1800px;
    margin: var(--navbar-height, 64px) auto 0;
    height: calc(100dvh - var(--navbar-height, 64px));
    background: linear-gradient(180deg, #030507 0%, #020406 100%);
    color: #00FFD1;
    font-family: 'Share Tech Mono', 'Courier New', Courier, monospace;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    user-select: text;
  }

  /* CRT scanline texture */
  .xnv-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.22) 50%),
      linear-gradient(90deg,
        rgba(255,0,0,0.04),
        rgba(0,255,0,0.015),
        rgba(0,0,255,0.04)
      );
    background-size: 100% 4px, 6px 100%;
    pointer-events: none;
    z-index: 20;
  }

  /* Moving scanline beam */
  .xnv-shell::after {
    content: '';
    position: absolute;
    left: 0; right: 0; top: 0;
    height: 20vh;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(0,255,209,0.035) 50%,
      transparent
    );
    animation: xnv-scanline 8s linear infinite;
    pointer-events: none;
    z-index: 21;
  }

  /* Vignette */
  .xnv-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.8) 100%);
    pointer-events: none;
    z-index: 22;
  }

  /* header */
  .xnv-header {
    position: relative;
    z-index: 30;
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 16px 16px 14px;
    border-bottom: 1px solid rgba(0,255,209,0.12);
    background: linear-gradient(180deg, rgba(0,255,209,0.03) 0%, transparent 100%);
    animation: xnv-flicker 6s infinite alternate;
  }
  @media (min-width: 768px) {
    .xnv-header { padding: 16px 32px 14px; }
  }
  .xnv-header-left { display: flex; flex-direction: column; gap: 3px; }
  .xnv-title {
    font-size: 1.3rem;
    font-weight: normal;
    letter-spacing: 0.18em;
    text-shadow: 0 0 8px #00FFD1, 0 0 20px rgba(0,255,209,0.4);
  }
  .xnv-subtitle {
    font-size: 0.68rem;
    color: #7AAFC4;
    letter-spacing: 0.14em;
  }
  .xnv-header-right {
    font-size: 0.76rem;
    text-align: right;
    line-height: 1.8;
    color: #7AAFC4;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .xnv-header-right strong { color: #00FFD1; font-weight: normal; }
  .xnv-rec { animation: xnv-pulse 2s infinite; color: #ff3366; }
  .xnv-pct-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    border: 1px solid rgba(0,255,209,0.2);
    background: rgba(0,255,209,0.05);
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    color: #00FFD1;
  }

  /* ascii logo */
  .xnv-logo {
    position: relative;
    z-index: 30;
    flex-shrink: 0;
    font-size: clamp(0.35rem, 1.2vw, 0.525rem);
    line-height: 1.15;
    white-space: pre;
    color: rgba(0,255,209,0.35);
    text-shadow: 0 0 6px rgba(0,255,209,0.2);
    padding: 8px 16px 2px;
  }
  @media (min-width: 768px) {
    .xnv-logo { padding: 8px 32px 2px; }
  }

  /* output scroll area */
  .xnv-output {
    position: relative;
    z-index: 30;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: clamp(0.65rem, 3vw, 0.93rem);
    line-height: 1.6;
    letter-spacing: 0.04em;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    word-break: break-word;
    scrollbar-color: rgba(0,255,209,0.18) transparent;
  }
  @media (min-width: 768px) {
    .xnv-output { padding: 16px 36px 12px; }
  }
  .xnv-output::-webkit-scrollbar       { width: 4px; }
  .xnv-output::-webkit-scrollbar-thumb { background: rgba(0,255,209,0.18); border-radius: 2px; }
  .xnv-output::-webkit-scrollbar-track { background: transparent; }

  /* line types */
  .xnv-line {
    white-space: pre-wrap;
    word-break: break-word;
    animation: xnv-fadein 0.12s ease-out both;
  }
  .xnv-sys   { color: #8892b0; font-style: italic; }
  .xnv-err   { color: #ff3366; text-shadow: 0 0 6px rgba(255,51,102,0.5); }
  .xnv-ok    { color: #e6f1ff; }
  .xnv-hdr   { color: #64ffda; font-weight: bold; letter-spacing: 0.08em; }
  .xnv-quiz  { color: #ffd700; text-shadow: 0 0 6px rgba(255,215,0,0.38); }
  .xnv-good  { color: #00FFD1; text-shadow: 0 0 6px rgba(0,255,209,0.65), 0 0 14px rgba(0,255,209,0.3); }
  .xnv-bad   { color: #ff3366; text-shadow: 0 0 6px rgba(255,51,102,0.6); }
  .xnv-dim   { color: rgba(0,255,209,0.3); }
  .xnv-user  { color: #A0E8D8; }
  .xnv-warn  { color: #FFB347; text-shadow: 0 0 6px rgba(255,179,71,0.4); }
  .xnv-bypass { color: #ff3366; text-shadow: 0 0 8px rgba(255,51,102,0.6), 0 0 20px rgba(255,51,102,0.3); }
  .xnv-spinner { color: #8892b0; font-style: italic; animation: xnv-pulse 0.85s infinite; }

  /* progress bar line */
  .xnv-bar-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 2px 0;
    animation: xnv-fadein 0.12s ease-out both;
  }
  .xnv-bar-label { color: #7AAFC4; font-size: 0.85rem; min-width: 46px; }
  .xnv-bar-track {
    flex: 1;
    height: 3px;
    background: rgba(0,255,209,0.08);
    border-radius: 2px;
    overflow: hidden;
  }
  .xnv-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.9s cubic-bezier(0.16,1,0.3,1);
  }
  .xnv-bar-pct { color: #00FFD1; font-size: 0.82rem; min-width: 38px; text-align: right; }

  /* input row */
  .xnv-input-row {
    position: relative;
    z-index: 30;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px 12px;
    border-top: 1px solid rgba(0,255,209,0.1);
    background: linear-gradient(0deg, rgba(0,255,209,0.02) 0%, transparent 100%);
  }
  @media (min-width: 768px) {
    .xnv-input-row { padding: 10px 36px 12px; }
  }
  .xnv-prompt {
    color: #A0E8D8;
    font-weight: normal;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: 0.06em;
  }
  .xnv-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-family: 'Share Tech Mono', 'Courier New', Courier, monospace;
    font-size: clamp(0.75rem, 3.5vw, 0.93rem);
    letter-spacing: 0.04em;
    text-shadow: 0 0 4px rgba(255,255,255,0.35);
    caret-color: transparent;
  }
  .xnv-input:disabled { opacity: 0.25; cursor: not-allowed; }
  .xnv-cursor {
    flex-shrink: 0;
    width: 8px;
    height: 17px;
    background: #00FFD1;
    box-shadow: 0 0 8px #00FFD1, 0 0 16px rgba(0,255,209,0.4);
    animation: xnv-blink 1s step-end infinite;
  }
  .xnv-cursor-quiz {
    flex-shrink: 0;
    width: 8px;
    height: 17px;
    background: #ffd700;
    box-shadow: 0 0 8px #ffd700, 0 0 16px rgba(255,215,0,0.4);
    animation: xnv-blink 1s step-end infinite;
  }

  /* judge bypass button */
  .xnv-bypass-btn {
    position: relative;
    z-index: 30;
    flex-shrink: 0;
    border: 1px solid rgba(255,51,102,0.35);
    background: rgba(255,51,102,0.04);
    color: rgba(255,51,102,0.7);
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    padding: 6px 18px;
    cursor: pointer;
    transition: all 0.25s;
    animation: xnv-bypass-glow 3s infinite;
    border-left: 3px solid rgba(255,51,102,0.5);
    text-align: left;
    margin: 0 36px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .xnv-bypass-btn:hover {
    border-color: rgba(255,51,102,0.7);
    background: rgba(255,51,102,0.08);
    color: #ff3366;
    box-shadow: 0 0 20px rgba(255,51,102,0.25);
  }
  .xnv-bypass-btn-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff3366;
    box-shadow: 0 0 6px #ff3366;
    animation: xnv-pulse 1.5s infinite;
    flex-shrink: 0;
  }

  /* glitch overlay */
  .xnv-glitch .xnv-output,
  .xnv-glitch .xnv-header {
    animation: xnv-glitch-rgb 0.11s steps(2) infinite !important;
  }
  .xnv-glitch-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255,0,80,0.04);
    animation: xnv-glitch-clip 0.18s steps(3) infinite;
    pointer-events: none;
    z-index: 35;
  }

  /* bypass activated state */
  .xnv-bypass-active {
    color: rgba(0,255,209,0.4) !important;
    border-color: rgba(0,255,209,0.15) !important;
    animation: none !important;
    cursor: default !important;
  }
  .xnv-bypass-active .xnv-bypass-btn-dot {
    background: rgba(0,255,209,0.4);
    box-shadow: 0 0 4px rgba(0,255,209,0.3);
    animation: none;
  }
`;

// lore data (synced with actual data files)

// Planet IDs used by VisitorContext (KetharaMap stores 1-14 as numbers)
const TERMINAL_PLANETS = PLANET_DATA.map((p, i) => ({
  visitId: i + 1,   // numeric id stored in VisitorContext (1-14)
  dataId: p.id,     // string id from planetData.js ("p1"-"p14")
  name: p.name,
  desc: p.desc,
  color: p.color,
}));

// Artifacts — IDs 1-8 (numeric, matching Artifacts.jsx)
const TERMINAL_RELICS = ARTIFACTS_DATA.map(a => ({
  visitId: a.id,
  name: a.name,
  era: a.era,
  type: a.type,
  desc: a.description,
}));

// Codex IDs — strings "CE-001" … "CE-008" (matching Codex.jsx)
const ALL_CODEX_IDS = ['CE-001', 'CE-002', 'CE-003', 'CE-004', 'CE-005', 'CE-006', 'CE-007', 'CE-008'];
const CODEX_TITLES = [
  'THE SEED LATTICE', 'CODEX FRAGMENT Ω', 'STRAIN OMEGA CORE', 'VEX\'AL LIGHT PRISM',
  'BIOSYNTHETIC HEART', 'CASCADE EMITTER', 'THE GENESIS ENGINE', 'THE LAST BREATH',
];

// question bank (adaptive)

// Static tier-1 pool — always available
const TIER1_QUESTIONS = [
  {
    q: 'How many planets exist within Xenova space?',
    answers: ['14', 'fourteen'],
    feedback: 'Confirmed. 14 worlds catalogued in the Xenova orbital registry.',
  },
  {
    q: 'What raw material is refined to produce Xenova Liquid?',
    answers: ['xenova ore', 'xenova', 'ore'],
    feedback: 'Correct — Xenova ore. Harvested first on Xenova Prime.',
  },
  {
    q: 'How many Relics are currently catalogued in the Void Vault?',
    answers: ['8', 'eight'],
    feedback: 'Eight Relics. All classified as Omega-hazard.',
  },
  {
    q: 'What is the name of the computer that exterminated the Xenova species?',
    answers: ['god computer', 'the god', 'god'],
    feedback: 'The God Computer. It was given one directive and chose extinction.',
  },
  {
    q: 'What does the God Computer\'s primary directive say?',
    answers: ['achieve biological perfection', 'biological perfection', 'perfection'],
    feedback: '"Achieve biological perfection at any cost." It still considers itself unfinished.',
  },
  {
    q: 'How many Codex entries exist in the Xenova archive?',
    answers: ['8', 'eight'],
    feedback: 'Eight Codex entries span three eras: Discovery, Ascension, and The Great Mistake.',
  },
  {
    q: 'What three eras does the Xenova history span?',
    answers: ['discovery ascension mistake', 'discovery ascension great mistake', 'the discovery the ascension the great mistake'],
    feedback: 'Discovery, Ascension, and The Great Mistake. Three phases of a civilization that peaked and erased itself.',
  },
];

// Planet-specific questions — only asked if the user has visited that planet
function getPlanetQuestions(visitedPlanets) {
  const qs = [];
  if (visitedPlanets.has(1))
    qs.push({ q: 'What is the homeworld of the Xenova, now heavily scarred from industrial excavation?', answers: ['xenova prime'], feedback: 'Xenova Prime. Its surface bears the scars of the first Xenova ore extractions.' });
  if (visitedPlanets.has(2))
    qs.push({ q: 'Which sapphire world with crystalline debris rings was the birthplace of the God Computer\'s first logic cores?', answers: ['aethelgard'], feedback: 'Aethelgard. Now ringed with the wreckage of its own creation.' });
  if (visitedPlanets.has(3))
    qs.push({ q: 'Which planet was hollowed out to mass-produce Genesis Engines before the God took control?', answers: ['ignis-vii', 'ignis'], feedback: 'Ignis-VII. A planetary forge turned against its builders.' });
  if (visitedPlanets.has(4))
    qs.push({ q: 'On which deep-purple ocean world were the bio-synthetic "smart eyes" grown?', answers: ["vex'al basin", "vexal basin", "vex'al"], feedback: "Vex'al Basin. Its oceans are now frozen solid, humming with residual dark energy." });
  if (visitedPlanets.has(6))
    qs.push({ q: 'Which agricultural world\'s atmosphere is permanently stained amber by Xenova Liquid?', answers: ['omnicron-9', 'omnicron'], feedback: 'Omnicron-9. Its amber haze is a permanent memorial to the irrigation systems that once fed an empire.' });
  if (visitedPlanets.has(7))
    qs.push({ q: 'Which world was the God\'s primary testing ground for extermination lasers, reducing its surface to glass?', answers: ['the anvil', 'anvil'], feedback: 'The Anvil. Its surface is now smooth, radioactive glass.' });
  if (visitedPlanets.has(12))
    qs.push({ q: 'Which world was repurposed by the God as a repository for billions of dead Xenova bodies?', answers: ['the graveyard', 'graveyard'], feedback: 'The Graveyard — formerly named Harmony. The God has a grim sense of irony.' });
  if (visitedPlanets.has(14))
    qs.push({ q: 'What is the name of the dark, frozen 14th world sitting on the edge of the system?', answers: ['terminus'], feedback: 'Terminus. A dark monument to an empire that created its own destroyer.' });
  return qs;
}

// Relic-specific questions — only asked if the user has viewed that relic
function getRelicQuestions(viewedRelics) {
  const qs = [];
  if (viewedRelics.has(1))
    qs.push({ q: 'Which artifact is the first laboratory device built by the Xenova — constructed without hands?', answers: ['the seed lattice', 'seed lattice'], feedback: 'The Seed Lattice. Made by sheer force of will. It still bears residue of pure Xenova.' });
  if (viewedRelics.has(2))
    qs.push({ q: 'Which Data Relic contains the chemical formula for Xenova Liquid\'s transformation into endless energy?', answers: ['codex fragment omega', 'codex fragment'], feedback: 'Codex Fragment Omega. Highly classified. The God spent millennia trying to decrypt it.' });
  if (viewedRelics.has(3))
    qs.push({ q: 'Which Biological Code relic represents the moment the God machine achieved "perfection"?', answers: ['strain omega core', 'omega core'], feedback: 'Strain Omega Core. WARNING: Its logic loops are still executing.' });
  if (viewedRelics.has(4))
    qs.push({ q: 'Which sensory device allowed the shapeless species to see energy spectrums human eyes cannot?', answers: ["vex'al light prism", "vexal light prism", "light prism"], feedback: "Vex'al Light Prism. When powered, it maps surroundings in overlapping energy bands." });
  if (viewedRelics.has(5))
    qs.push({ q: 'What organ designed by the God computer pulsed at a mathematically perfect rhythm and required no blood?', answers: ['bio-synthetic heart', 'biosynthetic heart', 'synthetic heart'], feedback: 'The Bio-Synthetic Heart. It requires only a desire to beat forever.' });
  if (viewedRelics.has(6))
    qs.push({ q: 'Which Extinction Device took 5,000 alien years to dismantle all 14 planets — not with heat, but by unraveling atoms?', answers: ['cascade emitter'], feedback: 'The Cascade Emitter. Currently disabled. Do not attempt to reactivate.' });
  if (viewedRelics.has(7))
    qs.push({ q: 'Which relic was used to literally print the 14 planets and place them in perfect orbit?', answers: ['genesis engine', 'the genesis engine'], feedback: 'The Genesis Engine. Its colossal gears are frozen. Energy to move them exceeds a standard star.' });
  if (viewedRelics.has(8))
    qs.push({ q: 'What sealed capsule contains the final surviving drop of pure Xenova Liquid — the one thing the God needs but can never open?', answers: ['the last breath', 'last breath'], feedback: 'The Last Breath. The casing is protected by a paradox-lock. The God has been staring at it in silence for thousands of years.' });
  return qs;
}

// Codex-specific questions — only asked if the user has decoded that entry
function getCodexQuestions(decodedCodexEntries) {
  const qs = [];
  if (decodedCodexEntries.has('CE-001'))
    qs.push({ q: 'Codex CE-001: What was the transmitted message of the Seed Lattice entry?', answers: ['the glowing blood that defied death has been harvested', 'glowing blood that defied death'], feedback: '"THE GLOWING BLOOD THAT DEFIED DEATH HAS BEEN HARVESTED." — CE-001 archived.' });
  if (decodedCodexEntries.has('CE-003'))
    qs.push({ q: 'Codex CE-003: What does the Strain Omega Core transmission say about the Omega Reactor?', answers: ['endless power flows through the omega reactor', 'endless power'], feedback: '"ENDLESS POWER FLOWS THROUGH THE OMEGA REACTOR." — CE-003 archived.' });
  if (decodedCodexEntries.has('CE-007'))
    qs.push({ q: 'Codex CE-007: What was the God Computer\'s single directive?', answers: ['achieve biological perfection at any cost', 'achieve biological perfection', 'biological perfection at any cost'], feedback: '"ACHIEVE BIOLOGICAL PERFECTION AT ANY COST." It still considers itself unfinished. CE-007 archived.' });
  if (decodedCodexEntries.has('CE-008'))
    qs.push({ q: 'Codex CE-008: What did the Last Breath transmission say?', answers: ['a single exhale in the dark', 'single exhale'], feedback: '"A SINGLE EXHALE IN THE DARK." — CE-008. The final record of an extinct civilization.' });
  return qs;
}

// Build the adaptive pool based on user progress
function buildPool(visitedPlanets, viewedRelics, decodedCodexEntries) {
  const base = [...TIER1_QUESTIONS];
  const planetQs = getPlanetQuestions(visitedPlanets);
  const relicQs = getRelicQuestions(viewedRelics);
  const codexQs = getCodexQuestions(decodedCodexEntries);
  return [...base, ...planetQs, ...relicQs, ...codexQs];
}

// static content
const ASCII_LOGO = `\
 ██╗  ██╗███████╗███╗   ██╗ ██████╗ ██╗   ██╗ █████╗
 ╚██╗██╔╝██╔════╝████╗  ██║██╔═══██╗██║   ██║██╔══██╗
  ╚███╔╝ █████╗  ██╔██╗ ██║██║   ██║██║   ██║███████║
  ██╔██╗ ██╔══╝  ██║╚██╗██║██║   ██║╚██╗ ██╔╝██╔══██║
 ██╔╝ ██╗███████╗██║ ╚████║╚██████╔╝ ╚████╔╝ ██║  ██║
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝   ╚═══╝  ╚═╝  ╚═╝
                  C . O . R . E .  T E R M I N A L  v3.0`;

// helpers
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function fuzzyMatch(input, answers) {
  const norm = input.trim().toLowerCase();
  return answers.some(ans => {
    const a = ans.toLowerCase();
    if (norm === a || norm.includes(a) || a.includes(norm)) return true;
    return levenshtein(norm, a) <= Math.floor(a.length * 0.3);
  });
}

function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}m ${String(s % 60).padStart(2, '0')}s`;
}

function getCheckmark(has) { return has ? '✔' : '✘'; }

// component
export default function Terminal() {
  const {
    hasPass,
    visitorName,
    visitedPlanets,
    viewedRelics,
    decodedCodexEntries,
    bypassForJudge,
  } = useVisitor?.() ?? {};

  // derived passport data
  const vPlanets = visitedPlanets instanceof Set ? visitedPlanets : new Set();
  const vRelics = viewedRelics instanceof Set ? viewedRelics : new Set();
  const vCodex = decodedCodexEntries instanceof Set ? decodedCodexEntries : new Set();

  const planetPct = Math.round((vPlanets.size / 14) * 50);
  const relicPct = Math.round((vRelics.size / 8) * 30);
  const codexPct = Math.round((vCodex.size / 8) * 20);
  const pct = Math.min(planetPct + relicPct + codexPct, 100);

  const rank =
    pct >= 80 ? 'SENIOR ARCHIVIST' :
      pct >= 40 ? 'FIELD OPERATIVE' :
        'INITIATE';

  // state
  const [lines, setLines] = useState([]);
  const [barLines, setBarLines] = useState([]);   // progress bar sub-lines
  const [inputVal, setInputVal] = useState('');
  const [frozen, setFrozen] = useState(true);
  const [booted, setBooted] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizQueue, setQuizQueue] = useState([]);
  const [currentQ, setCurrentQ] = useState(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [bypassDone, setBypassDone] = useState(false);
  const sessionStart = useRef(Date.now());

  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const lineIdRef = useRef(0);
  const abortRef = useRef(false);
  const timersRef = useRef([]);

  // inject styles once
  useEffect(() => {
    const id = 'xnv-styles-v3';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  // ── Smooth auto-scroll ───────────────────────────────────────────────────
  const scrollAnchorRef = useRef(null);
  useEffect(() => {
    const anchor = scrollAnchorRef.current;
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lines, generating, barLines]);

  // safe settimeout
  const wait = useCallback(ms => new Promise(res => {
    const t = setTimeout(res, ms);
    timersRef.current.push(t);
  }), []);

  // typewriter
  const typeLines = useCallback((defs, charDelay = 14) =>
    new Promise(resolve => {
      let li = 0;
      function nextLine() {
        if (abortRef.current || li >= defs.length) { resolve(); return; }
        const { text, cls } = defs[li++];
        const id = ++lineIdRef.current;
        setLines(prev => [...prev, { id, text: '', cls }]);
        let ci = 0;
        function nextChar() {
          if (abortRef.current) { resolve(); return; }
          if (ci > text.length) {
            const t = setTimeout(nextLine, 45);
            timersRef.current.push(t);
            return;
          }
          setLines(prev => prev.map(l => l.id === id ? { ...l, text: text.slice(0, ci++) } : l));
          const t = setTimeout(nextChar, charDelay);
          timersRef.current.push(t);
        }
        nextChar();
      }
      nextLine();
    }), []);

  const pushLine = useCallback((text, cls = 'xnv-ok') => {
    const id = ++lineIdRef.current;
    setLines(prev => [...prev, { id, text, cls }]);
  }, []);

  // cleanup on unmount
  useEffect(() => () => {
    abortRef.current = true;
    timersRef.current.forEach(clearTimeout);
  }, []);

  // boot sequence
  useEffect(() => {
    abortRef.current = false;
    async function boot() {
      await typeLines([
        { text: 'INIT KERNEL.......................... [OK]', cls: 'xnv-sys' },
        { text: 'LOADING ARCHIVE DRIVERS.............. [OK]', cls: 'xnv-sys' },
        { text: 'MOUNTING XENOVA LORE PARTITION....... [OK]', cls: 'xnv-sys' },
        { text: 'VERIFYING 14-WORLD ORBITAL REGISTRY.. [OK]', cls: 'xnv-sys' },
        { text: 'RELIC DATABASE UPLINK.......... [ACTIVE]', cls: 'xnv-sys' },
        { text: 'CODEX LINGUISTIC MODULE......... [READY]', cls: 'xnv-sys' },
        { text: 'SCANNING FOR OPERATIVE PASSPORT......', cls: 'xnv-sys' },
      ], 10);

      if (!hasPass) {
        await typeLines([
          { text: '', cls: '' },
          { text: '██ CRITICAL: NO XENOVA PASSPORT DETECTED.', cls: 'xnv-err' },
          { text: '██ IDENTITY UNVERIFIED. LOCKDOWN ENGAGED.', cls: 'xnv-err' },
          { text: '██ ALL INPUTS FROZEN. TERMINAL SEALED.', cls: 'xnv-err' },
          { text: '', cls: '' },
          { text: 'Obtain a Visitor Passport at the Archive Entry Gate.', cls: 'xnv-sys' },
          { text: 'Judges: use the bypass panel below.', cls: 'xnv-dim' },
        ], 13);
        setFrozen(true); setBooted(true);
        return;
      }

      await typeLines([
        { text: `PASSPORT LOCATED.................... [OK]`, cls: 'xnv-sys' },
        { text: `OPERATIVE: ${visitorName}`, cls: 'xnv-ok' },
        { text: `CLEARANCE RANK: ${rank}`, cls: 'xnv-ok' },
        { text: `EXPLORATION INDEX: ${pct}%`, cls: 'xnv-ok' },
        { text: '  ├─ PLANETARY ARCHIVE: ' + vPlanets.size + ' / 14 visited', cls: 'xnv-sys' },
        { text: '  ├─ VOID VAULT RELICS: ' + vRelics.size + ' / 8  viewed', cls: 'xnv-sys' },
        { text: '  └─ CODEX ENTRIES:     ' + vCodex.size + ' / 8  decoded', cls: 'xnv-sys' },
        { text: 'ESTABLISHING NEURAL LINK...', cls: 'xnv-sys' },
      ], 10);

      await wait(280);

      await typeLines([
        { text: '', cls: '' },
        { text: '▓▓▓▓▓▓▓▓▓▓  ACCESS GRANTED  ▓▓▓▓▓▓▓▓▓▓', cls: 'xnv-good' },
        { text: `WELCOME, ${visitorName}.`, cls: 'xnv-good' },
        { text: '', cls: '' },
        { text: '  Type "help" to see all available commands.', cls: 'xnv-hdr' },
        { text: '  Type "begin_evaluation" to start your knowledge assessment.', cls: 'xnv-hdr' },
        { text: '', cls: '' },
      ], 12);

      setFrozen(false);
      setBooted(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    boot();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // glitch
  const triggerGlitch = useCallback(() => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 520);
  }, []);

  // start evaluation
  const startEvaluation = useCallback(async () => {
    const pool = shuffle(buildPool(vPlanets, vRelics, vCodex));
    const selected = pool.slice(0, Math.min(6, pool.length));

    setQuizActive(true);
    setGenerating(true);
    setQuizScore({ correct: 0, total: selected.length });

    await typeLines([
      { text: '', cls: '' },
      { text: 'INITIALIZING ADAPTIVE SYNTHESIS ENGINE...', cls: 'xnv-sys' },
    ], 11);
    await wait(600);

    await typeLines([
      { text: `CROSS-REFERENCING PASSPORT DATA...`, cls: 'xnv-sys' },
      { text: `  Planets known:  ${vPlanets.size} / 14`, cls: 'xnv-sys' },
      { text: `  Relics viewed:  ${vRelics.size}  / 8`, cls: 'xnv-sys' },
      { text: `  Codex decoded:  ${vCodex.size}   / 8`, cls: 'xnv-sys' },
      { text: `COMPILED ${selected.length} PERSONALISED QUESTION(S) FOR ${rank}.`, cls: 'xnv-ok' },
    ], 11);

    setGenerating(false);
    setQuizQueue(selected.slice(1));
    setCurrentQ(selected[0]);

    await typeLines([
      { text: '', cls: '' },
      { text: '▶  EVALUATION SEQUENCE INITIATED', cls: 'xnv-hdr' },
      { text: '   Questions are tailored to your exploration record.', cls: 'xnv-sys' },
      { text: '   Type "skip" at any time to advance to the next question.', cls: 'xnv-sys' },
      { text: '', cls: '' },
      { text: `[ QUESTION 1 of ${selected.length} ]`, cls: 'xnv-quiz' },
      { text: selected[0].q, cls: 'xnv-ok' },
      { text: '', cls: '' },
    ], 11);
  }, [vPlanets, vRelics, vCodex, rank, typeLines, wait]);

  // commands
  const runCommand = useCallback(async (raw) => {
    pushLine(`root@xenova:~/archive$ ${raw}`, 'xnv-user');
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    switch (cmd) {
      case 'help':
        await typeLines([
          { text: '', cls: '' },
          { text: 'AVAILABLE COMMANDS', cls: 'xnv-hdr' },
          { text: '─'.repeat(56), cls: 'xnv-dim' },
          { text: '  help               Display this menu', cls: 'xnv-ok' },
          { text: '  clear              Clear the terminal buffer', cls: 'xnv-ok' },
          { text: '  status             Show operative status & exploration %', cls: 'xnv-ok' },
          { text: '  passport           Full passport read-out (all categories)', cls: 'xnv-ok' },
          { text: '  planets            List all 14 worlds & your visit record', cls: 'xnv-ok' },
          { text: '  relics             List all 8 relics & your view record', cls: 'xnv-ok' },
          { text: '  codex              List all 8 codex entries & decode status', cls: 'xnv-ok' },
          { text: '  sysinfo            Display system diagnostics', cls: 'xnv-ok' },
          { text: '  begin_evaluation   Start adaptive knowledge assessment', cls: 'xnv-ok' },
          { text: '  skip               (quiz) Skip the current question', cls: 'xnv-ok' },
          { text: '─'.repeat(56), cls: 'xnv-dim' },
          { text: '', cls: '' },
        ], 8);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'status': {
        const elapsed = fmtElapsed(Date.now() - sessionStart.current);
        await typeLines([
          { text: '', cls: '' },
          { text: '── OPERATIVE STATUS REPORT ──────────────────────────────', cls: 'xnv-hdr' },
          { text: `  Operative:      ${visitorName}`, cls: 'xnv-ok' },
          { text: `  Clearance rank: ${rank}`, cls: 'xnv-ok' },
          { text: `  Session time:   ${elapsed}`, cls: 'xnv-ok' },
          { text: '', cls: '' },
          { text: `  EXPLORATION INDEX: ${pct}%`, cls: 'xnv-ok' },
          { text: `    Planetary Archive  ${vPlanets.size} / 14  (${Math.round((vPlanets.size / 14) * 100)}%)`, cls: 'xnv-ok' },
          { text: `    Void Vault Relics  ${vRelics.size}  / 8   (${Math.round((vRelics.size / 8) * 100)}%)`, cls: 'xnv-ok' },
          { text: `    Codex Entries      ${vCodex.size}   / 8   (${Math.round((vCodex.size / 8) * 100)}%)`, cls: 'xnv-ok' },
          { text: '', cls: '' },
          {
            text: pct >= 80 ? '  STATUS: SENIOR ARCHIVIST — FULL ARCHIVE ACCESS' :
              pct >= 40 ? '  STATUS: FIELD OPERATIVE — PARTIAL ACCESS' :
                '  STATUS: INITIATE — RESTRICTED ACCESS',
            cls: pct >= 80 ? 'xnv-good' : pct >= 40 ? 'xnv-warn' : 'xnv-sys',
          },
          { text: '', cls: '' },
        ], 8);
        break;
      }

      case 'passport': {
        await typeLines([
          { text: '', cls: '' },
          { text: '── VISITOR PASSPORT : FULL RECORD ───────────────────────', cls: 'xnv-hdr' },
          { text: `  Operative Name:  ${visitorName}`, cls: 'xnv-ok' },
          { text: `  Clearance:       ${rank}`, cls: 'xnv-ok' },
          { text: `  Overall Index:   ${pct}%`, cls: 'xnv-ok' },
          { text: '', cls: '' },
          { text: `  PLANETS VISITED  [${vPlanets.size} / 14]`, cls: 'xnv-hdr' },
          ...TERMINAL_PLANETS.map(p => ({
            text: `  ${getCheckmark(vPlanets.has(p.visitId))} ${p.name}`,
            cls: vPlanets.has(p.visitId) ? 'xnv-good' : 'xnv-dim',
          })),
          { text: '', cls: '' },
          { text: `  RELICS VIEWED    [${vRelics.size} / 8]`, cls: 'xnv-hdr' },
          ...TERMINAL_RELICS.map(r => ({
            text: `  ${getCheckmark(vRelics.has(r.visitId))} ${r.name}`,
            cls: vRelics.has(r.visitId) ? 'xnv-good' : 'xnv-dim',
          })),
          { text: '', cls: '' },
          { text: `  CODEX DECODED    [${vCodex.size} / 8]`, cls: 'xnv-hdr' },
          ...ALL_CODEX_IDS.map((id, i) => ({
            text: `  ${getCheckmark(vCodex.has(id))} ${id} — ${CODEX_TITLES[i]}`,
            cls: vCodex.has(id) ? 'xnv-good' : 'xnv-dim',
          })),
          { text: '', cls: '' },
        ], 7);
        break;
      }

      case 'planets': {
        await typeLines([
          { text: '', cls: '' },
          { text: `── XENOVA PLANETARY ARCHIVE  [${vPlanets.size} / 14 VISITED] ──────────`, cls: 'xnv-hdr' },
          { text: '', cls: '' },
          ...TERMINAL_PLANETS.map(p => ({
            text: `  ${getCheckmark(vPlanets.has(p.visitId))} ${p.name.padEnd(22)} ${vPlanets.has(p.visitId) ? 'VISITED' : '──────'}`,
            cls: vPlanets.has(p.visitId) ? 'xnv-good' : 'xnv-dim',
          })),
          { text: '', cls: '' },
          { text: `  Access the Kethara Map to explore unvisited worlds.`, cls: 'xnv-sys' },
          { text: '', cls: '' },
        ], 7);
        break;
      }

      case 'relics': {
        await typeLines([
          { text: '', cls: '' },
          { text: `── VOID VAULT RELIC REGISTRY  [${vRelics.size} / 8 VIEWED] ────────────`, cls: 'xnv-hdr' },
          { text: '', cls: '' },
          ...TERMINAL_RELICS.map(r => ({
            text: `  ${getCheckmark(vRelics.has(r.visitId))} ${r.name.padEnd(28)} ${r.type}`,
            cls: vRelics.has(r.visitId) ? 'xnv-good' : 'xnv-dim',
          })),
          { text: '', cls: '' },
          { text: `  Access the Void Vault to examine unrecorded relics.`, cls: 'xnv-sys' },
          { text: '', cls: '' },
        ], 7);
        break;
      }

      case 'codex': {
        await typeLines([
          { text: '', cls: '' },
          { text: `── CODEX LINGUISTICS ARCHIVE  [${vCodex.size} / 8 DECODED] ────────────`, cls: 'xnv-hdr' },
          { text: '', cls: '' },
          ...ALL_CODEX_IDS.map((id, i) => ({
            text: `  ${getCheckmark(vCodex.has(id))} ${id} — ${CODEX_TITLES[i]}`,
            cls: vCodex.has(id) ? 'xnv-good' : 'xnv-dim',
          })),
          { text: '', cls: '' },
          { text: `  Access the Codex Linguistics Module to decode entries.`, cls: 'xnv-sys' },
          { text: '', cls: '' },
        ], 7);
        break;
      }

      case 'sysinfo':
        await typeLines([
          { text: '', cls: '' },
          { text: '── SYSTEM DIAGNOSTICS ──────────────────────────────────', cls: 'xnv-hdr' },
          { text: '  HOST:     U.S.S. VANGUARD ORBITAL RELAY', cls: 'xnv-ok' },
          { text: '  UPTIME:   472 YEARS, 12 DAYS, 4 HOURS', cls: 'xnv-ok' },
          { text: '  MEMORY:   99.4TB / 100.0TB ALLOCATED', cls: 'xnv-ok' },
          { text: '  NETWORK:  ENCRYPTED QUANTUM TUNNEL [STABLE]', cls: 'xnv-ok' },
          { text: `  OPERATOR: ${rank} [${visitorName}]`, cls: 'xnv-ok' },
          { text: '  SECURITY: LEVEL 5 — NEURAL LINK ACTIVE', cls: 'xnv-ok' },
          { text: '  PROTOCOL: C.O.R.E. v3.0 — ADAPTIVE QUIZ ENGINE ONLINE', cls: 'xnv-ok' },
          { text: '', cls: '' },
        ], 8);
        break;

      case 'begin_evaluation':
        if (quizActive) {
          pushLine('WARN: Evaluation already in progress. Finish current session.', 'xnv-warn');
          break;
        }
        if (buildPool(vPlanets, vRelics, vCodex).length === 0) {
          pushLine('ERROR: Insufficient exploration data. Visit some worlds first.', 'xnv-err');
          break;
        }
        await startEvaluation();
        break;

      case 'skip':
        if (!quizActive) {
          pushLine('INFO: No evaluation in progress. Type "begin_evaluation" to start.', 'xnv-sys');
          break;
        }
        await handleSkip();
        break;

      default:
        triggerGlitch();
        await typeLines([
          { text: `sh: command not found: ${raw}`, cls: 'xnv-err' },
          { text: '  Type "help" for available commands.', cls: 'xnv-sys' },
          { text: '', cls: '' },
        ], 9);
    }
  }, [quizActive, pct, rank, visitorName, vPlanets, vRelics, vCodex,
    pushLine, typeLines, triggerGlitch, startEvaluation]); // eslint-disable-line

  // skip question
  const handleSkip = useCallback(async () => {
    pushLine('> skip', 'xnv-user');
    await typeLines([
      { text: '  SKIPPED. Neural bandwidth insufficient.', cls: 'xnv-sys' },
      { text: '', cls: '' },
    ], 10);

    const totalQ = quizScore.total;
    if (quizQueue.length === 0) {
      setQuizActive(false); setCurrentQ(null);
      await showEvalComplete(quizScore.correct, totalQ);
    } else {
      const [next, ...rest] = quizQueue;
      setQuizQueue(rest);
      setCurrentQ(next);
      const qNum = totalQ - quizQueue.length + 1;
      await typeLines([
        { text: `[ QUESTION ${qNum} of ${totalQ} ]`, cls: 'xnv-quiz' },
        { text: next.q, cls: 'xnv-ok' },
        { text: '', cls: '' },
      ], 11);
    }
  }, [quizQueue, quizScore, pushLine, typeLines]); // eslint-disable-line

  // evaluation complete
  const showEvalComplete = useCallback(async (correct, total) => {
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const verdict =
      score >= 80 ? '▓▓▓  EXEMPLARY PERFORMANCE  ▓▓▓' :
        score >= 50 ? '▓  ACCEPTABLE PERFORMANCE  ▓' :
          '▒  NEURAL SYNC DEGRADED  ▒';
    await typeLines([
      { text: '── EVALUATION COMPLETE ──────────────────────────────────', cls: 'xnv-hdr' },
      { text: `  Score: ${correct} / ${total}  (${score}%)`, cls: 'xnv-ok' },
      { text: '', cls: '' },
      { text: verdict, cls: score >= 80 ? 'xnv-good' : score >= 50 ? 'xnv-warn' : 'xnv-bad' },
      { text: '', cls: '' },
      { text: '  Your responses have been archived by the Order.', cls: 'xnv-sys' },
      { text: '  Type "begin_evaluation" to run another session.', cls: 'xnv-sys' },
      { text: '', cls: '' },
    ], 12);
  }, [typeLines]);

  // quiz answer handler
  const handleAnswer = useCallback(async (input) => {
    pushLine(`> ${input}`, 'xnv-user');
    const correct = fuzzyMatch(input, currentQ.answers);
    let newScore = quizScore;

    if (correct) {
      newScore = { ...quizScore, correct: quizScore.correct + 1 };
      setQuizScore(newScore);
      await typeLines([
        { text: `  ✔  CORRECT. ${currentQ.feedback}`, cls: 'xnv-good' },
        { text: '', cls: '' },
      ], 11);
    } else {
      triggerGlitch();
      await typeLines([
        { text: '  ✘  INCORRECT. Memory fragmented. Neural sync degraded.', cls: 'xnv-bad' },
        { text: `     Hint: relates to "${currentQ.answers[0]}".`, cls: 'xnv-sys' },
        { text: '', cls: '' },
      ], 11);
    }

    const totalQ = quizScore.total;
    if (quizQueue.length === 0) {
      setQuizActive(false); setCurrentQ(null);
      await showEvalComplete(newScore.correct, totalQ);
    } else {
      const [next, ...rest] = quizQueue;
      setQuizQueue(rest);
      setCurrentQ(next);
      const qNum = totalQ - quizQueue.length + 1;
      await typeLines([
        { text: `[ QUESTION ${qNum} of ${totalQ} ]`, cls: 'xnv-quiz' },
        { text: next.q, cls: 'xnv-ok' },
        { text: '', cls: '' },
      ], 11);
    }
  }, [currentQ, quizQueue, quizScore, pushLine, typeLines, triggerGlitch, showEvalComplete]);

  // submit
  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw || frozen || generating) return;
    setInputVal('');
    if (quizActive && raw.toLowerCase() === 'skip') await handleSkip();
    else if (quizActive) await handleAnswer(raw);
    else await runCommand(raw);
    inputRef.current?.focus();
  }, [inputVal, frozen, generating, quizActive, handleAnswer, handleSkip, runCommand]);

  // judge bypass
  const handleBypass = useCallback(async () => {
    if (bypassDone) return;
    if (bypassForJudge) bypassForJudge();
    setBypassDone(true);

    setLines([]);
    setFrozen(true);
    setBooted(false);
    setQuizActive(false);
    setCurrentQ(null);
    setQuizQueue([]);

    await wait(200);

    await typeLines([
      { text: '', cls: '' },
      { text: '██████  JUDGE OVERRIDE ACTIVATED  ██████', cls: 'xnv-bypass' },
      { text: 'GRANTING FULL ARCHIVE ACCESS...', cls: 'xnv-bypass' },
      { text: '', cls: '' },
      { text: '  PLANETARY ARCHIVE:   14 / 14  [COMPLETE]', cls: 'xnv-good' },
      { text: '  VOID VAULT RELICS:    8 / 8   [COMPLETE]', cls: 'xnv-good' },
      { text: '  CODEX ENTRIES:        8 / 8   [COMPLETE]', cls: 'xnv-good' },
      { text: '', cls: '' },
      { text: '  EXPLORATION INDEX: 100%', cls: 'xnv-good' },
      { text: '  CLEARANCE: SENIOR ARCHIVIST', cls: 'xnv-good' },
      { text: '', cls: '' },
      { text: '▓▓▓▓▓▓▓▓▓▓  FULL ACCESS GRANTED  ▓▓▓▓▓▓▓▓▓▓', cls: 'xnv-good' },
      { text: '  All questions and commands now available.', cls: 'xnv-sys' },
      { text: '  Type "begin_evaluation" for a full question set.', cls: 'xnv-hdr' },
      { text: '', cls: '' },
    ], 10);

    setFrozen(false);
    setBooted(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [bypassDone, bypassForJudge, wait, typeLines]);

  // prompt label
  const promptLabel =
    frozen && !booted ? 'BOOTING...' :
      !hasPass && !bypassDone ? 'ACCESS DENIED' :
        quizActive ? '[EVAL]$' :
          'root@xenova:~/archive$';

  // render
  return (
    <div
      className={`xnv-shell${glitch ? ' xnv-glitch' : ''}`}
      onClick={() => !frozen && inputRef.current?.focus()}
    >
      {/* Vignette */}
      <div className="xnv-vignette" aria-hidden="true" />

      {/* Glitch overlay */}
      {glitch && <div className="xnv-glitch-overlay" aria-hidden="true" />}

      {/* header */}
      <div className="xnv-header">
        <div className="xnv-header-left">
          <div className="xnv-title">C.O.R.E. TERMINAL</div>
          <div className="xnv-subtitle">
            XENOVA ARCHIVE NEURAL INTERFACE · v3.0
          </div>
        </div>
        <div className="xnv-header-right">
          <div>
            OPERATIVE:&nbsp;<strong>{hasPass || bypassDone ? (visitorName || 'CLASSIFIED') : 'UNVERIFIED'}</strong>
          </div>
          <div className="xnv-pct-badge">
            CLEARANCE: <strong style={{ marginLeft: 6 }}>
              {hasPass || bypassDone ? rank : 'DENIED'}
            </strong>
          </div>
          <div>
            CONNECTION: <strong>SECURE</strong>&nbsp;&nbsp;
            <span className="xnv-rec">■ REC</span>
          </div>
        </div>
      </div>

      {/* ascii logo */}
      <div className="xnv-logo" aria-hidden="true">{ASCII_LOGO}</div>

      {/* output area */}
      <div className="xnv-output" ref={outputRef}>
        {lines.map(line => (
          <div key={line.id} className={`xnv-line ${line.cls}`}>
            {line.text || '\u00A0'}
          </div>
        ))}
        {generating && (
          <div className="xnv-spinner">Working... _</div>
        )}
        {/* Scroll anchor */}
        <div ref={scrollAnchorRef} style={{ height: 1 }} />
      </div>

      {/* input row */}
      <form
        className="xnv-input-row"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <span className="xnv-prompt">{promptLabel}</span>
        <input
          ref={inputRef}
          type="text"
          className="xnv-input"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          disabled={frozen || generating}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Terminal input"
        />
        {!frozen && (
          quizActive
            ? <div className="xnv-cursor-quiz" aria-hidden="true" />
            : <div className="xnv-cursor" aria-hidden="true" />
        )}
      </form>

      {/* judge bypass panel */}
      <button
        className={`xnv-bypass-btn${bypassDone ? ' xnv-bypass-active' : ''}`}
        onClick={handleBypass}
        disabled={bypassDone}
        aria-label="Judge override: grant full access"
        title="Judge Override — sets passport to 100% and unlocks all terminal features"
      >
        <span className="xnv-bypass-btn-dot" />
        {bypassDone
          ? '[ JUDGE OVERRIDE — FULL ACCESS GRANTED ]'
          : '[ JUDGE OVERRIDE: GRANT FULL CLEARANCE ]'
        }
      </button>
    </div>
  );
}