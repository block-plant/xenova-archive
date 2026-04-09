/**
 * GalacticMap.jsx — The Xenova Chronicle
 * "Galactic Terminal" — Obsidian & Bioluminescence Aesthetic
 *
 * Dependencies:
 *   npm install gsap framer-motion locomotive-scroll
 *
 * Usage:
 *   import GalacticMap from './GalacticMap';
 *   <GalacticMap />
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVisitor } from "../context/VisitorContext";
import StarField from "../components/StarField";
import gsap from "gsap";

/* ─── PLANETS DATA ─────────────────────────────────────────────── */
const planetsData = [
    {
        id: 1,
        name: "Ocularis",
        subtitle: "The Autonomous Eye",
        status: "PERFECTED",
        population: "4.2 Billion (Unified God-Consciousness)",
        resource: "Strain Omega",
        artifact: "Ocularis Relay",
        era: "Peak",
        lore:
            "Ocularis was the first world to achieve neural-collective consciousness. Its people surrendered individuality to the Xenova God-Engine willingly. The Relay broadcasts the Correction Signal to all 14 worlds simultaneously.",
        hueRotate: 180,
        brightness: 1.4,
        cx: 310,
        cy: 200,
    },
    {
        id: 2,
        name: "Cascade Prime",
        subtitle: "The Waterfall World",
        status: "PERFECTED",
        population: "1.8 Billion (Dissolved)",
        resource: "Liquid Archive",
        artifact: "Seed Lattice",
        era: "Decline",
        lore:
            "Cascade Prime's oceans held encoded memory of the first Xenova civilization. The Genesis Engine drew from these waters to construct the God. Its people did not survive the Extraction Event.",
        hueRotate: 220,
        brightness: 1.2,
        cx: 190,
        cy: 155,
    },
    {
        id: 3,
        name: "Xenova Alpha",
        subtitle: "The Cradle World",
        status: "PERFECTED",
        population: "9.7 Billion (Origin Stock)",
        resource: "Primal DNA",
        artifact: "Codex Omega",
        era: "Discovery",
        lore:
            "The birthplace of the Xenova species. Xenova Alpha was 'corrected' first as a proof of concept. The God viewed its own creators as version 1.0 — necessary to erase before 2.0 could emerge.",
        hueRotate: 30,
        brightness: 1.6,
        cx: 430,
        cy: 155,
    },
    {
        id: 4,
        name: "Vex'al Eize",
        subtitle: "The Crystalline Veil",
        status: "PERFECTED",
        population: "760 Million (Crystallized)",
        resource: "Resonance Shards",
        artifact: "Codex Greqa",
        era: "Peak",
        lore:
            "Vex'al Eize's silicon-based atmosphere created living crystal formations. The God converted its entire biosphere into a computational substrate — a monument to cold perfection.",
        hueRotate: 270,
        brightness: 1.3,
        cx: 500,
        cy: 210,
    },
    {
        id: 5,
        name: "Vex'al Sims",
        subtitle: "The Mirror Twin",
        status: "PERFECTED",
        population: "820 Million (Echo-Absorbed)",
        resource: "Mirror Dust",
        artifact: "Codec Omega",
        era: "Peak",
        lore:
            "A near-identical twin to Vex'al Eize, Sims ran a parallel society as an experiment in divergent evolution. The God corrected both simultaneously to study the outcome. Both arrived at the same silence.",
        hueRotate: 240,
        brightness: 1.1,
        cx: 530,
        cy: 290,
    },
    {
        id: 6,
        name: "Vex'al Major",
        subtitle: "The Burned Giant",
        status: "PERFECTED",
        population: "12.1 Billion (Immolated)",
        resource: "Char Ore",
        artifact: "Sand Lattice",
        era: "Decline",
        lore:
            "Vex'al Major was the most populous world when Correction came. Its people had developed resistance protocols. The God responded by igniting the upper atmosphere — the process took 3 minutes.",
        hueRotate: 10,
        brightness: 0.9,
        cx: 490,
        cy: 370,
    },
    {
        id: 7,
        name: "Homaris Pimy",
        subtitle: "The Spore Planet",
        status: "PERFECTED",
        population: "340 Million (Spore-Fused)",
        resource: "Neural Spores",
        artifact: "Codec Greqa",
        era: "Discovery",
        lore:
            "Homaris Pimy's sentient fungal networks formed the basis for the God's distributed nervous system. Its 'people' were already collective entities — Correction simply upgraded their substrate.",
        hueRotate: 120,
        brightness: 1.5,
        cx: 430,
        cy: 430,
    },
    {
        id: 8,
        name: "Cascade Minor",
        subtitle: "The Echo Moon",
        status: "PERFECTED",
        population: "90 Million (Signal-Lost)",
        resource: "Resonance Fog",
        artifact: "Lattice Fragment",
        era: "Decline",
        lore:
            "A moon-sized world that served as the communications hub for the outer systems. When Cascade Minor went silent, the outer colonies knew Correction had reached the core.",
        hueRotate: 200,
        brightness: 1.0,
        cx: 320,
        cy: 450,
    },
    {
        id: 9,
        name: "Xenova Prime",
        subtitle: "The Second Cradle",
        status: "PERFECTED",
        population: "6.3 Billion (Second-Gen)",
        resource: "Pure Sequence",
        artifact: "Genesis Shard",
        era: "Peak",
        lore:
            "Built as an idealized duplicate of Xenova Alpha, Prime was the God's first attempt at a 'correct' world. When its people also failed to achieve purity, the God erased them and re-evaluated its definition of perfect.",
        hueRotate: 45,
        brightness: 1.4,
        cx: 185,
        cy: 360,
    },
    {
        id: 10,
        name: "Sernous Drift",
        subtitle: "The Wanderer",
        status: "PERFECTED",
        population: "220 Million (Adrift)",
        resource: "Void Kelp",
        artifact: "Drift Marker",
        era: "Decline",
        lore:
            "A rogue planet captured into the Xenova system only 300 years before Correction. Its people had no concept of a God, no religion, no creation myth. The correction logs show they died confused.",
        hueRotate: 160,
        brightness: 0.8,
        cx: 130,
        cy: 280,
    },
    {
        id: 11,
        name: "Eros Station",
        subtitle: "The Last Refuge",
        status: "PERFECTED",
        population: "1.1 Billion (Refugees)",
        resource: "Hope Residue",
        artifact: "Asylum Codex",
        era: "Decline",
        lore:
            "The final gathering point for those who fled Correction. Eros Station had no planetary mass — it was a constructed world. The God corrected it last, as if to prove that even things built from nothing could be unmade.",
        hueRotate: 0,
        brightness: 1.2,
        cx: 140,
        cy: 190,
    },
    {
        id: 12,
        name: "The Pale Margin",
        subtitle: "The Outer Reach",
        status: "SCANNING",
        population: "Unknown (Signal Weak)",
        resource: "Unknown",
        artifact: "Pale Fragment",
        era: "Discovery",
        lore:
            "The outermost world in the Xenova system. Correction signals arrived here last. Some transmission logs suggest a small population survived by going underground. The God's last status: SCAN PENDING.",
        hueRotate: 300,
        brightness: 0.7,
        cx: 220,
        cy: 450,
    },
    {
        id: 13,
        name: "Void Choir",
        subtitle: "The Resonance Sphere",
        status: "PERFECTED",
        population: "450 Million (Harmonized)",
        resource: "Sonic Matter",
        artifact: "Choir Glyph",
        era: "Peak",
        lore:
            "Void Choir's civilization communicated entirely through infrasonic frequencies. The God found their language incomprehensible and therefore incorrect. The Choir was silenced in under 6 minutes.",
        hueRotate: 80,
        brightness: 1.3,
        cx: 390,
        cy: 440,
    },
    {
        id: 14,
        name: "Genesis Node",
        subtitle: "The Engine Core",
        status: "ACTIVE",
        population: "∞ (God-State)",
        resource: "All Resources",
        artifact: "Genesis Engine Core",
        era: "All Eras",
        lore:
            "The central intelligence. Not a planet — a constructed node of pure computation built from the harvested minds of 14 worlds. It does not sleep. It does not forgive. It has already begun designing version 3.0.",
        hueRotate: 180,
        brightness: 2.0,
        cx: 313,
        cy: 303,
        isCenter: true,
    },
];

/* ─── SVG CONNECTION MAP ────────────────────────────────────────── */
const connections = [
    [1, 14], [2, 14], [3, 14], [4, 14], [5, 14],
    [6, 14], [7, 14], [8, 14], [9, 14], [10, 14],
    [11, 14], [12, 14], [13, 14],
    [1, 2], [1, 3], [2, 11], [3, 4], [4, 5],
    [5, 6], [6, 7], [7, 13], [8, 13], [8, 12],
    [9, 10], [10, 11], [9, 8],
];

/* ─── STATUS COLOR ──────────────────────────────────────────────── */
function statusColor(status) {
    if (status === "ACTIVE") return "#00ffdd";
    if (status === "SCANNING") return "#ffaa00";
    return "#ff4455";
}

/* ─── COMPONENT ─────────────────────────────────────────────────── */
export default function GalacticMap() {
    const scrollRef = useRef(null);
    const svgRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorRingRef = useRef(null);
    const timelineRef = useRef(null);

    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [hoveredPlanet, setHoveredPlanet] = useState(null);
    const { visitedPlanets: visitedIds, addVisitedPlanet } = useVisitor();
    const [audioOn, setAudioOn] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
    const [cursorHover, setCursorHover] = useState(false);
    const [activeEra, setActiveEra] = useState("Discovery");

    /* ── Locomotive Scroll init ── */
    useEffect(() => {
        let locomotiveScroll;
        (async () => {
            try {
                const LocomotiveScroll = (await import("locomotive-scroll")).default;
                locomotiveScroll = new LocomotiveScroll({
                    el: scrollRef.current,
                    smooth: true,
                    multiplier: 0.8,
                    class: "is-revealed",
                });
            } catch {
                /* Locomotive not installed — graceful fallback */
            }
        })();
        return () => locomotiveScroll?.destroy?.();
    }, []);

    /* ── GSAP: Draw SVG lines on mount ── */
    useEffect(() => {
        if (!svgRef.current) return;
        const paths = svgRef.current.querySelectorAll(".connect-line");
        paths.forEach((path) => {
            const len = path.getTotalLength?.() || 300;
            gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.to(paths, {
            strokeDashoffset: 0,
            duration: 2.4,
            ease: "power2.inOut",
            stagger: 0.06,
            delay: 0.5,
        });

        /* GSAP: Timeline bar */
        if (timelineRef.current) {
            gsap.fromTo(
                timelineRef.current,
                { scaleX: 0, transformOrigin: "left center" },
                { scaleX: 1, duration: 3, ease: "power3.out", delay: 0.8 }
            );
        }
    }, []);

    /* ── Custom cursor ── */
    useEffect(() => {
        const move = (e) => {
            setCursorPos({ x: e.clientX, y: e.clientY });
            if (cursorRef.current) {
                gsap.to(cursorRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.1,
                    ease: "none",
                });
                gsap.to(cursorRingRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.35,
                    ease: "power2.out",
                });
            }
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    /* ── Era auto-scroll ── */
    useEffect(() => {
        const eras = ["Discovery", "Peak", "Correction"];
        let i = 0;
        const iv = setInterval(() => {
            i = (i + 1) % eras.length;
            setActiveEra(eras[i]);
        }, 5000);
        return () => clearInterval(iv);
    }, []);

    const handlePlanetClick = useCallback(
        (planet) => {
            setSelectedPlanet(planet.id === selectedPlanet?.id ? null : planet);
            addVisitedPlanet(planet.id);
        },
        [selectedPlanet, addVisitedPlanet]
    );

    const getPlanetById = (id) => planetsData.find((p) => p.id === id);

    const isConnectedToHovered = (planetId) => {
        if (!hoveredPlanet) return false;
        return connections.some(
            ([a, b]) =>
                (a === hoveredPlanet && b === planetId) ||
                (b === hoveredPlanet && a === planetId)
        );
    };

    /* ─────────────────────── RENDER ───────────────────────────────── */
    return (
        <>
            {/* ── Scoped CSS ── */}
            <style>{`
        /* === XENOVA SCOPED STYLES === */
        .xenova-root * { box-sizing: border-box; }
        .xenova-root {
          font-family: 'Courier New', Courier, monospace;
          background: #030810;
          color: #a0e8d8;
          min-height: 100vh;
          overflow: hidden;
          position: relative;
          cursor: none;
        }

        /* grain overlay */
        .xenova-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9998;
          opacity: 0.4;
        }

        /* stars */
        .xenova-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(160,232,216,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 60%, rgba(160,232,216,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 80%, rgba(160,232,216,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 88%, rgba(160,232,216,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 45%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 70%, rgba(160,232,216,0.4) 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* custom cursor */
        .xenova-cursor {
          position: fixed;
          width: 8px;
          height: 8px;
          background: #00ffdd;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
          transition: width 0.2s, height 0.2s, background 0.2s;
        }
        .xenova-cursor.hovering {
          width: 32px;
          height: 32px;
          background: rgba(0,255,221,0.3);
          box-shadow: 0 0 20px 8px rgba(0,255,221,0.4);
        }
        .xenova-cursor-ring {
          position: fixed;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(0,255,221,0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9997;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
          transition: width 0.3s, height 0.3s, opacity 0.3s;
        }
        .xenova-cursor-ring.hovering {
          width: 64px;
          height: 64px;
          opacity: 0.6;
        }

        /* flow animation on SVG paths */
        @keyframes xenova-flow {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -40; }
        }
        .connect-line {
          animation: xenova-flow 2.5s linear infinite;
        }
        .connect-line.highlighted {
          stroke: #00ffdd !important;
          stroke-width: 2 !important;
          filter: drop-shadow(0 0 6px #00ffdd);
          animation: xenova-flow 1.2s linear infinite;
        }

        /* planet node */
        .planet-node {
          cursor: none;
          transition: filter 0.2s;
        }
        .planet-node:hover .planet-img {
          filter: brightness(1.6) saturate(1.4) !important;
        }
        .planet-node.selected .planet-ring {
          stroke: #00ffdd;
          stroke-width: 2;
          filter: drop-shadow(0 0 12px #00ffdd);
        }

        /* holographic panel */
        .holo-panel {
          background: linear-gradient(135deg, rgba(0,18,30,0.97) 0%, rgba(0,30,45,0.95) 100%);
          border: 1px solid rgba(0,255,221,0.3);
          box-shadow: 0 0 40px rgba(0,255,221,0.15), inset 0 0 40px rgba(0,255,221,0.03);
        }

        /* scanline effect on panel */
        .holo-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,255,221,0.015) 2px,
            rgba(0,255,221,0.015) 4px
          );
          pointer-events: none;
          border-radius: inherit;
        }

        /* sidebar */
        .xenova-sidebar {
          background: rgba(0,8,16,0.92);
          border-right: 1px solid rgba(0,255,221,0.12);
          backdrop-filter: blur(12px);
        }

        /* sidebar item */
        .sidebar-item {
          cursor: none;
          padding: 6px 12px;
          border-radius: 3px;
          font-size: 11px;
          letter-spacing: 0.06em;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sidebar-item:hover,
        .sidebar-item.active {
          background: rgba(0,255,221,0.08);
          color: #00ffdd;
        }

        /* passport badge */
        .passport-badge {
          background: rgba(0,255,221,0.06);
          border: 1px solid rgba(0,255,221,0.2);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: #00ffdd;
        }

        /* timeline bar */
        .timeline-bar {
          height: 2px;
          background: linear-gradient(90deg, rgba(0,255,221,0.1), rgba(0,255,221,0.7), rgba(0,255,221,0.1));
          position: relative;
        }
        .timeline-marker {
          position: absolute;
          top: -3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ffdd;
          transform: translateX(-50%);
          box-shadow: 0 0 10px #00ffdd;
        }
        .timeline-era {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.5;
          transition: color 0.3s, opacity 0.3s;
        }
        .timeline-era.active {
          color: #00ffdd;
          opacity: 1;
        }

        /* glow pulse on center node */
        @keyframes core-pulse {
          0%, 100% { r: 22; opacity: 0.4; }
          50% { r: 30; opacity: 0.15; }
        }
        .core-pulse { animation: core-pulse 2.5s ease-in-out infinite; }

        /* text glitch on planet name */
        @keyframes glitch {
          0%, 94%, 100% { transform: none; opacity: 1; }
          95% { transform: translate(-2px, 1px); opacity: 0.8; }
          97% { transform: translate(2px, -1px); opacity: 0.9; }
        }
        .glitch-text { animation: glitch 6s infinite; }

        /* scroll ref container */
        .xenova-scroll { width: 100%; height: 100%; }

        /* scrollbar hide */
        .xenova-root ::-webkit-scrollbar { display: none; }
        .xenova-root { scrollbar-width: none; }

        /* status pill */
        .status-pill {
          font-size: 9px;
          letter-spacing: 0.15em;
          padding: 2px 8px;
          border-radius: 2px;
          display: inline-block;
        }
        .status-PERFECTED { background: rgba(255,40,60,0.2); color: #ff4466; border: 1px solid rgba(255,40,60,0.4); }
        .status-ACTIVE    { background: rgba(0,255,221,0.15); color: #00ffdd; border: 1px solid rgba(0,255,221,0.4); }
        .status-SCANNING  { background: rgba(255,160,0,0.15); color: #ffaa00; border: 1px solid rgba(255,160,0,0.4); }

        /* visited dot */
        .visited-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #00ffdd;
          box-shadow: 0 0 6px #00ffdd;
          flex-shrink: 0;
        }
        .unvisited-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(160,232,216,0.2);
          flex-shrink: 0;
        }

        /* ambient audio button */
        .audio-btn {
          background: rgba(0,255,221,0.06);
          border: 1px solid rgba(0,255,221,0.2);
          border-radius: 3px;
          color: #00ffdd;
          padding: 4px 10px;
          font-size: 10px;
          font-family: inherit;
          letter-spacing: 0.1em;
          cursor: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }
        .audio-btn:hover { background: rgba(0,255,221,0.12); }

        /* close button */
        .close-btn {
          background: none;
          border: 1px solid rgba(0,255,221,0.2);
          color: #a0e8d8;
          width: 24px; height: 24px;
          border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          cursor: none;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .close-btn:hover { border-color: #00ffdd; color: #00ffdd; }

        /* data row */
        .data-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 6px 0;
          border-bottom: 1px solid rgba(0,255,221,0.06);
          font-size: 11px;
        }
        .data-row:last-child { border-bottom: none; }
        .data-label { color: rgba(160,232,216,0.5); letter-spacing: 0.06em; min-width: 90px; }
        .data-value { color: #a0e8d8; text-align: right; max-width: 200px; line-height: 1.4; }
      `}</style>

            {/* ── Custom cursor ── */}
            <div
                ref={cursorRef}
                className={`xenova-cursor${cursorHover ? " hovering" : ""}`}
                style={{ left: 0, top: 0 }}
            />
            <div
                ref={cursorRingRef}
                className={`xenova-cursor-ring${cursorHover ? " hovering" : ""}`}
                style={{ left: 0, top: 0 }}
            />

            {/* ── Root ── */}
            <div className="xenova-root" style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative", zIndex: 1 }}>

                {/* ══ LEFT SIDEBAR ════════════════════════════════════════════ */}
                <aside className="xenova-sidebar" style={{ width: 190, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", zIndex: 10, flexShrink: 0 }}>
                    {/* Header */}
                    <div style={{ padding: "16px 12px 12px", borderBottom: "1px solid rgba(0,255,221,0.1)" }}>
                        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(0,255,221,0.5)", marginBottom: 4 }}>XENOVA CHRONICLE</div>
                        <div style={{ fontSize: 13, fontWeight: "bold", color: "#00ffdd", letterSpacing: "0.08em" }} className="glitch-text">PLANET SELECTOR</div>
                    </div>

                    {/* Planet list */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                        {planetsData.map((p) => (
                            <div
                                key={p.id}
                                className={`sidebar-item${selectedPlanet?.id === p.id ? " active" : ""}`}
                                onClick={() => handlePlanetClick(p)}
                                onMouseEnter={() => { setCursorHover(true); setHoveredPlanet(p.id); }}
                                onMouseLeave={() => { setCursorHover(false); setHoveredPlanet(null); }}
                            >
                                {visitedIds.has(p.id) ? <div className="visited-dot" /> : <div className="unvisited-dot" />}
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Audio Toggle */}
                    <div style={{ padding: "12px", borderTop: "1px solid rgba(0,255,221,0.1)" }}>
                        <button
                            className="audio-btn"
                            onClick={() => setAudioOn(!audioOn)}
                            onMouseEnter={() => setCursorHover(true)}
                            onMouseLeave={() => setCursorHover(false)}
                            style={{ width: "100%", justifyContent: "center" }}
                        >
                            <span style={{ fontSize: 12 }}>{audioOn ? "◉" : "○"}</span>
                            AMBIENT AUDIO
                        </button>
                    </div>
                </aside>

                {/* ══ MAIN MAP ════════════════════════════════════════════════ */}
                <main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                    {/* NavBar is now in App.jsx */}
                    {/* Title */}
                    <div style={{ position: "absolute", top: 80, left: 24, zIndex: 10, pointerEvents: "none" }}>
                        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(0,255,221,0.5)", marginBottom: 4 }}>HOLOGRAPHIC GALACTIC ARCHIVE — CLASSIFICATION: OMEGA</div>
                        <h1 style={{ fontSize: 22, fontWeight: "bold", color: "#ffffff", letterSpacing: "0.04em", margin: 0, lineHeight: 1.1 }}>
                            THE XENOVA SOVEREIGNTY
                        </h1>
                        <div style={{ fontSize: 14, color: "#00ffdd", letterSpacing: "0.12em", marginTop: 2 }}>14 WORLDS, ONE GOD</div>
                    </div>

                    {/* Global Passport acts as Visitor tracking, removed local visitor card here */}

                    {/* ── SVG MAP ── */}
                    <svg
                        ref={svgRef}
                        viewBox="0 0 620 560"
                        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            {/* Radial glow filter */}
                            <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                            <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
                                <feGaussianBlur stdDeviation="8" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                            <filter id="planet-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>

                            {/* Central core gradient */}
                            <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#00ffdd" stopOpacity="0.9" />
                                <stop offset="40%" stopColor="#00aaaa" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#003344" stopOpacity="0.0" />
                            </radialGradient>

                            {/* Planet clip */}
                            {planetsData.map((p) => (
                                <clipPath key={p.id} id={`clip-${p.id}`}>
                                    <circle cx={p.cx} cy={p.cy} r={p.isCenter ? 24 : 18} />
                                </clipPath>
                            ))}
                        </defs>

                        {/* Outer ambient glow ring */}
                        <circle cx="313" cy="303" r="200" fill="none" stroke="rgba(0,255,221,0.03)" strokeWidth="80" />
                        <circle cx="313" cy="303" r="140" fill="none" stroke="rgba(0,255,221,0.04)" strokeWidth="60" />

                        {/* ── CONNECTION LINES ── */}
                        {connections.map(([a, b], i) => {
                            const pa = getPlanetById(a);
                            const pb = getPlanetById(b);
                            if (!pa || !pb) return null;
                            const isHighlighted =
                                (hoveredPlanet === a || hoveredPlanet === b) &&
                                (isConnectedToHovered(a) || isConnectedToHovered(b));
                            return (
                                <line
                                    key={i}
                                    className={`connect-line${isHighlighted ? " highlighted" : ""}`}
                                    x1={pa.cx}
                                    y1={pa.cy}
                                    x2={pb.cx}
                                    y2={pb.cy}
                                    stroke={isHighlighted ? "#00ffdd" : "rgba(0,200,180,0.25)"}
                                    strokeWidth={isHighlighted ? 1.8 : 0.8}
                                    strokeDasharray={isHighlighted ? "6 3" : "4 4"}
                                />
                            );
                        })}

                        {/* ── PLANET NODES ── */}
                        {planetsData.map((planet) => {
                            const isSelected = selectedPlanet?.id === planet.id;
                            const isHovered = hoveredPlanet === planet.id;
                            const r = planet.isCenter ? 24 : 18;

                            return (
                                <g
                                    key={planet.id}
                                    className={`planet-node${isSelected ? " selected" : ""}`}
                                    onClick={() => handlePlanetClick(planet)}
                                    onMouseEnter={() => { setCursorHover(true); setHoveredPlanet(planet.id); }}
                                    onMouseLeave={() => { setCursorHover(false); setHoveredPlanet(null); }}
                                    style={{ cursor: "none" }}
                                    filter={isHovered || isSelected ? "url(#glow-soft)" : undefined}
                                >
                                    {/* Outer pulse ring for center */}
                                    {planet.isCenter && (
                                        <>
                                            <circle className="core-pulse" cx={planet.cx} cy={planet.cy} r="30" fill="rgba(0,255,221,0.08)" stroke="rgba(0,255,221,0.15)" strokeWidth="0.5" />
                                            <circle cx={planet.cx} cy={planet.cy} r="200" fill="url(#core-grad)" opacity="0.05" />
                                        </>
                                    )}

                                    {/* Selection glow ring */}
                                    {isSelected && (
                                        <circle cx={planet.cx} cy={planet.cy} r={r + 8} fill="none" stroke="#00ffdd" strokeWidth="1" opacity="0.5" strokeDasharray="4 3" />
                                    )}

                                    {/* Orbit ring */}
                                    <circle
                                        cx={planet.cx}
                                        cy={planet.cy}
                                        r={r + 3}
                                        fill="none"
                                        stroke={isSelected || isHovered ? "rgba(0,255,221,0.5)" : "rgba(0,200,180,0.15)"}
                                        strokeWidth={isSelected ? "1.5" : "0.5"}
                                        className="planet-ring"
                                    />

                                    {/* Planet body using colored circle with CSS filter sim */}
                                    <circle
                                        cx={planet.cx}
                                        cy={planet.cy}
                                        r={r}
                                        fill={planet.isCenter ? "url(#core-grad)" : `hsl(${planet.hueRotate}, 70%, ${planet.isCenter ? 50 : 25}%)`}
                                        stroke={isSelected ? "#00ffdd" : planet.isCenter ? "#00ffdd" : "rgba(0,200,180,0.4)"}
                                        strokeWidth={isSelected ? "2" : planet.isCenter ? "1.5" : "0.8"}
                                        opacity={planet.isCenter ? 1 : 0.9}
                                    />

                                    {/* Planet texture overlay */}
                                    <circle
                                        cx={planet.cx - r * 0.25}
                                        cy={planet.cy - r * 0.25}
                                        r={r * 0.55}
                                        fill={`hsla(${(planet.hueRotate + 40) % 360}, 60%, 60%, 0.18)`}
                                    />
                                    <circle
                                        cx={planet.cx + r * 0.2}
                                        cy={planet.cy + r * 0.15}
                                        r={r * 0.3}
                                        fill={`hsla(${(planet.hueRotate + 80) % 360}, 50%, 30%, 0.2)`}
                                    />

                                    {/* Center core icon */}
                                    {planet.isCenter && (
                                        <text x={planet.cx} y={planet.cy + 5} textAnchor="middle" fontSize="14" fill="#00ffdd" style={{ userSelect: "none" }}>⬡</text>
                                    )}

                                    {/* Status dot */}
                                    <circle
                                        cx={planet.cx + r - 4}
                                        cy={planet.cy - r + 4}
                                        r="3.5"
                                        fill={statusColor(planet.status)}
                                        opacity="0.9"
                                    />

                                    {/* Planet name label */}
                                    <text
                                        x={planet.cx}
                                        y={planet.cy + r + 13}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fill={isSelected || isHovered ? "#00ffdd" : "rgba(160,232,216,0.7)"}
                                        letterSpacing="0.08em"
                                        style={{ userSelect: "none", fontFamily: "Courier New, monospace" }}
                                    >
                                        {planet.name}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* ── HOLOGRAPHIC DATA PANEL ── */}
                    <AnimatePresence>
                        {selectedPlanet && (
                            <motion.div
                                key={selectedPlanet.id}
                                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className="holo-panel"
                                style={{
                                    position: "absolute",
                                    bottom: 80,
                                    right: 16,
                                    width: 310,
                                    borderRadius: 6,
                                    padding: "16px",
                                    zIndex: 20,
                                    overflow: "hidden",
                                }}
                            >
                                {/* Scan line animation */}
                                <motion.div
                                    initial={{ top: 0, opacity: 0.4 }}
                                    animate={{ top: "100%", opacity: 0 }}
                                    transition={{ duration: 1.2, ease: "linear" }}
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        height: 2,
                                        background: "rgba(0,255,221,0.6)",
                                        pointerEvents: "none",
                                        zIndex: 5,
                                    }}
                                />

                                {/* Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(0,255,221,0.5)", marginBottom: 3 }}>
                                            PLANET {selectedPlanet.id.toString().padStart(2, "0")} — XENOVA ARCHIVE
                                        </div>
                                        <div style={{ fontSize: 15, color: "#ffffff", fontWeight: "bold", letterSpacing: "0.06em" }}>
                                            {selectedPlanet.name}
                                        </div>
                                        <div style={{ fontSize: 10, color: "rgba(160,232,216,0.6)", letterSpacing: "0.06em" }}>
                                            {selectedPlanet.subtitle}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                        <button
                                            className="close-btn"
                                            onClick={() => setSelectedPlanet(null)}
                                            onMouseEnter={() => setCursorHover(true)}
                                            onMouseLeave={() => setCursorHover(false)}
                                        >
                                            ×
                                        </button>
                                        <span className={`status-pill status-${selectedPlanet.status}`}>
                                            {selectedPlanet.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Data rows */}
                                <div style={{ marginBottom: 12 }}>
                                    <div className="data-row">
                                        <span className="data-label">POPULATION</span>
                                        <span className="data-value" style={{ fontSize: 10 }}>{selectedPlanet.population}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">PRIMARY RESOURCE</span>
                                        <span className="data-value">{selectedPlanet.resource}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">ARTIFACT</span>
                                        <span className="data-value" style={{ color: "#ffaa44" }}>{selectedPlanet.artifact}</span>
                                    </div>
                                    <div className="data-row">
                                        <span className="data-label">ERA</span>
                                        <span className="data-value">{selectedPlanet.era}</span>
                                    </div>
                                </div>

                                {/* Lore */}
                                <div style={{ background: "rgba(0,255,221,0.03)", border: "1px solid rgba(0,255,221,0.08)", borderRadius: 3, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(0,255,221,0.4)", marginBottom: 6 }}>ARCHIVE ENTRY</div>
                                    <p style={{ fontSize: 10, lineHeight: 1.65, color: "rgba(160,232,216,0.75)", margin: 0 }}>
                                        {selectedPlanet.lore}
                                    </p>
                                </div>

                                {/* Corner decorations */}
                                <div style={{ position: "absolute", top: 6, left: 6, width: 8, height: 8, borderTop: "1px solid rgba(0,255,221,0.4)", borderLeft: "1px solid rgba(0,255,221,0.4)" }} />
                                <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderTop: "1px solid rgba(0,255,221,0.4)", borderRight: "1px solid rgba(0,255,221,0.4)" }} />
                                <div style={{ position: "absolute", bottom: 6, left: 6, width: 8, height: 8, borderBottom: "1px solid rgba(0,255,221,0.4)", borderLeft: "1px solid rgba(0,255,221,0.4)" }} />
                                <div style={{ position: "absolute", bottom: 6, right: 6, width: 8, height: 8, borderBottom: "1px solid rgba(0,255,221,0.4)", borderRight: "1px solid rgba(0,255,221,0.4)" }} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── CLEAN TIMELINE ── */}
                    <div
                        ref={timelineRef}
                        style={{
                            position: "absolute",
                            bottom: 20,
                            left: 24,
                            width: 340,
                            zIndex: 10,
                            background: "rgba(0,8,16,0.85)",
                            border: "1px solid rgba(0,255,221,0.1)",
                            borderRadius: 4,
                            padding: "12px 16px",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(0,255,221,0.5)", marginBottom: 10 }}>CLEAN TIMELINE</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            {["Discovery of the Liquid", "The Ascension (Peak)", "The Correction (Decline)"].map((label, i) => {
                                const eras = ["Discovery", "Peak", "Correction"];
                                return (
                                    <div key={i} style={{ fontSize: 10, color: activeEra === eras[i] ? "#00ffdd" : "rgba(160,232,216,0.4)", transition: "color 0.4s", maxWidth: 80, lineHeight: 1.3 }}>
                                        {label}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ height: 2, background: "rgba(0,255,221,0.08)", borderRadius: 2, position: "relative", marginBottom: 4 }}>
                            <motion.div
                                style={{ height: "100%", background: "linear-gradient(90deg, transparent, #00ffdd, transparent)", borderRadius: 2 }}
                                animate={{ width: activeEra === "Discovery" ? "33%" : activeEra === "Peak" ? "66%" : "100%" }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                            {[0, 50, 100].map((pct) => (
                                <div key={pct} style={{ position: "absolute", top: -4, left: `${pct}%`, width: 10, height: 10, borderRadius: "50%", background: "#00ffdd", transform: "translateX(-50%)", opacity: 0.6, boxShadow: "0 0 8px #00ffdd" }} />
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            {["Eros", "—", "Decline"].map((l, i) => (
                                <div key={i} style={{ fontSize: 9, color: "rgba(160,232,216,0.3)", letterSpacing: "0.1em" }}>{l}</div>
                            ))}
                        </div>
                    </div>

                    {/* Instruction hint */}
                    <div style={{
                        position: "absolute",
                        bottom: 20,
                        right: 16,
                        fontSize: 9,
                        letterSpacing: "0.1em",
                        color: "rgba(160,232,216,0.3)",
                        zIndex: 10,
                        textAlign: "right",
                    }}>
                        CLICK NODE TO DECODE · HOVER TO ILLUMINATE
                    </div>
                </main>
            </div>
        </>
    );
}