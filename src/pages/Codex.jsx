import { useState, useEffect, useRef, useCallback } from "react";
import NavBar from "../components/NavBar";

// ─────────────────────────────────────────────────────────────────────────────
// GLYPH SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const GLYPH_MAP = {
    A: "⌖", B: "⏁", C: "⌬", D: "⏃", E: "⌘", F: "⏄", G: "⌗",
    H: "⏅", I: "⌙", J: "⏆", K: "⌚", L: "⏇", M: "⌛", N: "⏈",
    O: "⌜", P: "⏉", Q: "⌝", R: "⏊", S: "⌞", T: "⏋", U: "⌟",
    V: "⏌", W: "⌠", X: "⏍", Y: "⌡", Z: "⏎",
    " ": " ", ".": " ·", ",": " ⸴", "'": " ʼ", "-": "—", ":": " ∷",
};
const REVERSE_MAP = Object.fromEntries(Object.entries(GLYPH_MAP).map(([k, v]) => [v.trim(), k]));
const SCRAMBLE_CHARS = "⌖⏁⌬⏃⌘⏄⌗⏅⌙⏆⌚⏇⌛⏈⌜⏉⌝⏊⌞⏋⌟⏌⌠⏍⌡⏎∷⸴ʼ·⌘⌗⌝";

function encodeToGlyphs(text) {
    return text.toUpperCase().split("").map(c => GLYPH_MAP[c] || c).join("");
}
function decodeFromGlyphs(text) {
    return text.split("").map(c => REVERSE_MAP[c] || c).join("");
}
function randScramble(len) {
    return Array.from({ length: len }, () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// CODEX DATA
// ─────────────────────────────────────────────────────────────────────────────
const ERA_META = {
    Rise: { color: "#00FFD1", label: "RISE ERA", icon: "◈" },
    Peak: { color: "#FFB347", label: "PEAK ERA", icon: "◉" },
    Unraveling: { color: "#FF3A3A", label: "UNRAVELING ERA", icon: "◌" },
};

const CODEX_ENTRIES = [
    {
        id: "CE-001", title: "SEED LATTICE", era: "Rise",
        classification: "GENESIS INSTRUMENT",
        corrupted: "⌖⏈⌘⌙⌘⏈⏋ ⌞⌙⌗⏈⌖⏋⏁⏊⌘",
        decoded: "ANCIENT SIGNATURE",
        transmission: "⌖⏋ ⏋⏅⌘ ⌙⏈⌘⌞⌛⌙⏊ ⌜⏍ ⏋⏅⌘ ⌗⌘⏈⌘⌞⌙⌞ ⌘⏈⌗⌙⏈⌘·",
        translatedText: "AT THE MEMORY OF THE GENESIS ENGINE.",
        lore: "The Seed Lattice was the first instrument of planetary seeding — a crystalline matrix capable of encoding an entire biosphere into a single strand of synthetic DNA. Each lattice was hand-tuned by a Genesis Weaver over 40 years of harmonic calibration. 200 worlds were seeded from this single device.",
        status: "PARTIAL DECODE",
        coordinates: "KETHARA-VII · SECTOR 14 · DEPTH 7.2km",
        recoveredBy: "EXPEDITION 12 · CYCLE 4401",
    },
    {
        id: "CE-002", title: "CODEX FRAGMENT OMEGA", era: "Peak",
        classification: "FORBIDDEN ARCHIVE",
        corrupted: "⌜⏌⌘⏊⏊⌙⌗⏅ ⏋⏅⌘ ⌞⌘⌘⌘⌘",
        decoded: "OVERRIDE THE SEEDS",
        transmission: "⏋⏅⌘ ⌜⏌⌘⏊⏊⌙⌗⏅ ⌖⏄⌜⌟⏋ ⌛⌘⏋⏅⌖⏊⌖⏎·",
        translatedText: "THE OVERRIDE ABOUT METHARA.",
        lore: "The final codex entry written before the Strain Omega event. Scholars believe it contained a self-destruct protocol for all Seed Lattices — a kill switch never activated. The fragment was deliberately corrupted by someone within the High Council. By whom, and why, remains unknown.",
        status: "HEAVILY CORRUPTED",
        coordinates: "HIGH COUNCIL VAULT · KETHARA PRIME",
        recoveredBy: "OPERATIVE CLASSIFICATION: SEALED",
    },
    {
        id: "CE-003", title: "STRAIN OMEGA CORE", era: "Unraveling",
        classification: "OMEGA THREAT — CLASS EXTINCTION",
        corrupted: "⌙⏋ ⏊⌘⌖⌞⌜⏈⌞ ⏄⏊⌜⏌ ⏋⏅⌘ ⌙⏈⌞⌙⌞⌘",
        decoded: "IT REASONS FROM THE INSIDE",
        transmission: "⏋⏅⌘ ⌞⏋⏊⌖⌙⏈ ⌘⌖⏋⌘⌞ ⌙⏋⌞⌘⏎⏄·",
        translatedText: "THE STRAIN EATS ITSELF.",
        lore: "Strain Omega was not a weapon. It was a solution. Someone — or something — had studied Xenovan biology for millennia and designed a cascade that used their own genetic mastery against them. Every enhancement became a vector. Every improvement became a door. The cure was always one generation behind.",
        status: "ACTIVE SIGNAL DETECTED",
        coordinates: "QUARANTINE ZONE · SECTOR OMEGA",
        recoveredBy: "AUTOMATED DEEP-SCAN · CYCLE 4389",
    },
    {
        id: "CE-004", title: "VEX'AL LIGHT PRISM", era: "Peak",
        classification: "RESONANCE TOOL",
        corrupted: "⏎⌘⏏⌖⏎ ⌖⏄⌙⏈⏋⌞ ⏋⏅⌘ ⏁⌙⏈⌖⏊",
        decoded: "XENOVA PAINTS THE BINARY",
        transmission: "⏋⏅⌘ ⏎⌘⏏⌖⏎ ⌞⌘⌘⌞ ⌖⏈ ⏋⏅⌙⏈⌗⌞·",
        translatedText: "THE XENOVA SEES IN THINGS.",
        lore: "The Vex'al Prism allowed its wielder to perceive the harmonic frequency of any living system. A Xenovan physician could diagnose a planet's biosphere from orbit. In the wrong hands, it could also identify a world's biological weakness — the precise frequency at which life would unravel.",
        status: "RESONATING",
        coordinates: "MUSEUM OF PEAK SCIENCE · KETHARA-III",
        recoveredBy: "CULTURAL PRESERVATION UNIT · CYCLE 4210",
    },
    {
        id: "CE-005", title: "BIO-SYNTHETIC HEART", era: "Peak",
        classification: "LIFE SUSTAINER",
        corrupted: "⌙⏋ ⏅⌘⌖⏊⌞ ⏄⌜⏊ ⌘⏌⌘⏊",
        decoded: "IT HEARS FOR EVERY",
        transmission: "⌜⏈⌘ ⏅⌘⌖⏊⏋ ⏄⌜⏊ ⌖⏎⏎·",
        translatedText: "ONE HEART FOR ALL.",
        lore: "The pinnacle of Xenovan bio-engineering. A single synthetic heart could sustain an entire colony ship's life support for 10,000 years without degradation. It was grown, not built — seeded from the genetic code of Kethara-VII's primary lifeform and tuned to resonate with the heartbeat of its host world.",
        status: "PULSE ACTIVE",
        coordinates: "LIFE SCIENCES WING · ARCHIVE LEVEL 3",
        recoveredBy: "DEEP EXCAVATION TEAM · CYCLE 4398",
    },
    {
        id: "CE-006", title: "CASCADE EMITTER", era: "Unraveling",
        classification: "EXTINCTION VECTOR",
        corrupted: "⌙⏋ ⌞⌘⏈⌙⌘⌞ ⏁⌘⏄⌜⏊⌘ ⌙⏋ ⌞⌖⌟⌞",
        decoded: "IT DENIES BEFORE IT SAYS",
        transmission: "⏋⏅⌘ ⌘⏌⌙⏋⏋⌘⏊ ⏄⌜⏊⌗⌘⏋⌞ ⏁⌙⌜⏎⌜⌗·",
        translatedText: "THE EMITTER FORGETS BIOLOGY.",
        lore: "Recovered from the ruins of Kethara-VII's third moon. The Cascade Emitter was theorized to be a defensive weapon. Instead, in its final activation, it amplified the Strain Omega signal across 14 star systems simultaneously. Whether this was sabotage or malfunction remains the central question of Xenovan archaeology.",
        status: "DORMANT — DO NOT ACTIVATE",
        coordinates: "THIRD MOON · KETHARA SYSTEM · DEBRIS FIELD",
        recoveredBy: "HAZMAT UNIT 7 · CYCLE 4401",
    },
    {
        id: "CE-007", title: "GENESIS ENGINE", era: "Rise",
        classification: "PRIME INSTRUMENT",
        corrupted: "⏋⏅⌘ ⏄⌙⏊⌞⏋ ⏋⏅⌜⏁⌗⏅⏋",
        decoded: "THE FIRST THOUGHT",
        transmission: "⌗⌘⏈⌘⌞⌙⌞ ⌘⏈⌗⌙⏈⌘ ⌞⌘⌘⌘⌞ ⏎⌙⏄⌘·",
        translatedText: "GENESIS ENGINE SEEDS LIFE.",
        lore: "Before the Seed Lattice, before the Codex, before anything — there was the Genesis Engine. Built by the first generation of Xenovan scientists who looked at a barren universe and decided it should not remain so. All 200 seeded worlds trace their origins to this single, improbable machine.",
        status: "ORIGIN LOCKED",
        coordinates: "ORIGIN VAULT · KETHARA PRIME · SEALED",
        recoveredBy: "FIRST EXPEDITION · CYCLE 1",
    },
    {
        id: "CE-008", title: "THE LAST BREATH", era: "Unraveling",
        classification: "FINAL RECORD",
        corrupted: "⏋⏅⌘⏊⌘ ⌙⌞ ⌞⏋⌙⏎⏎ ⌞⌙⏎⌘⏈⌄⌘",
        decoded: "THERE IS STILL SILENCE",
        transmission: "⏋⏅⌘ ⏎⌖⌞⏋ ⌞⌄⌙⌘⏈⏋⌙⌞⏋ ⌞⌖⌙⌘·",
        translatedText: "THE LAST SCIENTIST SAID.",
        lore: "A single data crystal recovered from the ruins of Kethara-VII. It contains 40 seconds of audio — a Xenovan scientist speaking directly into the record. The transmission cuts out mid-sentence. No Xenovan voice has been heard since. Linguists have spent 200 years decoding those 40 seconds. They disagree on one word.",
        status: "FINAL RECORD",
        coordinates: "RUINS · KETHARA-VII · SURFACE LEVEL",
        recoveredBy: "MEMORIAL EXCAVATION · CYCLE 4400",
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function ParticleCanvas() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);

        const glyphs = Object.values(GLYPH_MAP).filter(g => g.trim());
        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.4 + 0.5,
            speed: Math.random() * 0.25 + 0.05,
            opacity: Math.random() * 0.3 + 0.05,
            glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
            drift: (Math.random() - 0.5) * 0.2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.font = `${p.size * 11}px monospace`;
                ctx.fillStyle = `rgba(0,255,209,${p.opacity})`;
                ctx.fillText(p.glyph, p.x, p.y);
                p.y += p.speed;
                p.x += p.drift;
                if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
                if (p.x < -20 || p.x > canvas.width + 20) p.x = Math.random() * canvas.width;
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
    }, []);
    return (
        <canvas ref={canvasRef} style={{
            position: "fixed", inset: 0, zIndex: 0, opacity: 0.18, pointerEvents: "none",
        }} />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCANLINE OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function ScanlineOverlay() {
    const [pos, setPos] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setPos(p => (p + 0.4) % 100), 16);
        return () => clearInterval(id);
    }, []);
    return (
        <>
            <div style={{
                position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
                backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,209,0.012) 2px,rgba(0,255,209,0.012) 4px)",
            }} />
            <div style={{
                position: "fixed", left: 0, right: 0, zIndex: 2, pointerEvents: "none",
                top: `${pos}vh`, height: 3,
                background: "linear-gradient(90deg,transparent,rgba(0,255,209,0.1),rgba(0,255,209,0.06),transparent)",
                transition: "top 0.016s linear",
            }} />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRAMBLE + DECODE HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useScrambleDecode(target, active, delay = 0) {
    const [display, setDisplay] = useState(randScramble(target.length));
    const [done, setDone] = useState(false);
    const frameRef = useRef(null);

    useEffect(() => {
        if (!active) { setDisplay(randScramble(target.length)); setDone(false); return; }
        let idx = 0;
        let elapsed = 0;
        const scramblePhase = 600 + delay;

        const tick = () => {
            elapsed += 40;
            if (elapsed < scramblePhase) {
                setDisplay(randScramble(target.length));
                frameRef.current = setTimeout(tick, 40);
            } else {
                if (idx < target.length) {
                    const revealed = target.slice(0, idx + 1);
                    const rest = randScramble(target.length - idx - 1);
                    setDisplay(revealed + rest);
                    idx++;
                    frameRef.current = setTimeout(tick, 38);
                } else {
                    setDisplay(target);
                    setDone(true);
                }
            }
        };
        frameRef.current = setTimeout(tick, 40);
        return () => clearTimeout(frameRef.current);
    }, [target, active, delay]);

    return { display, done };
}

// ─────────────────────────────────────────────────────────────────────────────
// WAVEFORM VISUALIZER (purely aesthetic)
// ─────────────────────────────────────────────────────────────────────────────
function WaveformViz({ color, active }) {
    const canvasRef = useRef(null);
    const phaseRef = useRef(0);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;
        const W = canvas.width = canvas.offsetWidth;
        const H = canvas.height = 48;

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            phaseRef.current += active ? 0.06 : 0.008;
            const ph = phaseRef.current;
            ctx.beginPath();
            for (let x = 0; x < W; x++) {
                const t = x / W;
                const amplitude = active ? (H * 0.32) : (H * 0.06);
                const y = H / 2
                    + Math.sin(t * Math.PI * 8 + ph) * amplitude * 0.6
                    + Math.sin(t * Math.PI * 14 + ph * 1.3) * amplitude * 0.3
                    + Math.sin(t * Math.PI * 3 + ph * 0.7) * amplitude * 0.1;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = color;
            ctx.shadowBlur = active ? 8 : 2;
            ctx.globalAlpha = active ? 0.8 : 0.3;
            ctx.stroke();

            // mirror
            ctx.beginPath();
            for (let x = 0; x < W; x++) {
                const t = x / W;
                const amplitude = active ? (H * 0.18) : (H * 0.04);
                const y = H / 2
                    + Math.sin(t * Math.PI * 6 + ph * 1.1 + 1) * amplitude * 0.5
                    + Math.sin(t * Math.PI * 11 + ph * 0.9) * amplitude * 0.5;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = active ? 0.4 : 0.12;
            ctx.stroke();
            ctx.globalAlpha = 1;

            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    }, [color, active]);

    return <canvas ref={canvasRef} style={{ width: "100%", height: 48, display: "block" }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CODEX CARD
// ─────────────────────────────────────────────────────────────────────────────
function CodexCard({ entry, isActive, isDecoded, onSelect, onDecoded }) {
    const [decoding, setDecoding] = useState(false);
    const [hovered, setHovered] = useState(false);
    const era = ERA_META[entry.era];

    const { display: titleDisplay, done: titleDone } = useScrambleDecode(entry.title, decoding, 0);
    const { display: subDisplay, done: subDone } = useScrambleDecode(entry.translatedText, decoding && titleDone, 200);

    useEffect(() => { if (subDone) onDecoded(entry.id); }, [subDone]);

    const handleDecode = (e) => {
        e.stopPropagation();
        if (!decoding && !isDecoded) setDecoding(true);
    };

    return (
        <div
            onClick={() => onSelect(entry)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative", cursor: "pointer",
                border: `1px solid ${isActive ? era.color : hovered ? era.color + "60" : "rgba(0,255,209,0.1)"}`,
                background: isActive ? `${era.color}08` : hovered ? `${era.color}04` : "rgba(5,8,16,0.85)",
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                overflow: "hidden",
                transform: hovered && !isActive ? "translateY(-3px)" : "none",
                boxShadow: isActive ? `0 0 30px ${era.color}15, inset 0 0 30px ${era.color}05` : "none",
            }}
        >
            {/* top glow bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg,transparent,${era.color},transparent)`,
                opacity: isActive ? 1 : hovered ? 0.5 : 0.15,
                transition: "opacity 0.35s",
            }} />

            {/* corner marks */}
            {[["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([v, h], i) => (
                <div key={i} style={{
                    position: "absolute", [v]: 6, [h]: 6,
                    width: 6, height: 6,
                    borderTop: v === "top" ? `1px solid ${era.color}60` : "none",
                    borderBottom: v === "bottom" ? `1px solid ${era.color}60` : "none",
                    borderLeft: h === "left" ? `1px solid ${era.color}60` : "none",
                    borderRight: h === "right" ? `1px solid ${era.color}60` : "none",
                    opacity: hovered || isActive ? 1 : 0.3,
                    transition: "opacity 0.3s",
                }} />
            ))}

            <div style={{ padding: "22px 20px 18px" }}>
                {/* top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{
                        fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: 3,
                        color: era.color, opacity: 0.85,
                    }}>{entry.id} · {era.label}</span>
                    <div style={{
                        fontSize: 9, letterSpacing: 2, padding: "2px 8px",
                        border: `1px solid ${era.color}35`, color: era.color,
                        fontFamily: "monospace", background: `${era.color}10`,
                        whiteSpace: "nowrap",
                    }}>{entry.status}</div>
                </div>

                {/* glyph strip */}
                <div style={{
                    fontFamily: "monospace", fontSize: 10, color: `${era.color}50`,
                    letterSpacing: 3, marginBottom: 10, overflow: "hidden",
                    whiteSpace: "nowrap", textOverflow: "ellipsis",
                    height: isDecoded ? 0 : "auto",
                    transition: "height 0.4s",
                    opacity: isDecoded ? 0 : 1,
                }}>
                    {entry.corrupted.slice(0, 24)}…
                </div>

                {/* main title */}
                <div style={{
                    fontFamily: "'Courier New',monospace", fontSize: 20, fontWeight: 300,
                    color: era.color, letterSpacing: 2, marginBottom: 8, lineHeight: 1.2,
                    textShadow: (isDecoded || isActive) ? `0 0 20px ${era.color}50` : "none",
                    transition: "text-shadow 0.5s",
                    minHeight: 28,
                }}>
                    {isDecoded ? entry.title : (decoding ? titleDisplay : entry.corrupted.slice(0, 16) + "…")}
                </div>

                {/* sub text */}
                <div style={{
                    fontFamily: "monospace", fontSize: 11, letterSpacing: 1,
                    color: "#7AAFC4", marginBottom: 16, minHeight: 18, lineHeight: 1.6,
                }}>
                    {isDecoded
                        ? entry.translatedText
                        : decoding && titleDone
                            ? subDisplay
                            : entry.corrupted.slice(0, 28)}
                </div>

                {/* classification */}
                <div style={{
                    fontFamily: "monospace", fontSize: 9, letterSpacing: 3,
                    color: `${era.color}60`, marginBottom: 14,
                }}>
                    {entry.classification}
                </div>

                {/* decode button */}
                <button
                    onClick={handleDecode}
                    disabled={isDecoded || decoding}
                    style={{
                        fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: 3,
                        padding: "7px 18px", background: "transparent",
                        border: `1px solid ${isDecoded ? "#39FF14" : era.color}`,
                        color: isDecoded ? "#39FF14" : era.color,
                        cursor: isDecoded || decoding ? "default" : "pointer",
                        transition: "all 0.25s",
                        position: "relative", overflow: "hidden",
                    }}
                >
                    {isDecoded ? `${era.icon} DECODED` : decoding ? "DECODING…" : "⬡ INITIATE DECODE"}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL (slide-in from right)
// ─────────────────────────────────────────────────────────────────────────────
function DetailPanel({ entry, isDecoded, onClose }) {
    const [open, setOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const [encodedOutput, setEncodedOutput] = useState("");
    const [glyphInput, setGlyphInput] = useState("");
    const [decodedOutput, setDecodedOutput] = useState("");
    const [activeTab, setActiveTab] = useState("lore");

    useEffect(() => {
        if (entry) { setTimeout(() => setOpen(true), 10); }
        else { setOpen(false); }
    }, [entry]);

    if (!entry && !open) return null;
    const era = ERA_META[entry?.era] || ERA_META.Rise;

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            display: "flex", alignItems: "stretch",
            pointerEvents: open ? "auto" : "none",
        }}>
            {/* backdrop */}
            <div onClick={onClose} style={{
                flex: 1, background: "rgba(5,8,16,0.75)",
                backdropFilter: open ? "blur(4px)" : "none",
                opacity: open ? 1 : 0,
                transition: "opacity 0.45s, backdrop-filter 0.45s",
                cursor: "pointer",
            }} />

            {/* panel */}
            <div style={{
                width: "min(580px,94vw)",
                background: "#060b15",
                borderLeft: `1px solid ${era.color}30`,
                transform: open ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
                overflowY: "auto",
                display: "flex", flexDirection: "column",
                boxShadow: open ? `-20px 0 80px rgba(0,0,0,0.8), -1px 0 0 ${era.color}15` : "none",
                scrollbarWidth: "none",
            }}>
                {entry && (
                    <>
                        {/* sticky header */}
                        <div style={{
                            padding: "24px 28px 0",
                            borderBottom: `1px solid ${era.color}18`,
                            position: "sticky", top: 0, background: "#060b15", zIndex: 10,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontFamily: "monospace", fontSize: 9, color: era.color, letterSpacing: 4, marginBottom: 6 }}>
                                        {entry.id} · {entry.classification}
                                    </div>
                                    <div style={{
                                        fontFamily: "'Courier New',monospace", fontSize: 22, fontWeight: 300,
                                        color: era.color, letterSpacing: 3,
                                        textShadow: `0 0 24px ${era.color}40`,
                                    }}>
                                        {entry.title}
                                    </div>
                                </div>
                                <button onClick={onClose} style={{
                                    background: "none", border: `1px solid ${era.color}30`,
                                    color: "#7AAFC4", cursor: "pointer", fontSize: 14,
                                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, marginTop: 4, transition: "all 0.2s",
                                }}>✕</button>
                            </div>

                            {/* waveform */}
                            <div style={{ margin: "0 -28px", borderTop: `1px solid ${era.color}10` }}>
                                <WaveformViz color={era.color} active={isDecoded} />
                            </div>

                            {/* meta row */}
                            <div style={{
                                display: "flex", gap: 16, padding: "12px 0",
                                flexWrap: "wrap",
                            }}>
                                {[
                                    { label: "ERA", val: entry.era.toUpperCase() },
                                    { label: "STATUS", val: entry.status },
                                    { label: "RECOVERED", val: entry.recoveredBy },
                                ].map((m, i) => (
                                    <div key={i} style={{ minWidth: 100 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 8, color: `${era.color}60`, letterSpacing: 3, marginBottom: 3 }}>{m.label}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#E8F4F8", letterSpacing: 1 }}>{m.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* tabs */}
                            <div style={{ display: "flex", gap: 0, marginTop: 4 }}>
                                {[["lore", "ARCHIVE LORE"], ["transmission", "TRANSMISSION"], ["cipher", "CIPHER TOOL"]].map(([t, l]) => (
                                    <button key={t} onClick={() => setActiveTab(t)} style={{
                                        flex: 1, padding: "9px 4px",
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: `2px solid ${activeTab === t ? era.color : "transparent"}`,
                                        color: activeTab === t ? era.color : "#7AAFC460",
                                        fontFamily: "monospace", fontSize: 9, letterSpacing: 2,
                                        cursor: "pointer", transition: "all 0.2s",
                                    }}>{l}</button>
                                ))}
                            </div>
                        </div>

                        {/* tab content */}
                        <div style={{ padding: "24px 28px", flex: 1 }}>

                            {activeTab === "lore" && (
                                <>
                                    <div style={{
                                        padding: "14px 16px", marginBottom: 20,
                                        border: `1px solid ${era.color}18`, background: `${era.color}04`,
                                    }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 8, color: `${era.color}80`, letterSpacing: 4, marginBottom: 8 }}>COORDINATES</div>
                                        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#7AAFC4", letterSpacing: 1 }}>{entry.coordinates}</div>
                                    </div>
                                    <p style={{
                                        fontFamily: "Georgia,serif", fontSize: 14, color: "#E8F4F8cc",
                                        lineHeight: 1.95, margin: 0,
                                    }}>{entry.lore}</p>
                                </>
                            )}

                            {activeTab === "transmission" && (
                                <>
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 8, color: `${era.color}80`, letterSpacing: 4, marginBottom: 10 }}>ORIGINAL TRANSMISSION</div>
                                        <div style={{
                                            fontFamily: "monospace", fontSize: 15,
                                            color: era.color, lineHeight: 2, padding: "16px",
                                            border: `1px solid ${era.color}20`,
                                            background: `${era.color}06`,
                                            letterSpacing: 3, wordBreak: "break-all",
                                            textShadow: `0 0 10px ${era.color}30`,
                                        }}>{entry.transmission}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: 8, color: `${era.color}80`, letterSpacing: 4, marginBottom: 10 }}>DECODED TEXT</div>
                                        <div style={{
                                            fontFamily: "'Courier New',monospace", fontSize: 13,
                                            color: "#E8F4F8", padding: "12px 16px",
                                            borderLeft: `2px solid ${era.color}50`,
                                            background: "rgba(255,255,255,0.02)",
                                            letterSpacing: 2, lineHeight: 1.8,
                                        }}>→ {entry.translatedText}</div>
                                    </div>
                                    <div style={{ marginTop: 20 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 8, color: `${era.color}80`, letterSpacing: 4, marginBottom: 10 }}>CORRUPTED FRAGMENT</div>
                                        <div style={{
                                            fontFamily: "monospace", fontSize: 13,
                                            color: `${era.color}60`, padding: "12px 16px",
                                            border: `1px dashed ${era.color}20`,
                                            letterSpacing: 2, wordBreak: "break-all",
                                        }}>{entry.corrupted}</div>
                                    </div>
                                </>
                            )}

                            {activeTab === "cipher" && (
                                <>
                                    {/* encode */}
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 8, color: `${era.color}80`, letterSpacing: 4, marginBottom: 10 }}>ENCODE TEXT → XENOVAN</div>
                                        <input
                                            value={inputText}
                                            onChange={e => setInputText(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && setEncodedOutput(encodeToGlyphs(inputText))}
                                            placeholder="TYPE ENGLISH TEXT…"
                                            style={{
                                                width: "100%", padding: "10px 14px",
                                                background: "#080e1a", border: `1px solid ${era.color}25`,
                                                color: "#E8F4F8", fontFamily: "monospace", fontSize: 13,
                                                outline: "none", boxSizing: "border-box", letterSpacing: 2,
                                                marginBottom: 8,
                                            }}
                                        />
                                        <button onClick={() => setEncodedOutput(encodeToGlyphs(inputText))} style={{
                                            padding: "7px 20px", background: "transparent",
                                            border: `1px solid ${era.color}`, color: era.color,
                                            fontFamily: "monospace", fontSize: 10, letterSpacing: 3, cursor: "pointer",
                                        }}>ENCODE →</button>
                                        {encodedOutput && (
                                            <div style={{
                                                marginTop: 12, padding: "12px 16px",
                                                background: `${era.color}08`, border: `1px solid ${era.color}25`,
                                                fontFamily: "monospace", fontSize: 16, color: era.color,
                                                letterSpacing: 4, wordBreak: "break-all", lineHeight: 1.9,
                                                textShadow: `0 0 8px ${era.color}40`,
                                            }}>{encodedOutput}</div>
                                        )}
                                    </div>

                                    {/* decode */}
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: 8, color: "#FF3A3A80", letterSpacing: 4, marginBottom: 10 }}>DECODE GLYPHS → ENGLISH</div>
                                        <input
                                            value={glyphInput}
                                            onChange={e => setGlyphInput(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && setDecodedOutput(decodeFromGlyphs(glyphInput))}
                                            placeholder="PASTE XENOVAN GLYPHS…"
                                            style={{
                                                width: "100%", padding: "10px 14px",
                                                background: "#080e1a", border: "1px solid #FF3A3A25",
                                                color: "#E8F4F8", fontFamily: "monospace", fontSize: 13,
                                                outline: "none", boxSizing: "border-box", letterSpacing: 3,
                                                marginBottom: 8,
                                            }}
                                        />
                                        <button onClick={() => setDecodedOutput(decodeFromGlyphs(glyphInput))} style={{
                                            padding: "7px 20px", background: "transparent",
                                            border: "1px solid #FF3A3A", color: "#FF3A3A",
                                            fontFamily: "monospace", fontSize: 10, letterSpacing: 3, cursor: "pointer",
                                        }}>DECODE →</button>
                                        {decodedOutput && (
                                            <div style={{
                                                marginTop: 12, padding: "12px 16px",
                                                background: "#FF3A3A08", border: "1px solid #FF3A3A25",
                                                fontFamily: "monospace", fontSize: 13, color: "#E8F4F8",
                                                letterSpacing: 2, lineHeight: 1.8,
                                            }}>{decodedOutput}</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLYPH TABLE
// ─────────────────────────────────────────────────────────────────────────────
function GlyphTable({ visible }) {
    return (
        <div style={{
            maxHeight: visible ? 400 : 0,
            overflow: "hidden",
            transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1)",
            marginBottom: visible ? 32 : 0,
        }}>
            <div style={{
                padding: "20px 24px",
                border: "1px solid rgba(0,255,209,0.12)",
                background: "rgba(0,255,209,0.025)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(52px,1fr))",
                gap: 5,
            }}>
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => (
                    <div key={l} style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        padding: "7px 4px", border: "1px solid rgba(0,255,209,0.08)",
                        transition: "all 0.2s", cursor: "default",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,209,0.4)"; e.currentTarget.style.background = "rgba(0,255,209,0.06)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,255,209,0.08)"; e.currentTarget.style.background = "transparent"; }}
                    >
                        <span style={{ fontFamily: "monospace", fontSize: 17, color: "#00FFD1", textShadow: "0 0 8px rgba(0,255,209,0.4)" }}>{GLYPH_MAP[l]}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", marginTop: 4, letterSpacing: 1 }}>{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSPORT / PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
function PassportBadge({ decodedIds }) {
    const total = CODEX_ENTRIES.length;
    const pct = Math.round((decodedIds.size / total) * 100);
    return (
        <div style={{
            padding: "14px 20px",
            border: "1px solid rgba(0,255,209,0.12)",
            background: "rgba(0,255,209,0.025)",
            display: "flex", alignItems: "center", gap: 20, marginBottom: 32,
            flexWrap: "wrap",
        }}>
            <div>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: "#7AAFC4", letterSpacing: 4, marginBottom: 4 }}>VISITOR PASSPORT</div>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: 20, color: "#00FFD1", letterSpacing: 2 }}>
                    {decodedIds.size}<span style={{ fontSize: 12, color: "#7AAFC4" }}>/{total}</span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC460", letterSpacing: 2 }}>ENTRIES DECODED</div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{
                    height: 3, background: "rgba(0,255,209,0.08)",
                    borderRadius: 2, overflow: "hidden", marginBottom: 6,
                }}>
                    <div style={{
                        height: "100%", width: `${pct}%`,
                        background: "linear-gradient(90deg,#00FFD1,#39FF14)",
                        boxShadow: "0 0 8px rgba(0,255,209,0.6)",
                        transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                    }} />
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC460", letterSpacing: 2 }}>{pct}% ARCHIVE UNLOCKED</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
                {CODEX_ENTRIES.map(e => (
                    <div key={e.id} title={e.title} style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: decodedIds.has(e.id) ? ERA_META[e.era].color : "rgba(255,255,255,0.08)",
                        boxShadow: decodedIds.has(e.id) ? `0 0 6px ${ERA_META[e.era].color}` : "none",
                        transition: "all 0.4s",
                    }} />
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Codex() {
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [decodedIds, setDecodedIds] = useState(new Set());
    const [showGlyphs, setShowGlyphs] = useState(false);
    const [filterEra, setFilterEra] = useState("ALL");
    const [globalInput, setGlobalInput] = useState("");
    const [globalEncoded, setGlobalEncoded] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const handleDecoded = useCallback((id) => {
        setDecodedIds(prev => new Set([...prev, id]));
    }, []);

    const eras = ["ALL", "Rise", "Peak", "Unraveling"];
    const filtered = filterEra === "ALL" ? CODEX_ENTRIES : CODEX_ENTRIES.filter(e => e.era === filterEra);

    const eraButtonColor = (era) => {
        if (era === "Rise") return "#00FFD1";
        if (era === "Peak") return "#FFB347";
        if (era === "Unraveling") return "#FF3A3A";
        return "#7AAFC4";
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#050810",
            color: "#E8F4F8",
            fontFamily: "'Courier New',monospace",
            position: "relative",
        }}>
            <ParticleCanvas />
            <ScanlineOverlay />
            <NavBar />

            <div style={{
                position: "relative", zIndex: 3,
                maxWidth: 1140, margin: "0 auto",
                padding: "100px 28px 80px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(12px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}>

                {/* ── HEADER ── */}
                <div style={{ marginBottom: 44 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                        <a href="/archive" style={{
                            fontFamily: "monospace", fontSize: 9, color: "#7AAFC4",
                            textDecoration: "none", letterSpacing: 3,
                            padding: "4px 14px", border: "1px solid #7AAFC425",
                            transition: "all 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#7AAFC4"; e.currentTarget.style.color = "#E8F4F8"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#7AAFC425"; e.currentTarget.style.color = "#7AAFC4"; }}
                        >← ARCHIVE</a>
                        <span style={{ color: "#7AAFC430", fontSize: 10 }}>·</span>
                        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", letterSpacing: 3 }}>XENOVA LINGUISTIC ARCHIVE</span>
                    </div>

                    <h1 style={{
                        fontSize: "clamp(34px,6.5vw,68px)", fontWeight: 200,
                        letterSpacing: "0.14em", margin: 0, marginBottom: 10,
                        color: "#E8F4F8", lineHeight: 1.05,
                    }}>
                        CODEX <span style={{
                            color: "#00FFD1",
                            textShadow: "0 0 40px rgba(0,255,209,0.4), 0 0 80px rgba(0,255,209,0.15)",
                        }}>DECODER</span>
                    </h1>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 48, height: 1, background: "linear-gradient(90deg,#00FFD1,transparent)" }} />
                        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", letterSpacing: 4 }}>
                            KETHARA-VII RUINS · {CODEX_ENTRIES.length} TRANSMISSIONS RECOVERED
                        </span>
                    </div>

                    <p style={{
                        fontFamily: "monospace", fontSize: 12, color: "#7AAFC4",
                        letterSpacing: 1, maxWidth: 620, lineHeight: 1.9, margin: 0,
                    }}>
                        Recovered transmissions from the archive. Each entry is partially corrupted.
                        Initiate decode sequences to reconstruct original Xenovan text.
                        Select any entry to access cipher tools and archive notation.
                    </p>
                </div>

                {/* ── PASSPORT ── */}
                <PassportBadge decodedIds={decodedIds} />

                {/* ── GLOBAL CIPHER ── */}
                <div style={{
                    marginBottom: 32, padding: "20px 22px",
                    border: "1px solid rgba(0,255,209,0.15)",
                    background: "rgba(0,255,209,0.025)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 1,
                        background: "linear-gradient(90deg,transparent,#00FFD1,transparent)",
                        opacity: 0.4,
                    }} />
                    <div style={{ fontFamily: "monospace", fontSize: 8, color: "#00FFD1", letterSpacing: 4, marginBottom: 12 }}>
                        ⌖ UNIVERSAL XENOVAN CIPHER TERMINAL
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input
                            value={globalInput}
                            onChange={e => setGlobalInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && setGlobalEncoded(encodeToGlyphs(globalInput))}
                            placeholder="ENTER ANY TEXT TO ENCODE INTO XENOVAN SCRIPT…"
                            style={{
                                flex: 1, minWidth: 200, padding: "10px 14px",
                                background: "#080e1a", border: "1px solid rgba(0,255,209,0.2)",
                                color: "#E8F4F8", fontFamily: "monospace", fontSize: 13,
                                outline: "none", letterSpacing: 1,
                            }}
                        />
                        <button
                            onClick={() => setGlobalEncoded(encodeToGlyphs(globalInput))}
                            style={{
                                padding: "10px 22px", background: "transparent",
                                border: "1px solid #00FFD1", color: "#00FFD1",
                                fontFamily: "monospace", fontSize: 10, letterSpacing: 3, cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,209,0.1)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >ENCODE</button>
                        <button
                            onClick={() => setShowGlyphs(v => !v)}
                            style={{
                                padding: "10px 22px", background: "transparent",
                                border: "1px solid rgba(0,255,209,0.35)", color: "#7AAFC4",
                                fontFamily: "monospace", fontSize: 10, letterSpacing: 3, cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >{showGlyphs ? "HIDE" : "SHOW"} GLYPHS</button>
                    </div>
                    {globalEncoded && (
                        <div style={{
                            marginTop: 14, padding: "14px 18px",
                            background: "rgba(0,255,209,0.05)",
                            border: "1px solid rgba(0,255,209,0.2)",
                            fontFamily: "monospace", fontSize: 17, color: "#00FFD1",
                            letterSpacing: 4, wordBreak: "break-all", lineHeight: 1.9,
                            textShadow: "0 0 12px rgba(0,255,209,0.4)",
                        }}>{globalEncoded}</div>
                    )}
                </div>

                <GlyphTable visible={showGlyphs} />

                {/* ── ERA FILTER ── */}
                <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
                    {eras.map(era => {
                        const col = eraButtonColor(era);
                        const active = filterEra === era;
                        return (
                            <button key={era} onClick={() => setFilterEra(era)} style={{
                                padding: "7px 20px", background: active ? `${col}12` : "transparent",
                                border: `1px solid ${active ? col : "rgba(0,255,209,0.15)"}`,
                                color: active ? col : "#7AAFC4",
                                fontFamily: "monospace", fontSize: 9, letterSpacing: 3,
                                cursor: "pointer", transition: "all 0.25s",
                            }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = col + "60"; e.currentTarget.style.color = col; } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "rgba(0,255,209,0.15)"; e.currentTarget.style.color = "#7AAFC4"; } }}
                            >{era === "Unraveling" ? "◌ UNRAVELING" : era === "Rise" ? "◈ RISE" : era === "Peak" ? "◉ PEAK" : "◎ ALL"}</button>
                        );
                    })}
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC450", letterSpacing: 2, marginLeft: 4 }}>
                        {filtered.length} / {CODEX_ENTRIES.length} ENTRIES · {decodedIds.size} DECODED
                    </span>
                </div>

                {/* ── GRID ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))",
                    gap: 14,
                }}>
                    {filtered.map((entry, i) => (
                        <div key={entry.id} style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? "none" : "translateY(20px)",
                            transition: `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`,
                        }}>
                            <CodexCard
                                entry={entry}
                                isActive={selectedEntry?.id === entry.id}
                                isDecoded={decodedIds.has(entry.id)}
                                onSelect={setSelectedEntry}
                                onDecoded={handleDecoded}
                            />
                        </div>
                    ))}
                </div>

                {/* ── FOOTER ── */}
                <div style={{
                    marginTop: 64, paddingTop: 24,
                    borderTop: "1px solid rgba(0,255,209,0.08)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexWrap: "wrap", gap: 8,
                }}>
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC430", letterSpacing: 3 }}>
                        XENOVA ARCHIVE · CODEX DECODER v5.0
                    </span>
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC430", letterSpacing: 3 }}>
                        {CODEX_ENTRIES.length} TRANSMISSIONS · {CODEX_ENTRIES.filter(e => e.era === "Unraveling").length} OMEGA CLASS · {decodedIds.size} UNLOCKED
                    </span>
                </div>
            </div>

            <DetailPanel
                entry={selectedEntry}
                isDecoded={selectedEntry ? decodedIds.has(selectedEntry.id) : false}
                onClose={() => setSelectedEntry(null)}
            />
        </div>
    );
}