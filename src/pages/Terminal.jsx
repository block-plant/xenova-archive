import { useState, useEffect, useRef, useCallback } from 'react';
import { useVisitor } from '../context/VisitorContext';

// ─── CSS (injected once, scoped to .xnv-* classes) ────────────────────────────

const STYLES = `
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
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

  /* ── Root shell ── */
  .xnv-shell {
    position: relative;
    width: 100%;
    /* Fills space below the navbar — adjust 64px if your NavBar is a different height */
    height: calc(100vh - 64px);
    background: #030507;
    color: #00FFD1;
    font-family: 'Courier New', Courier, monospace;
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
    height: 18vh;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(0,255,209,0.04) 50%,
      transparent
    );
    animation: xnv-scanline 9s linear infinite;
    pointer-events: none;
    z-index: 21;
  }

  /* Vignette */
  .xnv-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.72) 100%);
    pointer-events: none;
    z-index: 22;
  }

  /* ── Header ── */
  .xnv-header {
    position: relative;
    z-index: 30;
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 18px 32px 14px;
    border-bottom: 1px dotted rgba(0,255,209,0.32);
    animation: xnv-flicker 5s infinite alternate;
  }
  .xnv-title {
    font-size: 1.45rem;
    font-weight: bold;
    letter-spacing: 0.13em;
    text-shadow: 0 0 6px #00FFD1, 0 0 16px rgba(0,255,209,0.45);
  }
  .xnv-subtitle {
    font-size: 0.72rem;
    color: #7AAFC4;
    margin-top: 4px;
    letter-spacing: 0.1em;
  }
  .xnv-header-right {
    font-size: 0.82rem;
    text-align: right;
    line-height: 1.65;
    color: #7AAFC4;
  }
  .xnv-header-right strong { color: #00FFD1; font-weight: normal; }
  .xnv-rec { animation: xnv-pulse 2s infinite; color: #ff3366; }

  /* ── ASCII logo ── */
  .xnv-logo {
    position: relative;
    z-index: 30;
    flex-shrink: 0;
    font-size: 0.58rem;
    line-height: 1.15;
    white-space: pre;
    color: rgba(0,255,209,0.42);
    text-shadow: 0 0 4px rgba(0,255,209,0.25);
    padding: 8px 32px 2px;
  }

  /* ── Output scroll area ── */
  .xnv-output {
    position: relative;
    z-index: 30;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 14px 32px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.98rem;
    line-height: 1.55;
    letter-spacing: 0.04em;
    /* custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(0,255,209,0.22) transparent;
  }
  .xnv-output::-webkit-scrollbar       { width: 5px; }
  .xnv-output::-webkit-scrollbar-thumb { background: rgba(0,255,209,0.22); border-radius: 3px; }
  .xnv-output::-webkit-scrollbar-track { background: transparent; }

  /* ── Line types ── */
  .xnv-line {
    white-space: pre-wrap;
    word-break: break-word;
    animation: xnv-fadein 0.07s ease-out both;
  }
  .xnv-sys  { color: #8892b0; font-style: italic; }
  .xnv-err  { color: #ff3366; text-shadow: 0 0 6px rgba(255,51,102,0.5); }
  .xnv-ok   { color: #e6f1ff; }
  .xnv-hdr  { color: #64ffda; font-weight: bold; letter-spacing: 0.06em; }
  .xnv-quiz { color: #ffd700; text-shadow: 0 0 6px rgba(255,215,0,0.38); }
  .xnv-good { color: #00FFD1; text-shadow: 0 0 5px rgba(0,255,209,0.65), 0 0 12px rgba(0,255,209,0.35); }
  .xnv-bad  { color: #ff3366; text-shadow: 0 0 5px rgba(255,51,102,0.5); }
  .xnv-dim  { color: rgba(0,255,209,0.38); }
  .xnv-user { color: #A0E8D8; }
  .xnv-spinner { color: #8892b0; font-style: italic; animation: xnv-pulse 0.9s infinite; }

  /* ── Input row ── */
  .xnv-input-row {
    position: relative;
    z-index: 30;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 32px 14px;
    border-top: 1px dotted rgba(0,255,209,0.2);
  }
  .xnv-prompt {
    color: #A0E8D8;
    font-weight: bold;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .xnv-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.98rem;
    letter-spacing: 0.04em;
    text-shadow: 0 0 4px rgba(255,255,255,0.4);
    caret-color: transparent;
  }
  .xnv-input:disabled { opacity: 0.28; cursor: not-allowed; }
  .xnv-cursor {
    flex-shrink: 0;
    width: 9px;
    height: 18px;
    background: #00FFD1;
    box-shadow: 0 0 7px #00FFD1;
    animation: xnv-blink 1s step-end infinite;
  }

  /* ── Glitch overlay ── */
  .xnv-glitch .xnv-output,
  .xnv-glitch .xnv-header {
    animation: xnv-glitch-rgb 0.11s steps(2) infinite !important;
  }
  .xnv-glitch-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255,0,80,0.05);
    animation: xnv-glitch-clip 0.18s steps(3) infinite;
    pointer-events: none;
    z-index: 35;
  }
`;

// ─── Lore data ─────────────────────────────────────────────────────────────────

const PLANETS = [
  { id: 'velara', name: 'Velara' }, { id: 'duskor', name: 'Duskor' },
  { id: 'nythea', name: 'Nythea' }, { id: 'caelum', name: 'Caelum' },
  { id: 'orryn', name: 'Orryn' }, { id: 'thresh', name: 'Thresh' },
  { id: 'mirova', name: 'Mirova' }, { id: 'auveth', name: 'Auveth' },
  { id: 'sekora', name: 'Sekora' }, { id: 'pylun', name: 'Pylun' },
  { id: 'erath', name: 'Erath' }, { id: 'voleth', name: 'Voleth' },
  { id: 'solen', name: 'Solen' }, { id: 'ankor', name: 'Ankor' },
];

const RELICS = [
  'Eye of Becoming', 'Null Compass', 'Fracture Key', 'Resonance Bell',
  'Hollow Crown', 'Tide Stone', 'Ankor Shard', 'Genesis Seal',
];

const ALL_QUESTIONS = [
  {
    tier: 1, q: 'How many planets exist within Xenova space?',
    answers: ['14', 'fourteen'],
    feedback: 'Confirmed. 14 worlds catalogued in the Xenova orbital registry.'
  },
  {
    tier: 1, q: 'Which planet is the birthplace of the first Operative bloodline?',
    answers: ['erath'],
    feedback: 'Erath. Cradle world. Its atmosphere was artificially seeded with Xenova spores.'
  },
  {
    tier: 1, q: 'What raw material is refined to produce Xenova Liquid?',
    answers: ['xenova ore', 'xenova', 'ore'],
    feedback: 'Correct — Xenova ore. Primary extraction site: Duskor.'
  },
  {
    tier: 1, q: 'How many Relics are currently catalogued by the Order?',
    answers: ['8', 'eight'],
    feedback: 'Eight Relics. All accounted for. All classified as Omega-hazard.'
  },
  {
    tier: 1, q: 'Which world holds 40,000 cycles of civilisation records carved in white stone?',
    answers: ['caelum'],
    feedback: 'Caelum. A planet-sized library. Access: restricted to Senior Archivists.'
  },
  {
    tier: 1, q: 'Which planet is the primary extraction site for Xenova ore?',
    answers: ['duskor'],
    feedback: 'Duskor. Surface temperature: 900 Kelvin at high noon. Mining suits mandatory.'
  },
  {
    tier: 2, q: 'What does the Null Compass point toward?',
    answers: ['existential collapse', 'nearest point of existential collapse', 'collapse'],
    feedback: 'Correct. Not magnetic north — the nearest point of existential collapse.'
  },
  {
    tier: 2, q: 'On which world were the eight Relics forged?',
    answers: ['voleth'],
    feedback: 'Voleth. Its lava channels run exactly 1,100 km. Forge temperatures: unrecorded.'
  },
  {
    tier: 2, q: 'What does Xenova Liquid primarily do to the neural substrate?',
    answers: ['dissolves the boundary between memory and imagination', 'transfers lore', 'dissolves memory', 'merges memory and imagination'],
    feedback: 'It dissolves the boundary between memory and imagination. Lore transfer initiated.'
  },
  {
    tier: 2, q: 'How long has Ankor been completely lifeless?',
    answers: ['10000 cycles', '10,000 cycles', 'ten thousand cycles'],
    feedback: 'Correct. Ankor went silent exactly 10,000 cycles ago. Cause of extinction: classified.'
  },
  {
    tier: 2, q: 'What does the Hollow Crown paradoxically grant?',
    answers: ['authority', 'authority over all', 'power'],
    feedback: 'Authority over all — granted only to those with no ambition to wield it.'
  },
  {
    tier: 3, q: "State the core of the God's paradox.",
    answers: ['created the genesis engine to destroy itself', 'genesis engine', 'cannot die without existing'],
    feedback: "The God built the Genesis Engine to destroy itself — but its destruction prevents its own creation. The loop is eternal."
  },
  {
    tier: 3, q: 'Which Relic is the lock on the Genesis Engine?',
    answers: ['genesis seal'],
    feedback: "The Genesis Seal. Only the God's paradox can unseal it."
  },
  {
    tier: 3, q: 'What does the Ankor Shard contain?',
    answers: ['last recorded thought', 'last recorded thought of the dead world', 'last thought'],
    feedback: 'The last recorded thought of a dead world. Contents: classified.'
  },
  {
    tier: 3, q: 'What does the Eye of Becoming show its viewer?',
    answers: ['most probable future', 'probable future', 'their future'],
    feedback: "The viewer's most probable future. Most Operatives find this unbearable."
  },
];

const ASCII_LOGO = `
 ██╗  ██╗███████╗███╗   ██╗ ██████╗ ██╗   ██╗ █████╗
 ╚██╗██╔╝██╔════╝████╗  ██║██╔═══██╗██║   ██║██╔══██╗
  ╚███╔╝ █████╗  ██╔██╗ ██║██║   ██║██║   ██║███████║
  ██╔██╗ ██╔══╝  ██║╚██╗██║██║   ██║╚██╗ ██╔╝██╔══██║
 ██╔╝ ██╗███████╗██║ ╚████║╚██████╔╝ ╚████╔╝ ██║  ██║
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝   ╚═══╝  ╚═╝  ╚═╝
                   A R C H I V E  —  T E R M I N A L  v2.4`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPool(pct) {
  if (pct >= 80) return ALL_QUESTIONS;
  if (pct >= 40) return ALL_QUESTIONS.filter(q => q.tier <= 2);
  return ALL_QUESTIONS.filter(q => q.tier === 1);
}

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
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
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
    return levenshtein(norm, a) <= Math.floor(a.length * 0.28);
  });
}

function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}m ${String(s % 60).padStart(2, '0')}s`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Terminal({ passportData: passportProp }) {
  const {
    visitedPlanets = [],
    viewedRelics = [],
    decodedEntries = [],
  } = useVisitor?.() ?? {};

  // ── Derive passport ──────────────────────────────────────────────────────
  const passport = (() => {
    if (passportProp) return passportProp;
    try {
      const raw = localStorage.getItem('xenova_passport');
      if (raw) return JSON.parse(raw);
    } catch (_) { }
    if (visitedPlanets.length || viewedRelics.length || decodedEntries.length) {
      const pct = Math.round(
        (visitedPlanets.length / PLANETS.length) * 50 +
        (viewedRelics.length / RELICS.length) * 30 +
        Math.min(decodedEntries.length / 10, 1) * 20
      );
      return { percentage_explored: Math.min(pct, 100) };
    }
    return null;
  })();

  const hasPassport = !!passport;
  const pct = passport?.percentage_explored ?? 0;
  const rank = pct >= 80 ? 'SENIOR ARCHIVIST' : pct >= 40 ? 'FIELD OPERATIVE' : 'INITIATE';

  // ── State ────────────────────────────────────────────────────────────────
  const [lines, setLines] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [frozen, setFrozen] = useState(true);
  const [booted, setBooted] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizQueue, setQuizQueue] = useState([]);
  const [currentQ, setCurrentQ] = useState(null);
  const sessionStart = useRef(Date.now());

  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const lineIdRef = useRef(0);
  const abortRef = useRef(false);
  const timersRef = useRef([]);

  // ── Inject styles once ───────────────────────────────────────────────────
  useEffect(() => {
    const id = 'xnv-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  // ── Auto-scroll the OUTPUT div — never the page ──────────────────────────
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, generating]);

  // ── Safe setTimeout (cleared on unmount) ─────────────────────────────────
  const wait = useCallback(ms => new Promise(res => {
    const t = setTimeout(res, ms);
    timersRef.current.push(t);
  }), []);

  // ── Typewriter ───────────────────────────────────────────────────────────
  const typeLines = useCallback((defs, charDelay = 15) =>
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
            const t = setTimeout(nextLine, 52);
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

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => () => {
    abortRef.current = true;
    timersRef.current.forEach(clearTimeout);
  }, []);

  // ── Boot sequence ────────────────────────────────────────────────────────
  useEffect(() => {
    abortRef.current = false;
    async function boot() {
      await typeLines([
        { text: 'INIT KERNEL.......................... [OK]', cls: 'xnv-sys' },
        { text: 'LOADING ARCHIVE DRIVERS.............. [OK]', cls: 'xnv-sys' },
        { text: 'MOUNTING XENOVA LORE PARTITION....... [OK]', cls: 'xnv-sys' },
        { text: 'VERIFYING 14-WORLD ORBITAL REGISTRY.. [OK]', cls: 'xnv-sys' },
        { text: 'RELIC DATABASE UPLINK................ [OK]', cls: 'xnv-sys' },
        { text: 'SCANNING FOR OPERATIVE PASSPORT......', cls: 'xnv-sys' },
      ], 11);

      if (!hasPassport) {
        await typeLines([
          { text: '', cls: '' },
          { text: '██ CRITICAL ERROR: XENOVA PASSPORT NOT DETECTED.', cls: 'xnv-err' },
          { text: '██ IDENTITY UNVERIFIED. LOCKDOWN ENGAGED.', cls: 'xnv-err' },
          { text: '██ ACCESS DENIED. ALL INPUTS FROZEN.', cls: 'xnv-err' },
          { text: '', cls: '' },
          { text: 'Contact the Order to obtain a valid passport.', cls: 'xnv-sys' },
        ], 13);
        setFrozen(true); setBooted(true);
        return;
      }

      await typeLines([
        { text: 'PASSPORT LOCATED.................... [OK]', cls: 'xnv-sys' },
        { text: `EXPLORATION INDEX: ${pct}%`, cls: 'xnv-ok' },
        { text: `CLEARANCE RANK: ${rank}`, cls: 'xnv-ok' },
        { text: 'ESTABLISHING NEURAL LINK...', cls: 'xnv-sys' },
      ], 11);

      await wait(300);

      await typeLines([
        { text: '', cls: '' },
        { text: '▓▓▓▓▓▓▓▓▓  ACCESS GRANTED  ▓▓▓▓▓▓▓▓▓', cls: 'xnv-good' },
        { text: 'WELCOME, OPERATIVE.', cls: 'xnv-good' },
        { text: '', cls: '' },
        { text: 'Type "help" to see available commands.', cls: 'xnv-hdr' },
        { text: '', cls: '' },
      ], 13);

      setFrozen(false);
      setBooted(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    boot();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Glitch ───────────────────────────────────────────────────────────────
  const triggerGlitch = useCallback(() => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 560);
  }, []);

  // ── Start evaluation ──────────────────────────────────────────────────────
  const startEvaluation = useCallback(async () => {
    const pool = shuffle(getPool(pct)).slice(0, Math.min(5, getPool(pct).length));
    setQuizActive(true);
    setGenerating(true);

    await typeLines([
      { text: '', cls: '' },
      { text: 'INITIALIZING SYNTHESIS ALGORITHMS...', cls: 'xnv-sys' },
    ], 12);
    await wait(720);

    await typeLines([
      { text: 'EXTRACTING RELIC DATA [100%]', cls: 'xnv-sys' },
      { text: `COMPILED ${pool.length} QUESTION(S) FOR RANK: ${rank}.`, cls: 'xnv-sys' },
    ], 12);

    setGenerating(false);
    setQuizQueue(pool.slice(1));
    setCurrentQ(pool[0]);

    await typeLines([
      { text: '', cls: '' },
      { text: '▶  EVALUATION SEQUENCE INITIATED', cls: 'xnv-hdr' },
      { text: 'Precision is rewarded. Hesitation is not.', cls: 'xnv-sys' },
      { text: '', cls: '' },
      { text: `[ QUESTION 1 of ${pool.length} ]`, cls: 'xnv-quiz' },
      { text: pool[0].q, cls: 'xnv-ok' },
      { text: '', cls: '' },
    ], 12);
  }, [pct, rank, typeLines, wait]);

  // ── Commands ──────────────────────────────────────────────────────────────
  const runCommand = useCallback(async (raw) => {
    pushLine(`root@xenova:~/archive$ ${raw}`, 'xnv-user');
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    switch (cmd) {
      case 'help':
        await typeLines([
          { text: '', cls: '' },
          { text: 'AVAILABLE COMMANDS', cls: 'xnv-hdr' },
          { text: '─'.repeat(50), cls: 'xnv-dim' },
          { text: '> help              Display this menu', cls: 'xnv-ok' },
          { text: '> clear             Clear the terminal buffer', cls: 'xnv-ok' },
          { text: '> status            Show operative status report', cls: 'xnv-ok' },
          { text: '> sysinfo           Display system diagnostics', cls: 'xnv-ok' },
          { text: '> begin_evaluation  Start knowledge assessment', cls: 'xnv-ok' },
          { text: '─'.repeat(50), cls: 'xnv-dim' },
          { text: '', cls: '' },
        ], 9);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'status': {
        const elapsed = fmtElapsed(Date.now() - sessionStart.current);
        await typeLines([
          { text: '', cls: '' },
          { text: '── OPERATIVE STATUS REPORT ──', cls: 'xnv-hdr' },
          { text: `  Exploration:    ${pct}%`, cls: 'xnv-ok' },
          { text: `  Clearance rank: ${rank}`, cls: 'xnv-ok' },
          { text: `  Session time:   ${elapsed}`, cls: 'xnv-ok' },
          { text: `  Planets known:  ${visitedPlanets.length} / ${PLANETS.length}`, cls: 'xnv-ok' },
          { text: `  Relics viewed:  ${viewedRelics.length} / ${RELICS.length}`, cls: 'xnv-ok' },
          { text: '', cls: '' },
        ], 9);
        break;
      }

      case 'sysinfo':
        await typeLines([
          { text: '', cls: '' },
          { text: 'SYSTEM HOST:  U.S.S. VANGUARD ORBITAL RELAY', cls: 'xnv-ok' },
          { text: 'UPTIME:       472 YEARS, 12 DAYS, 4 HOURS', cls: 'xnv-ok' },
          { text: 'MEMORY:       99.4TB / 100.0TB ALLOCATED', cls: 'xnv-ok' },
          { text: 'NETWORK:      ENCRYPTED QUANTUM TUNNEL [STABLE]', cls: 'xnv-ok' },
          { text: `CURRENT USER: OPERATIVE [${rank}]`, cls: 'xnv-ok' },
          { text: 'SECURITY:     LEVEL 5 — NEURAL LINK ACTIVE', cls: 'xnv-ok' },
          { text: '', cls: '' },
        ], 9);
        break;

      case 'begin_evaluation':
        if (quizActive) {
          pushLine('WARN: Evaluation already in progress.', 'xnv-sys');
          break;
        }
        await startEvaluation();
        break;

      default:
        triggerGlitch();
        await typeLines([
          { text: `sh: command not found: ${raw}`, cls: 'xnv-err' },
          { text: 'Type "help" for available commands.', cls: 'xnv-sys' },
          { text: '', cls: '' },
        ], 10);
    }
  }, [quizActive, pct, rank, visitedPlanets.length, viewedRelics.length,
    pushLine, typeLines, triggerGlitch, startEvaluation]);

  // ── Quiz answer handler ───────────────────────────────────────────────────
  const handleAnswer = useCallback(async (input) => {
    pushLine(`> ${input}`, 'xnv-user');
    const correct = fuzzyMatch(input, currentQ.answers);

    if (correct) {
      await typeLines([
        { text: `✔  CORRECT. ${currentQ.feedback}`, cls: 'xnv-good' },
        { text: '', cls: '' },
      ], 12);
    } else {
      triggerGlitch();
      await typeLines([
        { text: '✘  INCORRECT. Memory fragmented. Neural sync degraded.', cls: 'xnv-bad' },
        { text: `   Hint: answer relates to "${currentQ.answers[0]}".`, cls: 'xnv-sys' },
        { text: '', cls: '' },
      ], 12);
    }

    const totalQ = Math.min(5, getPool(pct).length);

    if (quizQueue.length === 0) {
      setQuizActive(false);
      setCurrentQ(null);
      await typeLines([
        { text: '── EVALUATION COMPLETE ──', cls: 'xnv-hdr' },
        { text: 'Your responses have been archived by the Order.', cls: 'xnv-sys' },
        { text: '', cls: '' },
      ], 13);
    } else {
      const [next, ...rest] = quizQueue;
      setQuizQueue(rest);
      setCurrentQ(next);
      const qNum = totalQ - quizQueue.length + 1;
      await typeLines([
        { text: `[ QUESTION ${qNum} of ${totalQ} ]`, cls: 'xnv-quiz' },
        { text: next.q, cls: 'xnv-ok' },
        { text: '', cls: '' },
      ], 12);
    }
  }, [currentQ, quizQueue, pct, pushLine, typeLines, triggerGlitch]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw || frozen || generating) return;
    setInputVal('');
    if (quizActive) await handleAnswer(raw);
    else await runCommand(raw);
    inputRef.current?.focus();
  }, [inputVal, frozen, generating, quizActive, handleAnswer, runCommand]);

  // ── Prompt label ──────────────────────────────────────────────────────────
  const promptLabel =
    frozen && !booted ? 'BOOTING...' :
      !hasPassport ? 'ACCESS DENIED' :
        quizActive ? '[EVAL]$' :
          'root@xenova:~/archive$';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`xnv-shell${glitch ? ' xnv-glitch' : ''}`}
      onClick={() => !frozen && inputRef.current?.focus()}
    >
      {/* Vignette */}
      <div className="xnv-vignette" aria-hidden="true" />

      {/* Glitch overlay (only visible during glitch) */}
      {glitch && <div className="xnv-glitch-overlay" aria-hidden="true" />}

      {/* ── Header ── */}
      <div className="xnv-header">
        <div>
          <div className="xnv-title">C.O.R.E. TERMINAL</div>
          <div className="xnv-subtitle">
            ACCESS LEVEL: {hasPassport ? rank : 'UNAUTHORISED'}
          </div>
        </div>
        <div className="xnv-header-right">
          CONNECTION: <strong>SECURE</strong>
          <br />
          <span className="xnv-rec">■ REC</span>
        </div>
      </div>

      {/* ── ASCII logo ── */}
      <div className="xnv-logo" aria-hidden="true">{ASCII_LOGO}</div>

      {/* ── Output area (scrolls internally) ── */}
      <div className="xnv-output" ref={outputRef}>
        {lines.map(line => (
          <div key={line.id} className={`xnv-line ${line.cls}`}>
            {line.text || '\u00A0'}
          </div>
        ))}
        {generating && (
          <div className="xnv-spinner">Working... _</div>
        )}
      </div>

      {/* ── Input row ── */}
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
        />
        {!frozen && <div className="xnv-cursor" aria-hidden="true" />}
      </form>
    </div>
  );
}