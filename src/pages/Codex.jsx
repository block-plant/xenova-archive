import { useState, useEffect, useRef, useCallback } from "react";

// ── Xenovan glyph map ──────────────────────────────────────────────
const GLYPH_MAP = {
    A: "⌖", B: "⏁", C: "⌬", D: "⏃", E: "⌘", F: "⏄", G: "⌗",
    H: "⏅", I: "⌙", J: "⏆", K: "⌚", L: "⏇", M: "⌛", N: "⏈",
    O: "⌜", P: "⏉", Q: "⌝", R: "⏊", S: "⌞", T: "⏋", U: "⌟",
    V: "⏌", W: "⌠", X: "⏍", Y: "⌡", Z: "⏎",
    " ": " ", ".": "·", ",": "⸴", "'": "ʼ", "-": "—", ":": "∷",
};
const REVERSE_MAP = Object.fromEntries(Object.entries(GLYPH_MAP).map(([k, v]) => [v, k]));

// ── Codex entries ──────────────────────────────────────────────────
const CODEX_ENTRIES = [
    {
        id: "CE-001",
        artifactId: "seed-lattice",
        title: "SEED LATTICE",
        era: "Rise",
        eraColor: "#00FFD1",
        classification: "GENESIS INSTRUMENT",
        corrupted: `⌖⏈⌘⌙⌘⏈⏋ ⌞⌙⌗⏈⌖⏋⏁⏊⌘`,
        decoded: "ANCIENT SIGNATURE",
        transmission: `⌖⏋ ⏋⏅⌘ ⌙⏈⌘⌞⌛⌙⏊ ⌜⏍ ⏋⏅⌘ ⌗⌘⏈⌘⌞⌙⌞ ⌘⏈⌗⌙⏈⌘·`,
        translatedText: "AT THE MEMORY OF THE GENESIS ENGINE.",
        lore: "The Seed Lattice was the first instrument of planetary seeding — a crystalline matrix capable of encoding an entire biosphere into a single strand of synthetic DNA. Each lattice was hand-tuned by a Genesis Weaver over 40 years of harmonic calibration. 200 worlds were seeded from this single device.",
        glyphColor: "#00FFD1",
        status: "PARTIAL DECODE",
    },
    {
        id: "CE-002",
        artifactId: "codex-fragment-omega",
        title: "CODEX FRAGMENT OMEGA",
        era: "Peak",
        eraColor: "#FFB347",
        classification: "FORBIDDEN ARCHIVE",
        corrupted: `⌜⏌⌘⏊⏊⌙⌗⏅ ⏋⏅⌘ ⌞⌘⌘⌘⌘`,
        decoded: "OVERRIDE THE SEEDS",
        transmission: `⏋⏅⌘ ⌜⏌⌘⏊⏊⌙⌗⏅ ⌖⏄⌜⌟⏋ ⌛⌘⏋⏅⌖⏊⌖⏎·`,
        translatedText: "THE OVERRIDE ABOUT METHARA.",
        lore: "The final codex entry written before the Strain Omega event. Scholars believe it contained a self-destruct protocol for all Seed Lattices — a kill switch never activated. The fragment was deliberately corrupted by someone within the High Council. By whom, and why, remains unknown.",
        glyphColor: "#FFB347",
        status: "HEAVILY CORRUPTED",
    },
    {
        id: "CE-003",
        artifactId: "strain-omega-core",
        title: "STRAIN OMEGA CORE",
        era: "Unraveling",
        eraColor: "#FF3A3A",
        classification: "OMEGA THREAT — CLASS EXTINCTION",
        corrupted: `⌙⏋ ⏊⌘⌖⌞⌜⏈⌞ ⏄⏊⌜⏌ ⏋⏅⌘ ⌙⏈⌞⌙⌞⌘`,
        decoded: "IT REASONS FROM THE INSIDE",
        transmission: `⏋⏅⌘ ⌞⏋⏊⌖⌙⏈ ⌘⌖⏋⌘⌞ ⌙⏋⌞⌘⏎⏄·`,
        translatedText: "THE STRAIN EATS ITSELF.",
        lore: "Strain Omega was not a weapon. It was a solution. Someone — or something — had studied Xenovan biology for millennia and designed a cascade that used their own genetic mastery against them. Every enhancement became a vector. Every improvement became a door. The cure was always one generation behind.",
        glyphColor: "#FF3A3A",
        status: "ACTIVE SIGNAL DETECTED",
    },
    {
        id: "CE-004",
        artifactId: "vexal-light-prism",
        title: "VEX'AL LIGHT PRISM",
        era: "Peak",
        eraColor: "#FFB347",
        classification: "RESONANCE TOOL",
        corrupted: `⏎⌘⏏⌖⏎ ⌖⏄⌙⏈⏋⌞ ⏋⏅⌘ ⏁⌙⏈⌖⏊⎫`,
        decoded: "XENOVA PAINTS THE BINARY",
        transmission: `⏋⏅⌘ ⏎⌘⏏⌖⏎ ⌞⌘⌘⌞ ⌖⏈ ⏋⏅⌙⏈⌗⌞·`,
        translatedText: "THE XENOVA SEES IN THINGS.",
        lore: "The Vex'al Prism allowed its wielder to perceive the harmonic frequency of any living system. A Xenovan physician could diagnose a planet's biosphere from orbit. In the wrong hands, it could also identify a world's biological weakness — the precise frequency at which life would unravel.",
        glyphColor: "#FFB347",
        status: "RESONATING",
    },
    {
        id: "CE-005",
        artifactId: "bio-synthetic-heart",
        title: "BIO-SYNTHETIC HEART",
        era: "Peak",
        eraColor: "#FFB347",
        classification: "LIFE SUSTAINER",
        corrupted: `⌙⏋ ⏅⌘⌖⏊⌞ ⏄⌜⏊ ⌘⏌⌘⏊⎫`,
        decoded: "IT HEARS FOR EVERY",
        transmission: `⌜⏈⌘ ⏅⌘⌖⏊⏋ ⌄⌜⏊ ⌖⏎⏎·`,
        translatedText: "ONE HEART FOR ALL.",
        lore: "The pinnacle of Xenovan bio-engineering. A single synthetic heart could sustain an entire colony ship's life support for 10,000 years without degradation. It was grown, not built — seeded from the genetic code of Kethara-VII's primary lifeform and tuned to resonate with the heartbeat of its host world.",
        glyphColor: "#FFB347",
        status: "PULSE ACTIVE",
    },
    {
        id: "CE-006",
        artifactId: "cascade-emitter",
        title: "CASCADE EMITTER",
        era: "Unraveling",
        eraColor: "#FF3A3A",
        classification: "EXTINCTION VECTOR",
        corrupted: `⌙⏋ ⌞⌘⏈⌙⌘⌞ ⏁⌘⏄⌜⏊⌘ ⌙⏋ ⌞⌖⌟⌞`,
        decoded: "IT DENIES BEFORE IT SAYS",
        transmission: `⏋⏅⌘ ⌘⏌⌙⏋⏋⌘⏊ ⌄⌜⏊⌗⌘⏋⌞ ⏁⌙⌜⏎⌜⌗⎫·`,
        translatedText: "THE EMITTER FORGETS BIOLOGY.",
        lore: "Recovered from the ruins of Kethara-VII's third moon. The Cascade Emitter was theorized to be a defensive weapon — designed to emit a biological dampening field. Instead, in its final activation, it amplified the Strain Omega signal across 14 star systems simultaneously. Whether this was sabotage or malfunction remains the central question of Xenovan archaeology.",
        glyphColor: "#FF3A3A",
        status: "DORMANT — DO NOT ACTIVATE",
    },
    {
        id: "CE-007",
        artifactId: "genesis-engine",
        title: "GENESIS ENGINE",
        era: "Rise",
        eraColor: "#00FFD1",
        classification: "PRIME INSTRUMENT",
        corrupted: `⏋⏅⌘ ⌄⌙⏊⌞⏋ ⏋⏅⌜⏁⌗⏅⏋`,
        decoded: "THE FIRST THOUGHT",
        transmission: `⌗⌘⏈⌘⌞⌙⌞ ⌘⏈⌗⌙⏈⌘ ⌞⌘⌘⌘⌞ ⏎⌙⏄⌘·`,
        translatedText: "GENESIS ENGINE SEEDS LIFE.",
        lore: "Before the Seed Lattice, before the Codex, before anything — there was the Genesis Engine. The original device. Built by the first generation of Xenovan scientists who looked at a barren universe and decided it should not remain so. All 200 seeded worlds trace their origins to this single, improbable machine.",
        glyphColor: "#00FFD1",
        status: "ORIGIN LOCKED",
    },
    {
        id: "CE-008",
        artifactId: "last-breath",
        title: "THE LAST BREATH",
        era: "Unraveling",
        eraColor: "#FF3A3A",
        classification: "FINAL RECORD",
        corrupted: `⏋⏅⌘⏊⌘ ⌙⌞ ⌞⏋⌙⏎⏎ ⌞⌙⏎⌘⏈⌄⌘`,
        decoded: "THERE IS STILL SILENCE",
        transmission: `⏋⏅⌘ ⏎⌖⌞⏋ ⏏⌘⏈⌜⏌⌖ ⌞⌄⌙⌘⏈⏋⌙⌞⏋ ⌞⌖⏎⌙⌘·`,
        translatedText: "THE LAST XENOVA SCIENTIST SAID.",
        lore: "A single data crystal recovered from the ruins of Kethara-VII. It contains 40 seconds of audio — a Xenovan scientist speaking directly into the record. The transmission cuts out mid-sentence. No Xenovan voice has been heard since. Linguists have spent 200 years decoding those 40 seconds. They disagree on one word.",
        glyphColor: "#FF3A3A",
        status: "FINAL RECORD",
    },
];

// ── Helper: encode text to glyphs ──────────────────────────────────
function encodeToGlyphs(text) {
    return text.toUpperCase().split("").map(c => GLYPH_MAP[c] || c).join("");
}

// ── Particle canvas for background ────────────────────────────────
function ParticleCanvas() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;
        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
            opacity: Math.random() * 0.5 + 0.1,
            glyph: Object.values(GLYPH_MAP)[Math.floor(Math.random() * 26)],
        }));

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.font = `${p.size * 10}px monospace`;
                ctx.fillStyle = `rgba(0,255,209,${p.opacity})`;
                ctx.fillText(p.glyph, p.x, p.y);
                p.y += p.speed;
                if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.15, pointerEvents: "none" }} />;
}

// ── Decoding animation hook ────────────────────────────────────────
function useDecoder(target, active, speed = 30) {
    const [display, setDisplay] = useState("".padEnd(target.length, "·"));
    const [done, setDone] = useState(false);
    useEffect(() => {
        if (!active) { setDisplay("".padEnd(target.length, "·")); setDone(false); return; }
        setDone(false);
        let idx = 0;
        const interval = setInterval(() => {
            if (idx >= target.length) { setDone(true); clearInterval(interval); return; }
            setDisplay(target.slice(0, idx + 1) + "".padEnd(target.length - idx - 1, "·"));
            idx++;
        }, speed);
        return () => clearInterval(interval);
    }, [target, active, speed]);
    return { display, done };
}

// ── Single Codex Entry Card ────────────────────────────────────────
function CodexCard({ entry, isActive, onSelect }) {
    const [decoding, setDecoding] = useState(false);
    const [fullyDecoded, setFullyDecoded] = useState(false);
    const { display: titleDisplay, done: titleDone } = useDecoder(entry.title, decoding, 45);
    const { display: transmissionDisplay, done: transDone } = useDecoder(entry.translatedText, decoding && titleDone, 28);

    const handleDecode = (e) => {
        e.stopPropagation();
        if (!decoding) { setDecoding(true); }
    };

    useEffect(() => {
        if (transDone) setFullyDecoded(true);
    }, [transDone]);

    return (
        <div
            onClick={() => onSelect(entry)}
            style={{
                border: `1px solid ${isActive ? entry.glyphColor : "rgba(0,255,209,0.15)"}`,
                background: isActive ? `${entry.glyphColor}08` : "rgba(5,8,16,0.8)",
                borderRadius: 4,
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.3s",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* scanline */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${entry.glyphColor}, transparent)`,
                opacity: isActive ? 0.8 : 0.2,
                transition: "opacity 0.3s",
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: entry.eraColor, letterSpacing: 3 }}>
                    {entry.id} · {entry.era.toUpperCase()}
                </span>
                <span style={{
                    fontSize: 9, letterSpacing: 2, padding: "2px 8px",
                    border: `1px solid ${entry.glyphColor}40`,
                    color: entry.glyphColor, fontFamily: "monospace",
                    background: `${entry.glyphColor}10`,
                }}>
                    {entry.status}
                </span>
            </div>

            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 18, color: entry.glyphColor, marginBottom: 6, letterSpacing: 2 }}>
                {fullyDecoded ? entry.title : (decoding ? titleDisplay : entry.corrupted.slice(0, 16) + "…")}
            </div>

            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#7AAFC4", marginBottom: 14, minHeight: 20 }}>
                {fullyDecoded ? entry.translatedText : (decoding && titleDone ? transmissionDisplay : entry.corrupted)}
            </div>

            <button
                onClick={handleDecode}
                disabled={fullyDecoded}
                style={{
                    fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 3,
                    padding: "6px 16px", background: "transparent",
                    border: `1px solid ${fullyDecoded ? "#39FF14" : entry.glyphColor}`,
                    color: fullyDecoded ? "#39FF14" : entry.glyphColor,
                    cursor: fullyDecoded ? "default" : "pointer",
                    transition: "all 0.2s",
                }}
            >
                {fullyDecoded ? "✓ DECODED" : decoding ? "DECODING…" : "INITIATE DECODE"}
            </button>
        </div>
    );
}

// ── Detail Panel ───────────────────────────────────────────────────
function DetailPanel({ entry, onClose }) {
    const [phase, setPhase] = useState(0); // 0=closed 1=opening 2=open
    const [inputText, setInputText] = useState("");
    const [encodedOutput, setEncodedOutput] = useState("");
    const [glyphInput, setGlyphInput] = useState("");
    const [decodedOutput, setDecodedOutput] = useState("");

    useEffect(() => {
        if (entry) { setPhase(1); setTimeout(() => setPhase(2), 50); }
        else { setPhase(1); setTimeout(() => setPhase(0), 400); }
    }, [entry]);

    const handleEncode = () => {
        setEncodedOutput(encodeToGlyphs(inputText));
    };

    const handleDecode = () => {
        const decoded = glyphInput.split("").map(c => REVERSE_MAP[c] || c).join("");
        setDecodedOutput(decoded);
    };

    if (phase === 0) return null;

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "stretch",
            pointerEvents: phase === 2 ? "auto" : "none",
        }}>
            {/* backdrop */}
            <div onClick={onClose} style={{
                flex: 1, background: "rgba(5,8,16,0.7)",
                opacity: phase === 2 ? 1 : 0, transition: "opacity 0.4s",
            }} />

            {/* panel */}
            <div style={{
                width: "min(560px, 92vw)",
                background: "#050810",
                borderLeft: `1px solid ${entry?.glyphColor || "#00FFD1"}40`,
                transform: phase === 2 ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                overflowY: "auto",
                display: "flex", flexDirection: "column",
            }}>
                {entry && (
                    <>
                        {/* header */}
                        <div style={{
                            padding: "28px 28px 20px",
                            borderBottom: `1px solid ${entry.glyphColor}20`,
                            position: "sticky", top: 0, background: "#050810", zIndex: 1,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={{ fontFamily: "monospace", fontSize: 10, color: entry.eraColor, letterSpacing: 3 }}>
                                    {entry.id} · {entry.classification}
                                </span>
                                <button onClick={onClose} style={{
                                    background: "none", border: "none", color: "#7AAFC4",
                                    cursor: "pointer", fontSize: 18, lineHeight: 1,
                                }}>✕</button>
                            </div>
                            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 24, color: entry.glyphColor, letterSpacing: 3 }}>
                                {entry.title}
                            </div>
                        </div>

                        <div style={{ padding: "24px 28px", flex: 1 }}>
                            {/* original transmission */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", letterSpacing: 4, marginBottom: 10 }}>
                                    ORIGINAL TRANSMISSION
                                </div>
                                <div style={{
                                    fontFamily: "monospace", fontSize: 14, color: entry.glyphColor,
                                    lineHeight: 1.8, padding: "14px 16px",
                                    border: `1px solid ${entry.glyphColor}20`,
                                    background: `${entry.glyphColor}05`,
                                    letterSpacing: 2,
                                }}>
                                    {entry.transmission}
                                </div>
                                <div style={{
                                    fontFamily: "monospace", fontSize: 12, color: "#E8F4F8",
                                    padding: "10px 16px", borderLeft: `2px solid ${entry.glyphColor}40`,
                                    marginTop: 8, letterSpacing: 1,
                                }}>
                                    → {entry.translatedText}
                                </div>
                            </div>

                            {/* lore */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", letterSpacing: 4, marginBottom: 10 }}>
                                    ARCHIVE NOTATION
                                </div>
                                <p style={{
                                    fontFamily: "'Georgia', serif", fontSize: 14, color: "#E8F4F8cc",
                                    lineHeight: 1.9, margin: 0,
                                }}>
                                    {entry.lore}
                                </p>
                            </div>

                            {/* divider */}
                            <div style={{ borderTop: "1px solid #7AAFC420", marginBottom: 24 }} />

                            {/* cipher tool */}
                            <div style={{ marginBottom: 14, fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", letterSpacing: 4 }}>
                                CIPHER TOOL — XENOVAN ENCODER
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#7AAFC4", marginBottom: 6 }}>ENCODE TEXT →</div>
                                <input
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder="TYPE SOMETHING…"
                                    style={{
                                        width: "100%", padding: "10px 12px", background: "#0a0f1a",
                                        border: "1px solid #7AAFC430", color: "#E8F4F8",
                                        fontFamily: "monospace", fontSize: 13, outline: "none",
                                        boxSizing: "border-box", letterSpacing: 2,
                                    }}
                                />
                                <button onClick={handleEncode} style={{
                                    marginTop: 8, padding: "7px 18px", background: "transparent",
                                    border: `1px solid ${entry.glyphColor}`, color: entry.glyphColor,
                                    fontFamily: "monospace", fontSize: 10, letterSpacing: 3,
                                    cursor: "pointer",
                                }}>ENCODE</button>
                                {encodedOutput && (
                                    <div style={{
                                        marginTop: 10, padding: "10px 14px",
                                        background: `${entry.glyphColor}08`,
                                        border: `1px solid ${entry.glyphColor}30`,
                                        fontFamily: "monospace", fontSize: 14,
                                        color: entry.glyphColor, letterSpacing: 3, wordBreak: "break-all",
                                    }}>
                                        {encodedOutput}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#7AAFC4", marginBottom: 6 }}>DECODE GLYPHS →</div>
                                <input
                                    value={glyphInput}
                                    onChange={e => setGlyphInput(e.target.value)}
                                    placeholder="PASTE XENOVAN GLYPHS…"
                                    style={{
                                        width: "100%", padding: "10px 12px", background: "#0a0f1a",
                                        border: "1px solid #7AAFC430", color: "#E8F4F8",
                                        fontFamily: "monospace", fontSize: 13, outline: "none",
                                        boxSizing: "border-box", letterSpacing: 2,
                                    }}
                                />
                                <button onClick={handleDecode} style={{
                                    marginTop: 8, padding: "7px 18px", background: "transparent",
                                    border: "1px solid #FF3A3A", color: "#FF3A3A",
                                    fontFamily: "monospace", fontSize: 10, letterSpacing: 3,
                                    cursor: "pointer",
                                }}>DECODE</button>
                                {decodedOutput && (
                                    <div style={{
                                        marginTop: 10, padding: "10px 14px",
                                        background: "#FF3A3A08",
                                        border: "1px solid #FF3A3A30",
                                        fontFamily: "monospace", fontSize: 13,
                                        color: "#E8F4F8", letterSpacing: 2,
                                    }}>
                                        {decodedOutput}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Glyph Reference Table ──────────────────────────────────────────
function GlyphTable({ visible }) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return (
        <div style={{
            maxHeight: visible ? 320 : 0,
            overflow: "hidden",
            transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1)",
            marginBottom: visible ? 32 : 0,
        }}>
            <div style={{
                padding: "20px 24px",
                border: "1px solid rgba(0,255,209,0.15)",
                background: "rgba(0,255,209,0.03)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))",
                gap: 6,
            }}>
                {letters.map(l => (
                    <div key={l} style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        padding: "6px 4px",
                        border: "1px solid rgba(0,255,209,0.08)",
                    }}>
                        <span style={{ fontFamily: "monospace", fontSize: 16, color: "#00FFD1" }}>{GLYPH_MAP[l]}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", marginTop: 3 }}>{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Codex Page ────────────────────────────────────────────────
export default function Codex() {
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showGlyphTable, setShowGlyphTable] = useState(false);
    const [filterEra, setFilterEra] = useState("ALL");
    const [globalInput, setGlobalInput] = useState("");
    const [globalEncoded, setGlobalEncoded] = useState("");
    const [scanline, setScanline] = useState(0);

    // animated scanline
    useEffect(() => {
        const id = setInterval(() => setScanline(s => (s + 1) % 100), 40);
        return () => clearInterval(id);
    }, []);

    const eras = ["ALL", "Rise", "Peak", "Unraveling"];
    const filtered = filterEra === "ALL" ? CODEX_ENTRIES : CODEX_ENTRIES.filter(e => e.era === filterEra);

    return (
        <div style={{
            minHeight: "100vh",
            background: "#050810",
            color: "#E8F4F8",
            position: "relative",
            fontFamily: "'Courier New', monospace",
        }}>
            <ParticleCanvas />

            {/* scanline overlay */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,209,0.015) 2px, rgba(0,255,209,0.015) 4px)",
            }} />

            {/* moving scan bar */}
            <div style={{
                position: "fixed", left: 0, right: 0, zIndex: 2, pointerEvents: "none",
                top: `${scanline}vh`, height: 2,
                background: "linear-gradient(90deg, transparent, rgba(0,255,209,0.12), transparent)",
                transition: "top 0.04s linear",
            }} />

            <div style={{ position: "relative", zIndex: 3, maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: 48 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                        <a href="/archive" style={{
                            fontFamily: "monospace", fontSize: 10, color: "#7AAFC4",
                            textDecoration: "none", letterSpacing: 3,
                            padding: "4px 12px", border: "1px solid #7AAFC430",
                            transition: "color 0.2s",
                        }}>← ARCHIVE</a>
                        <span style={{ color: "#7AAFC440" }}>·</span>
                        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#7AAFC4", letterSpacing: 3 }}>XENOVA CODEX DECODER</span>
                    </div>

                    <h1 style={{
                        fontSize: "clamp(32px, 6vw, 64px)",
                        fontWeight: 300, letterSpacing: "0.12em",
                        margin: 0, marginBottom: 8,
                        color: "#E8F4F8",
                    }}>
                        CODEX <span style={{ color: "#00FFD1" }}>DECODER</span>
                    </h1>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 1, background: "#00FFD1" }} />
                        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#7AAFC4", letterSpacing: 4 }}>
                            XENOVAN LINGUISTIC ARCHIVE · 8 ENTRIES RECOVERED
                        </span>
                    </div>

                    <p style={{ fontFamily: "monospace", fontSize: 12, color: "#7AAFC4", letterSpacing: 1, maxWidth: 640, lineHeight: 1.8, margin: 0 }}>
                        Recovered transmissions from the Kethara-VII archive. Each entry is partially corrupted.
                        Initiate decode sequences to reconstruct original Xenovan text.
                    </p>
                </div>

                {/* ── Global cipher tool ── */}
                <div style={{
                    marginBottom: 36, padding: "22px 24px",
                    border: "1px solid rgba(0,255,209,0.2)",
                    background: "rgba(0,255,209,0.03)",
                }}>
                    <div style={{ fontFamily: "monospace", fontSize: 9, color: "#00FFD1", letterSpacing: 4, marginBottom: 14 }}>
                        ⌖ UNIVERSAL XENOVAN CIPHER
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                            value={globalInput}
                            onChange={e => setGlobalInput(e.target.value)}
                            placeholder="ENTER ANY TEXT TO ENCODE INTO XENOVAN SCRIPT…"
                            style={{
                                flex: 1, minWidth: 200, padding: "10px 14px",
                                background: "#0a0f1a", border: "1px solid #7AAFC430",
                                color: "#E8F4F8", fontFamily: "monospace", fontSize: 13,
                                outline: "none", letterSpacing: 1,
                            }}
                        />
                        <button
                            onClick={() => setGlobalEncoded(encodeToGlyphs(globalInput))}
                            style={{
                                padding: "10px 22px", background: "transparent",
                                border: "1px solid #00FFD1", color: "#00FFD1",
                                fontFamily: "monospace", fontSize: 10, letterSpacing: 3,
                                cursor: "pointer",
                            }}
                        >ENCODE</button>
                        <button
                            onClick={() => setShowGlyphTable(v => !v)}
                            style={{
                                padding: "10px 22px", background: "transparent",
                                border: "1px solid #7AAFC450", color: "#7AAFC4",
                                fontFamily: "monospace", fontSize: 10, letterSpacing: 3,
                                cursor: "pointer",
                            }}
                        >{showGlyphTable ? "HIDE" : "SHOW"} GLYPHS</button>
                    </div>
                    {globalEncoded && (
                        <div style={{
                            marginTop: 14, padding: "12px 16px",
                            background: "rgba(0,255,209,0.06)",
                            border: "1px solid rgba(0,255,209,0.2)",
                            fontFamily: "monospace", fontSize: 16, color: "#00FFD1",
                            letterSpacing: 4, wordBreak: "break-all", lineHeight: 1.8,
                        }}>
                            {globalEncoded}
                        </div>
                    )}
                </div>

                {/* ── Glyph reference table ── */}
                <GlyphTable visible={showGlyphTable} />

                {/* ── Era filter ── */}
                <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
                    {eras.map(era => {
                        const color = era === "Rise" ? "#00FFD1" : era === "Peak" ? "#FFB347" : era === "Unraveling" ? "#FF3A3A" : "#7AAFC4";
                        return (
                            <button
                                key={era}
                                onClick={() => setFilterEra(era)}
                                style={{
                                    padding: "7px 20px", background: "transparent",
                                    border: `1px solid ${filterEra === era ? color : "#7AAFC430"}`,
                                    color: filterEra === era ? color : "#7AAFC4",
                                    fontFamily: "monospace", fontSize: 10, letterSpacing: 3,
                                    cursor: "pointer", transition: "all 0.2s",
                                }}
                            >{era}</button>
                        );
                    })}
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: "#7AAFC480", letterSpacing: 2, alignSelf: "center", marginLeft: 8 }}>
                        {filtered.length} ENTRIES
                    </span>
                </div>

                {/* ── Codex grid ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 16,
                }}>
                    {filtered.map(entry => (
                        <CodexCard
                            key={entry.id}
                            entry={entry}
                            isActive={selectedEntry?.id === entry.id}
                            onSelect={setSelectedEntry}
                        />
                    ))}
                </div>

                {/* ── Footer note ── */}
                <div style={{
                    marginTop: 60, paddingTop: 24,
                    borderTop: "1px solid rgba(0,255,209,0.1)",
                    fontFamily: "monospace", fontSize: 10, color: "#7AAFC440",
                    letterSpacing: 3, textAlign: "center",
                }}>
                    XENOVA ARCHIVE · CODEX DECODER v4.0 · {CODEX_ENTRIES.length} TRANSMISSIONS RECOVERED ·{" "}
                    {CODEX_ENTRIES.filter(e => e.era === "Unraveling").length} CLASSIFIED OMEGA
                </div>
            </div>

            {/* ── Detail panel ── */}
            <DetailPanel entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        </div>
    );
}