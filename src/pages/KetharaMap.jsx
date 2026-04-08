import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════════════

const STAR_SYSTEMS = [
    {
        id: "kethara-vii",
        name: "Kethara-VII",
        type: "BINARY ORIGIN",
        x: 50, y: 50,
        radius: 22,
        color: "#00FFD1",
        glowColor: "#00FFD1",
        description: "Binary star system — homeworld of the Xenova. Two suns, Keth and Ara, orbit each other every 340 standard years. Life evolved in the gravitational Lagrange zone between them.",
        status: "DESTROYED",
        era: "Origin",
        seededWorlds: 0,
        isBinary: true,
        strainArrival: 0,
        detail: "The cradle of 40,000 years of civilisation. Kethara-VII was the first and last world the Xenova called home.",
    },
    {
        id: "velun-prime",
        name: "Velun Prime",
        type: "CORE SYSTEM",
        x: 32, y: 31,
        radius: 14,
        color: "#FFB347",
        glowColor: "#FFB347",
        description: "First system colonised beyond Kethara-VII. Home to the Grand Archive — a moon-sized data repository containing every Xenovan codex entry.",
        status: "DESTROYED",
        era: "Rise",
        seededWorlds: 18,
        strainArrival: 1,
        detail: "Velun Prime fell within 40 years of Kethara-VII. The Grand Archive's self-destruct was triggered — 4,000 years of knowledge erased in seconds.",
    },
    {
        id: "ossian-reach",
        name: "Ossian Reach",
        type: "FRONTIER SYSTEM",
        x: 67, y: 27,
        radius: 11,
        color: "#FFB347",
        glowColor: "#FFB347",
        description: "A six-planet system at the frontier of Xenovan expansion. Specialised in long-range seed deployment — ships launched from Ossian Reach are still in transit.",
        status: "DESTROYED",
        era: "Peak",
        seededWorlds: 22,
        strainArrival: 3,
        detail: "Some Ossian seed ships were beyond communication range when Strain Omega hit. They carried living Xenovan crew. Their fate is unknown.",
    },
    {
        id: "mirath-cluster",
        name: "Mirath Cluster",
        type: "RESEARCH HUB",
        x: 44, y: 22,
        radius: 10,
        color: "#00FFD1",
        glowColor: "#00FFD1",
        description: "Seven tightly-packed star systems treated as one administrative cluster. Home to the Xenova's foremost genetic research facilities.",
        status: "DESTROYED",
        era: "Peak",
        seededWorlds: 31,
        strainArrival: 2,
        detail: "Strain Omega was first formally identified in the Mirath Cluster. It was too late. Researchers who knew what was coming sealed themselves in stasis — and were never found.",
    },
    {
        id: "vex-outpost",
        name: "Vex'al Outpost",
        type: "RELAY STATION",
        x: 76, y: 44,
        radius: 9,
        color: "#7AAFC4",
        glowColor: "#7AAFC4",
        description: "A deep-space relay network of 40 stations strung across the dark between systems. Allowed real-time communication across 14 star systems.",
        status: "SILENT",
        era: "Peak",
        seededWorlds: 0,
        strainArrival: 5,
        detail: "The Vex'al relay network went silent station by station. Each silence was a system lost. Astronomers watched the silence spread at the speed of light.",
    },
    {
        id: "thal-expanse",
        name: "Thal Expanse",
        type: "AGRICULTURAL WORLD",
        x: 28, y: 62,
        radius: 12,
        color: "#FFB347",
        glowColor: "#FFB347",
        description: "Twelve terraformed agricultural worlds feeding 40% of the Xenovan population. A breadbasket empire — and one of the last systems to fall.",
        status: "DESTROYED",
        era: "Peak",
        seededWorlds: 12,
        strainArrival: 6,
        detail: "Thal Expanse held out longest. Its isolation and agricultural focus meant Strain Omega spread slowly. The final Xenovan broadcasts came from here.",
    },
    {
        id: "nether-void",
        name: "Nether Void",
        type: "RESTRICTED ZONE",
        x: 58, y: 73,
        radius: 8,
        color: "#FF3A3A",
        glowColor: "#FF3A3A",
        description: "A region of space deliberately kept off all official Xenovan charts. Recovered data suggests it was where Strain Omega was first… encountered.",
        status: "UNKNOWN",
        era: "Unraveling",
        seededWorlds: 0,
        strainArrival: -1,
        detail: "There are three references to Nether Void in recovered codex fragments. All three are redacted by the same hand. The High Council knew something.",
    },
    {
        id: "eron-gate",
        name: "Eron Gate",
        type: "TRANSIT NODE",
        x: 38, y: 78,
        radius: 10,
        color: "#7AAFC4",
        glowColor: "#7AAFC4",
        description: "A gravitational anomaly used as a faster-than-light transit gate. Ships folded space here to cross the full expanse of Xenovan territory in days.",
        status: "DESTROYED",
        era: "Rise",
        seededWorlds: 0,
        strainArrival: 4,
        detail: "Eron Gate's destruction is debated. Some say Xenova destroyed it themselves — to slow Strain Omega's spread. If so, it didn't work.",
    },
    {
        id: "cascade-front",
        name: "Cascade Front",
        type: "LAST STAND",
        x: 72, y: 67,
        radius: 9,
        color: "#FF3A3A",
        glowColor: "#FF3A3A",
        description: "The final military perimeter the Xenova attempted to hold against Strain Omega. A line of 200 warships across four systems. Overrun in 12 days.",
        status: "DESTROYED",
        era: "Unraveling",
        seededWorlds: 0,
        strainArrival: 7,
        detail: "The Cascade Front's failure confirmed what many suspected — Strain Omega was not a force you could fight with ships. It was already inside.",
    },
    {
        id: "solin-archive",
        name: "Solin Archive",
        type: "MEMORY VAULT",
        x: 20, y: 45,
        radius: 8,
        color: "#00FFD1",
        glowColor: "#00FFD1",
        description: "A deep-space vault built to survive catastrophe. Contained biological samples of every species seeded across 200 worlds. Status: unreachable.",
        status: "UNKNOWN",
        era: "Peak",
        seededWorlds: 0,
        strainArrival: -1,
        detail: "Solin Archive was designed to be the last thing standing. Its location was known only to the High Council. The coordinates were never recovered.",
    },
    {
        id: "meridian-belt",
        name: "Meridian Belt",
        type: "INDUSTRIAL RING",
        x: 55, y: 38,
        radius: 10,
        color: "#7AAFC4",
        glowColor: "#7AAFC4",
        description: "An asteroid belt turned into a ring of manufacturing stations. Produced the Genesis Engines and Seed Lattices that seeded 200 worlds.",
        status: "DESTROYED",
        era: "Peak",
        seededWorlds: 0,
        strainArrival: 2,
        detail: "The last Seed Lattice was manufactured here 200 years before Strain Omega. It was still warm when the cascade began.",
    },
    {
        id: "dawn-reach",
        name: "Dawn Reach",
        type: "OUTER COLONY",
        x: 82, y: 30,
        radius: 7,
        color: "#7AAFC4",
        glowColor: "#7AAFC4",
        description: "The furthest Xenovan colony — 40 light years from Kethara-VII. So distant that news of Strain Omega arrived 40 years after it destroyed the core.",
        status: "DESTROYED",
        era: "Unraveling",
        seededWorlds: 6,
        strainArrival: 8,
        detail: "Dawn Reach received transmissions from Kethara-VII for 40 years after the homeworld was gone. They were talking to ghosts. Then the Strain arrived, carried on the last ship that ever docked.",
    },
    {
        id: "echo-remnant",
        name: "Echo Remnant",
        type: "DEBRIS FIELD",
        x: 23, y: 78,
        radius: 7,
        color: "#FF3A3A",
        glowColor: "#FF3A3A",
        description: "A scattered debris field — all that remains of three systems that were detonated in a failed attempt to create a firebreak against Strain Omega.",
        status: "RUINS",
        era: "Unraveling",
        seededWorlds: 0,
        strainArrival: 6,
        detail: "Someone ordered three inhabited systems destroyed to stop the cascade. It didn't work. No one claimed responsibility. No one ever will.",
    },
    {
        id: "the-silence",
        name: "The Silence",
        type: "UNKNOWN",
        x: 86, y: 80,
        radius: 6,
        color: "#FF3A3A",
        glowColor: "#FF3A3A",
        description: "A region that simply stopped transmitting. No explosion, no distress call, no final message. One day — silence. Xenovan records offer no explanation.",
        status: "UNKNOWN",
        era: "Unraveling",
        seededWorlds: 0,
        strainArrival: -1,
        detail: "Whatever happened in The Silence happened fast. All 11 planets, 4 moons, and 200 stations went quiet between two consecutive signal sweeps — a window of 6 hours.",
    },
];

// ── Seeded worlds (small dots scattered around systems) ───────────
const SEEDED_WORLDS = Array.from({ length: 200 }, (_, i) => {
    const angle = (i / 200) * Math.PI * 2 * 7 + i * 0.618;
    const r = 3 + (i % 40) * 1.1;
    const cx = 50 + Math.cos(angle) * r * 1.2;
    const cy = 50 + Math.sin(angle) * r * 0.9;
    return {
        id: `world-${i}`,
        x: Math.max(2, Math.min(98, cx)),
        y: Math.max(2, Math.min(98, cy)),
        size: 0.3 + Math.random() * 0.5,
        opacity: 0.2 + Math.random() * 0.5,
        era: i < 80 ? "Rise" : i < 140 ? "Peak" : "Unraveling",
    };
});

// ── Connection lines between systems ─────────────────────────────
const CONNECTIONS = [
    ["kethara-vii", "velun-prime"],
    ["kethara-vii", "ossian-reach"],
    ["kethara-vii", "mirath-cluster"],
    ["kethara-vii", "meridian-belt"],
    ["velun-prime", "mirath-cluster"],
    ["mirath-cluster", "meridian-belt"],
    ["meridian-belt", "ossian-reach"],
    ["ossian-reach", "dawn-reach"],
    ["ossian-reach", "vex-outpost"],
    ["vex-outpost", "cascade-front"],
    ["meridian-belt", "eron-gate"],
    ["eron-gate", "thal-expanse"],
    ["thal-expanse", "echo-remnant"],
    ["cascade-front", "nether-void"],
    ["solin-archive", "velun-prime"],
    ["dawn-reach", "vex-outpost"],
];

const STATUS_COLOR = {
    DESTROYED: "#FF3A3A",
    SILENT: "#FFB347",
    UNKNOWN: "#7AAFC4",
    RUINS: "#FF3A3A",
};

// ══════════════════════════════════════════════════════════════════
//  STAR MAP CANVAS
// ══════════════════════════════════════════════════════════════════

function StarMapCanvas({ selectedSystem, hoveredSystem, onHover, onSelect, strainProgress }) {
    const svgRef = useRef(null);
    const [dims, setDims] = useState({ w: 800, h: 800 });

    useEffect(() => {
        const obs = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDims({ w: width, h: height });
        });
        if (svgRef.current) obs.observe(svgRef.current);
        return () => obs.disconnect();
    }, []);

    const px = (pct) => (pct / 100) * dims.w;
    const py = (pct) => (pct / 100) * dims.h;

    const getSystem = (id) => STAR_SYSTEMS.find(s => s.id === id);

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            style={{ position: "absolute", inset: 0, cursor: "crosshair" }}
        >
            <defs>
                {/* glow filters */}
                {["teal", "amber", "red", "blue"].map((name, i) => {
                    const colors = ["#00FFD1", "#FFB347", "#FF3A3A", "#7AAFC4"];
                    return (
                        <filter key={name} id={`glow-${name}`} x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    );
                })}
                <filter id="glow-strain" x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="strain-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF3A3A" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#FF3A3A" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#FF3A3A" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00FFD1" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#00FFD1" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* deep space background nebula */}
            <ellipse cx={px(50)} cy={py(50)} rx={px(42)} ry={py(38)}
                fill="url(#center-glow)" />

            {/* seeded worlds */}
            {SEEDED_WORLDS.map(w => (
                <circle
                    key={w.id}
                    cx={px(w.x)} cy={py(w.y)}
                    r={w.size * (dims.w / 800)}
                    fill={w.era === "Rise" ? "#00FFD1" : w.era === "Peak" ? "#FFB347" : "#FF3A3A"}
                    opacity={w.opacity * 0.6}
                />
            ))}

            {/* connection lines */}
            {CONNECTIONS.map(([a, b]) => {
                const sa = getSystem(a);
                const sb = getSystem(b);
                if (!sa || !sb) return null;
                return (
                    <line
                        key={`${a}-${b}`}
                        x1={px(sa.x)} y1={py(sa.y)}
                        x2={px(sb.x)} y2={py(sb.y)}
                        stroke="#00FFD1" strokeOpacity="0.08" strokeWidth="0.8"
                        strokeDasharray="4 6"
                    />
                );
            })}

            {/* Strain Omega spread visualization */}
            {strainProgress > 0 && (
                <>
                    <circle
                        cx={px(50)} cy={py(50)}
                        r={px(strainProgress * 0.48)}
                        fill="url(#strain-gradient)"
                        filter="url(#glow-strain)"
                        opacity={0.6}
                    />
                    {/* strain wave rings */}
                    {[1, 0.75, 0.5].map((scale, i) => (
                        <circle
                            key={i}
                            cx={px(50)} cy={py(50)}
                            r={px(strainProgress * 0.48 * scale)}
                            fill="none"
                            stroke="#FF3A3A"
                            strokeWidth="0.5"
                            strokeOpacity={0.15 * (1 - i * 0.3)}
                            strokeDasharray="3 8"
                        />
                    ))}
                </>
            )}

            {/* Systems */}
            {STAR_SYSTEMS.map(sys => {
                const isSelected = selectedSystem?.id === sys.id;
                const isHovered = hoveredSystem?.id === sys.id;
                const isActive = isSelected || isHovered;
                const r = (sys.radius / 100) * (dims.w / 10);
                const fallen = strainProgress > 0 && sys.strainArrival >= 0 &&
                    (sys.strainArrival / 8) <= strainProgress;

                const filterName = sys.color === "#00FFD1" ? "teal" :
                    sys.color === "#FFB347" ? "amber" :
                        sys.color === "#FF3A3A" ? "red" : "blue";

                return (
                    <g
                        key={sys.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => onSelect(sys)}
                        onMouseEnter={() => onHover(sys)}
                        onMouseLeave={() => onHover(null)}
                    >
                        {/* outer ring */}
                        {isActive && (
                            <circle
                                cx={px(sys.x)} cy={py(sys.y)} r={r * 2.4}
                                fill="none"
                                stroke={sys.color}
                                strokeWidth="0.5"
                                strokeOpacity="0.4"
                                strokeDasharray="4 4"
                            />
                        )}

                        {/* glow */}
                        <circle
                            cx={px(sys.x)} cy={py(sys.y)} r={r * 1.8}
                            fill={sys.color}
                            opacity={isActive ? 0.12 : 0.05}
                            filter={`url(#glow-${filterName})`}
                        />

                        {/* binary star second body */}
                        {sys.isBinary && (
                            <circle
                                cx={px(sys.x) + r * 0.8} cy={py(sys.y) - r * 0.5}
                                r={r * 0.55}
                                fill={fallen ? "#FF3A3A33" : "#FFB347"}
                                opacity={fallen ? 0.4 : 0.8}
                                filter="url(#glow-amber)"
                            />
                        )}

                        {/* main body */}
                        <circle
                            cx={px(sys.x)} cy={py(sys.y)} r={r}
                            fill={fallen ? "#1a0a0a" : sys.color}
                            opacity={fallen ? 0.5 : isActive ? 1 : 0.85}
                            filter={!fallen ? `url(#glow-${filterName})` : undefined}
                        />

                        {/* strain overlay */}
                        {fallen && (
                            <circle
                                cx={px(sys.x)} cy={py(sys.y)} r={r * 1.2}
                                fill="none"
                                stroke="#FF3A3A"
                                strokeWidth="1"
                                strokeOpacity="0.6"
                                filter="url(#glow-red)"
                            />
                        )}

                        {/* label */}
                        <text
                            x={px(sys.x)}
                            y={py(sys.y) + r + (dims.h / 80)}
                            textAnchor="middle"
                            fill={fallen ? "#FF3A3A" : sys.color}
                            fontSize={dims.w / 100}
                            fontFamily="'Courier New', monospace"
                            letterSpacing="2"
                            opacity={isActive ? 1 : 0.65}
                        >
                            {sys.name.toUpperCase()}
                        </text>
                    </g>
                );
            })}

            {/* coordinate grid (subtle) */}
            {[20, 40, 60, 80].map(v => (
                <g key={v}>
                    <line x1={px(v)} y1={0} x2={px(v)} y2={dims.h}
                        stroke="#7AAFC4" strokeOpacity="0.04" strokeWidth="0.5" />
                    <line x1={0} y1={py(v)} x2={dims.w} y2={py(v)}
                        stroke="#7AAFC4" strokeOpacity="0.04" strokeWidth="0.5" />
                </g>
            ))}

            {/* compass rose */}
            <g opacity="0.2" transform={`translate(${dims.w - 50}, ${dims.h - 50})`}>
                {[0, 90, 180, 270].map(deg => (
                    <line key={deg}
                        x1={0} y1={0}
                        x2={Math.cos((deg - 90) * Math.PI / 180) * 20}
                        y2={Math.sin((deg - 90) * Math.PI / 180) * 20}
                        stroke="#00FFD1" strokeWidth="0.7"
                    />
                ))}
                <circle cx={0} cy={0} r={2} fill="#00FFD1" />
            </g>
        </svg>
    );
}

// ══════════════════════════════════════════════════════════════════
//  DETAIL PANEL
// ══════════════════════════════════════════════════════════════════

function SystemPanel({ system, onClose }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        if (system) { requestAnimationFrame(() => setMounted(true)); }
        else { setMounted(false); }
    }, [system]);

    if (!system && !mounted) return null;

    const statusColor = STATUS_COLOR[system?.status] || "#7AAFC4";

    return (
        <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: "min(380px, 40%)",
            background: "linear-gradient(180deg, rgba(5,8,16,0.97) 0%, rgba(5,8,16,0.94) 100%)",
            borderLeft: `1px solid ${system?.color || "#00FFD1"}25`,
            transform: mounted && system ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
            overflowY: "auto",
            zIndex: 10,
            display: "flex", flexDirection: "column",
        }}>
            {system && (
                <>
                    {/* top bar */}
                    <div style={{
                        height: 3,
                        background: `linear-gradient(90deg, transparent, ${system.color}, transparent)`,
                        opacity: 0.7,
                    }} />

                    <div style={{ padding: "28px 24px", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                            <div>
                                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", letterSpacing: 4, marginBottom: 6 }}>
                                    {system.type}
                                </div>
                                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 20, color: system.color, letterSpacing: 2 }}>
                                    {system.name.toUpperCase()}
                                </div>
                            </div>
                            <button onClick={onClose} style={{
                                background: "none", border: "none", color: "#7AAFC4",
                                cursor: "pointer", fontSize: 16, alignSelf: "flex-start",
                            }}>✕</button>
                        </div>

                        {/* status */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "5px 14px", marginBottom: 24,
                            border: `1px solid ${statusColor}40`,
                            background: `${statusColor}08`,
                        }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                            <span style={{ fontFamily: "monospace", fontSize: 9, color: statusColor, letterSpacing: 3 }}>
                                {system.status}
                            </span>
                        </div>

                        {/* description */}
                        <p style={{
                            fontFamily: "monospace", fontSize: 12, color: "#E8F4F8cc",
                            lineHeight: 1.9, margin: "0 0 20px",
                        }}>
                            {system.description}
                        </p>

                        {/* lore detail */}
                        <div style={{
                            padding: "14px 16px", marginBottom: 24,
                            borderLeft: `2px solid ${system.color}50`,
                            background: `${system.color}05`,
                        }}>
                            <p style={{
                                fontFamily: "'Georgia', serif", fontSize: 12, color: "#E8F4F8aa",
                                lineHeight: 1.85, margin: 0, fontStyle: "italic",
                            }}>
                                {system.detail}
                            </p>
                        </div>

                        {/* stats grid */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr",
                            gap: 12, marginBottom: 24,
                        }}>
                            {[
                                { label: "ERA", value: system.era },
                                { label: "SEEDED WORLDS", value: system.seededWorlds || "—" },
                                { label: "STRAIN ORDER", value: system.strainArrival < 0 ? "UNKNOWN" : `#${system.strainArrival + 1}` },
                                { label: "SYSTEM TYPE", value: system.isBinary ? "BINARY" : "SINGLE" },
                            ].map(({ label, value }) => (
                                <div key={label} style={{
                                    padding: "10px 12px",
                                    border: "1px solid rgba(0,255,209,0.08)",
                                    background: "rgba(0,255,209,0.02)",
                                }}>
                                    <div style={{ fontFamily: "monospace", fontSize: 8, color: "#7AAFC4", letterSpacing: 3, marginBottom: 4 }}>
                                        {label}
                                    </div>
                                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: "#E8F4F8", letterSpacing: 1 }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {system.seededWorlds > 0 && (
                            <div style={{
                                padding: "12px 14px",
                                border: "1px solid rgba(0,255,209,0.12)",
                                background: "rgba(0,255,209,0.03)",
                                fontFamily: "monospace", fontSize: 11, color: "#7AAFC4",
                                letterSpacing: 1, lineHeight: 1.7,
                            }}>
                                ⌗ {system.seededWorlds} worlds seeded from this system. Their biospheres persist — Xenovan DNA encoded in every living thing. The civilization is gone. The life remains.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function KetharaMap() {
    const [selectedSystem, setSelectedSystem] = useState(null);
    const [hoveredSystem, setHoveredSystem] = useState(null);
    const [strainProgress, setStrainProgress] = useState(0);
    const [strainActive, setStrainActive] = useState(false);
    const [strainComplete, setStrainComplete] = useState(false);
    const animRef = useRef(null);
    const startRef = useRef(null);

    const triggerStrain = () => {
        if (strainActive) return;
        setStrainActive(true);
        setStrainComplete(false);
        setStrainProgress(0);
        startRef.current = null;

        const animate = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const duration = 6000;
            const progress = Math.min(elapsed / duration, 1);
            setStrainProgress(progress);
            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                setStrainComplete(true);
            }
        };
        animRef.current = requestAnimationFrame(animate);
    };

    const resetStrain = () => {
        cancelAnimationFrame(animRef.current);
        setStrainActive(false);
        setStrainComplete(false);
        setStrainProgress(0);
        startRef.current = null;
    };

    useEffect(() => () => cancelAnimationFrame(animRef.current), []);

    const fallen = STAR_SYSTEMS.filter(s =>
        s.strainArrival >= 0 && (s.strainArrival / 8) <= strainProgress
    );

    return (
        <div style={{
            minHeight: "100vh",
            background: "#050810",
            color: "#E8F4F8",
            fontFamily: "'Courier New', monospace",
            display: "flex", flexDirection: "column",
        }}>
            {/* ── Top bar ── */}
            <div style={{
                padding: "16px 28px",
                borderBottom: "1px solid rgba(0,255,209,0.1)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(5,8,16,0.9)",
                backdropFilter: "blur(8px)",
                position: "sticky", top: 0, zIndex: 20,
                flexWrap: "wrap", gap: 12,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <a href="/archive" style={{
                        fontFamily: "monospace", fontSize: 10, color: "#7AAFC4",
                        textDecoration: "none", letterSpacing: 3,
                        padding: "4px 12px", border: "1px solid #7AAFC430",
                    }}>← ARCHIVE</a>
                    <div>
                        <div style={{ fontSize: 10, color: "#7AAFC4", letterSpacing: 4 }}>XENOVA TERRITORIAL SURVEY</div>
                        <div style={{ fontSize: 18, color: "#00FFD1", letterSpacing: 4, lineHeight: 1.2 }}>
                            KETHARA STAR MAP
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 9, color: "#7AAFC4", letterSpacing: 3, textAlign: "right" }}>
                        <div>{STAR_SYSTEMS.length} SYSTEMS CHARTED</div>
                        <div>200 SEEDED WORLDS</div>
                    </div>
                    <div style={{ width: 1, height: 32, background: "#7AAFC430" }} />
                    <button
                        onClick={strainActive ? resetStrain : triggerStrain}
                        style={{
                            padding: "8px 18px",
                            background: "transparent",
                            border: `1px solid ${strainActive ? "#FF3A3A" : "#FF3A3A60"}`,
                            color: strainActive ? "#FF3A3A" : "#FF3A3A80",
                            fontFamily: "monospace", fontSize: 10, letterSpacing: 3,
                            cursor: "pointer", transition: "all 0.3s",
                        }}
                    >
                        {strainComplete ? "✕ RESET" : strainActive ? "SPREADING…" : "▶ STRAIN OMEGA"}
                    </button>
                </div>
            </div>

            {/* ── Strain progress bar ── */}
            {strainActive && (
                <div style={{ height: 2, background: "rgba(255,58,58,0.15)", position: "relative" }}>
                    <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: `${strainProgress * 100}%`,
                        background: "linear-gradient(90deg, #FF3A3A, #FF6B6B)",
                        boxShadow: "0 0 12px #FF3A3A",
                        transition: "width 0.05s linear",
                    }} />
                </div>
            )}

            {/* ── Main content ── */}
            <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>

                {/* ── Left legend ── */}
                <div style={{
                    width: 200, flexShrink: 0,
                    borderRight: "1px solid rgba(0,255,209,0.08)",
                    padding: "24px 16px",
                    background: "rgba(5,8,16,0.6)",
                    overflowY: "auto",
                    display: "flex", flexDirection: "column", gap: 24,
                }}>
                    {/* Era legend */}
                    <div>
                        <div style={{ fontSize: 8, color: "#7AAFC4", letterSpacing: 4, marginBottom: 12 }}>ERAS</div>
                        {[
                            { label: "Rise", color: "#00FFD1", desc: "Expansion" },
                            { label: "Peak", color: "#FFB347", desc: "Dominion" },
                            { label: "Unraveling", color: "#FF3A3A", desc: "Collapse" },
                        ].map(({ label, color, desc }) => (
                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                                <div>
                                    <div style={{ fontSize: 10, color, letterSpacing: 2 }}>{label}</div>
                                    <div style={{ fontSize: 8, color: "#7AAFC4", letterSpacing: 1 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Status legend */}
                    <div>
                        <div style={{ fontSize: 8, color: "#7AAFC4", letterSpacing: 4, marginBottom: 12 }}>STATUS</div>
                        {Object.entries(STATUS_COLOR).filter(([k], i, a) => a.findIndex(x => x[1] === STATUS_COLOR[k]) === i).map(([status, color]) => (
                            <div key={status} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                                <span style={{ fontSize: 9, color: "#7AAFC4", letterSpacing: 2 }}>{status}</span>
                            </div>
                        ))}
                    </div>

                    {/* System list */}
                    <div>
                        <div style={{ fontSize: 8, color: "#7AAFC4", letterSpacing: 4, marginBottom: 12 }}>SYSTEMS</div>
                        {STAR_SYSTEMS.map(sys => (
                            <div
                                key={sys.id}
                                onClick={() => setSelectedSystem(sys)}
                                style={{
                                    padding: "5px 8px", marginBottom: 3,
                                    cursor: "pointer",
                                    background: selectedSystem?.id === sys.id ? `${sys.color}10` : "transparent",
                                    borderLeft: `2px solid ${selectedSystem?.id === sys.id ? sys.color : "transparent"}`,
                                    transition: "all 0.15s",
                                }}
                            >
                                <div style={{ fontSize: 9, color: selectedSystem?.id === sys.id ? sys.color : "#7AAFC4", letterSpacing: 1 }}>
                                    {sys.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Map area ── */}
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                    <StarMapCanvas
                        selectedSystem={selectedSystem}
                        hoveredSystem={hoveredSystem}
                        onHover={setHoveredSystem}
                        onSelect={(sys) => setSelectedSystem(prev => prev?.id === sys.id ? null : sys)}
                        strainProgress={strainProgress}
                    />

                    {/* tooltip */}
                    {hoveredSystem && !selectedSystem && (
                        <div style={{
                            position: "absolute", bottom: 24, left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(5,8,16,0.92)",
                            border: `1px solid ${hoveredSystem.color}40`,
                            padding: "10px 20px",
                            fontFamily: "monospace", fontSize: 11,
                            color: hoveredSystem.color, letterSpacing: 3,
                            pointerEvents: "none",
                            backdropFilter: "blur(4px)",
                        }}>
                            {hoveredSystem.name.toUpperCase()} — {hoveredSystem.type}
                        </div>
                    )}

                    {/* strain counter */}
                    {strainActive && (
                        <div style={{
                            position: "absolute", bottom: 24, right: 24,
                            background: "rgba(5,8,16,0.9)",
                            border: "1px solid #FF3A3A40",
                            padding: "12px 18px",
                            fontFamily: "monospace", textAlign: "right",
                        }}>
                            <div style={{ fontSize: 8, color: "#FF3A3A", letterSpacing: 4, marginBottom: 4 }}>STRAIN OMEGA SPREAD</div>
                            <div style={{ fontSize: 22, color: "#FF3A3A", letterSpacing: 2 }}>
                                {fallen.length}<span style={{ fontSize: 11, color: "#FF3A3A80" }}>/{STAR_SYSTEMS.filter(s => s.strainArrival >= 0).length}</span>
                            </div>
                            <div style={{ fontSize: 8, color: "#FF3A3A60", letterSpacing: 2 }}>SYSTEMS LOST</div>
                        </div>
                    )}

                    {/* "click to explore" hint */}
                    {!selectedSystem && !hoveredSystem && !strainActive && (
                        <div style={{
                            position: "absolute", bottom: 24, left: "50%",
                            transform: "translateX(-50%)",
                            fontFamily: "monospace", fontSize: 9, color: "#7AAFC440",
                            letterSpacing: 4, pointerEvents: "none",
                        }}>
                            CLICK ANY SYSTEM TO EXPLORE · ▶ STRAIN OMEGA TO SIMULATE CASCADE
                        </div>
                    )}
                </div>

                {/* ── Detail panel ── */}
                <SystemPanel system={selectedSystem} onClose={() => setSelectedSystem(null)} />
            </div>

            {/* ── Bottom stats bar ── */}
            <div style={{
                padding: "12px 28px",
                borderTop: "1px solid rgba(0,255,209,0.08)",
                background: "rgba(5,8,16,0.9)",
                display: "flex", gap: 32, flexWrap: "wrap",
                fontFamily: "monospace", fontSize: 9, color: "#7AAFC4", letterSpacing: 3,
            }}>
                {[
                    { label: "STAR SYSTEMS", value: "14" },
                    { label: "SEEDED WORLDS", value: "200+" },
                    { label: "YEARS OF EXPANSION", value: "40,000" },
                    { label: "STRAIN OMEGA ORIGIN", value: "UNKNOWN" },
                    { label: "SURVIVORS", value: "NONE CONFIRMED" },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <span style={{ color: "#7AAFC460" }}>{label}: </span>
                        <span style={{ color: "#00FFD1" }}>{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}