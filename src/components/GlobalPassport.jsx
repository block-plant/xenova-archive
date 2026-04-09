import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useVisitor } from '../context/VisitorContext';

export default function GlobalPassport() {
    const { hasPass, visitorName, decodedCodexEntries, visitedPlanets, viewedRelics } = useVisitor();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);

    // Hide if no pass, or if we are on the EntryGate page
    if (!hasPass || location.pathname === '/') return null;

    const totalCodex = 8;     // From Codex.jsx
    const totalPlanets = 14;  // From KetharaMap.jsx
    const totalRelics = 9;    // From Artifacts.jsx

    const codexPct = Math.round((decodedCodexEntries.size / totalCodex) * 100);
    const planetPct = Math.round((visitedPlanets.size / totalPlanets) * 100);
    const relicPct = Math.round((viewedRelics.size / totalRelics) * 100);
    
    const overallPct = Math.round(((codexPct + planetPct + relicPct) / 3));

    return (
        <div 
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end"
            }}
        >
            {/* The expanded passport card */}
            <div 
                style={{
                    background: "rgba(5, 10, 15, 0.9)",
                    border: "1px solid rgba(0, 255, 209, 0.3)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,255,209,0.05)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 4,
                    width: 280,
                    marginBottom: 12,
                    padding: 20,
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? "translateY(0)" : "translateY(10px)",
                    pointerEvents: expanded ? "auto" : "none",
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    transformOrigin: "bottom right"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                        <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: 3, color: "rgba(0,255,209,0.5)", marginBottom: 4 }}>
                            XENOVA SOVEREIGNTY
                        </div>
                        <div style={{ fontSize: 16, fontFamily: "'Courier New', monospace", color: "#00FFD1", letterSpacing: 2, textShadow: "0 0 10px rgba(0,255,209,0.4)" }}>
                            VISITOR PASSPORT
                        </div>
                    </div>
                    {/* A small animated globe or symbol */}
                    <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #00FFD1", position: "relative" }}>
                        <div style={{ position: "absolute", inset: 2, borderRadius: "50%", border: "1px dashed rgba(0,255,209,0.4)" }} />
                        <div style={{ position: "absolute", top: "50%", left: "50%", width: 4, height: 4, borderRadius: "50%", background: "#00FFD1", transform: "translate(-50%, -50%)", boxShadow: "0 0 8px #00FFD1" }} />
                    </div>
                </div>

                <div style={{ marginBottom: 16, borderBottom: "1px solid rgba(0,255,209,0.1)", paddingBottom: 16 }}>
                    <div style={{ fontSize: 9, fontFamily: "monospace", color: "#7AAFC4", letterSpacing: 2, marginBottom: 4 }}>AUTHORIZED OBSERVER</div>
                    <div style={{ fontSize: 13, fontFamily: "monospace", color: "#E8F4F8", letterSpacing: 2 }}>{visitorName}</div>
                </div>

                {/* Progress bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    
                    <ProgressRow 
                        label="PLANETARY ARCHIVE" 
                        value={visitedPlanets.size} 
                        total={totalPlanets} 
                        pct={planetPct} 
                        color="#00FFD1" 
                    />
                    
                    <ProgressRow 
                        label="VOID VAULT RELICS" 
                        value={viewedRelics.size} 
                        total={totalRelics} 
                        pct={relicPct} 
                        color="#FFB347" 
                    />
                    
                    <ProgressRow 
                        label="CODEX ENTRIES" 
                        value={decodedCodexEntries.size} 
                        total={totalCodex} 
                        pct={codexPct} 
                        color="#FF3A3A" 
                    />

                </div>
            </div>

            {/* The toggle button badge */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    background: "rgba(5, 10, 15, 0.85)",
                    border: "1px solid rgba(0, 255, 209, 0.2)",
                    borderRadius: 30,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
            >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FFD1", boxShadow: "0 0 8px #00FFD1" }} />
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "#E8F4F8", letterSpacing: 2 }}>
                    PASSPORT · {overallPct}%
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(0,255,209,0.8)", transition: "transform 0.3s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▲
                </span>
            </button>
        </div>
    );
}

function ProgressRow({ label, value, total, pct, color }) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", letterSpacing: 2 }}>{label}</span>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: color, letterSpacing: 1 }}>{value}/{total}</span>
            </div>
            <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                <div 
                    style={{ 
                        height: "100%", 
                        width: `${pct}%`, 
                        background: color,
                        boxShadow: `0 0 10px ${color}`,
                        transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                    }} 
                />
            </div>
        </div>
    );
}
