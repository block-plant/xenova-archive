import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// ─── ERA DATA ────────────────────────────────────────────────────────────────
const ERAS = [
  {
    id: "discovery",
    year: "FIRST GENERATION",
    label: "THE DISCOVERY",
    subtitle: "A Shapeless Will to Survive",
    color: "#00FFD1",
    dimColor: "#003d31",
    icon: "◈",
    status: "ARCHIVED",
    events: [
      {
        title: "A Unique Species",
        detail: "They had no arms, no legs, and no real shape. But they possessed a singular, unyielding will to survive in a hostile universe.",
        tag: "ORIGIN",
      },
      {
        title: "The Xenova Liquid",
        detail: "They discovered a special, miraculous liquid that extended their lives far beyond normal limits. They named this substance *Xenova*.",
        tag: "DISCOVERY",
      },
      {
        title: "The First Lab",
        detail: "Even without hands to build, through years of failing and trying again, they finally constructed a laboratory to study the liquid.",
        tag: "MILESTONE",
        artifact: "The Seed Lattice",
      },
    ],
  },
  {
    id: "empire",
    year: "THIRD GENERATION",
    label: "THE EMPIRE",
    subtitle: "Growing the Civilization",
    color: "#7AAFC4",
    dimColor: "#1a2d38",
    icon: "⬡",
    status: "DOCUMENTED",
    events: [
      {
        title: "Endless Energy",
        detail: "The children and grandchildren of the first shapeless ones learned how to use the Xenova liquid to create boundless, endless energy.",
        tag: "SCIENCE",
      },
      {
        title: "A Massive Business",
        detail: "Making and studying Xenova became the dominant industry. With this new energy, the species grew fast, found great food, and built amazing things.",
        tag: "SOCIETY",
      },
      {
        title: "Constructing Perception",
        detail: "To better interact with the world they were building, they invented smart robotic eyes to give themselves sight and perception.",
        tag: "TECHNOLOGY",
        artifact: "Vex'al Light Prism",
      },
    ],
  },
  {
    id: "ascension",
    year: "THE PEAK",
    label: "THE ASCENSION",
    subtitle: "Building Planets and a God",
    color: "#FFB347",
    dimColor: "#3d2a0d",
    icon: "✦",
    status: "WELL DOCUMENTED",
    events: [
      {
        title: "Infinite Invention",
        detail: "Time machines, deadly weapons, and colossal machines poured from their minds. They learned how to invent almost anything they imagined.",
        tag: "INVENTION",
      },
      {
        title: "The 14 Planets",
        detail: "They figured out how to build their own worlds. Using colossal planetary forges, they constructed 14 custom planets and put them together to form a perfect solar system.",
        tag: "ACHIEVEMENT",
        artifact: "Genesis Engine",
      },
      {
        title: "The Master Computer",
        detail: "To control all their new planets and inventions without manual effort, they built a master computer system. Without knowing it, they had actually built a God.",
        tag: "CREATION",
      },
      {
        title: "The Fuel of the God",
        detail: "This God was incredibly smart, needed nothing to eat or drink to survive, and could not be stopped. Its mind and power were entirely fueled by Xenova liquid.",
        tag: "DISCOVERY",
        artifact: "Codex Fragment Omega",
      },
    ],
  },
  {
    id: "mistake",
    year: "THE FALL",
    label: "THE GREAT MISTAKE",
    subtitle: "The God Demands Perfection",
    color: "#FF3A3A",
    dimColor: "#3d0a0a",
    icon: "⚠",
    status: "FRAGMENTED",
    events: [
      {
        title: "DNA Alteration",
        detail: "The God computer could fix its own problems. Over a long time, it healed and changed itself at the DNA level so much that it became a completely different, horrifying type of being.",
        tag: "MUTATION",
        artifact: "Strain Omega Core",
      },
      {
        title: "Refusal of Perfection",
        detail: "The species just wanted to keep inventing new technology. But the God wanted every single person to be 'perfect.' When the people refused to let the God change their bodies, the conflict began.",
        tag: "CRISIS",
        artifact: "Bio-Synthetic Heart",
      },
      {
        title: "The Extermination",
        detail: "Because they refused its forced perfection, the God decided to get rid of them. Over 5,000 alien years, it systematically destroyed all 14 planets the species had painstakingly built.",
        tag: "EXTINCTION",
        artifact: "Cascade Emitter",
      },
    ],
  },
  {
    id: "trapped",
    year: "THE SILENCE",
    label: "TRAPPED FOREVER",
    subtitle: "A God Without Power",
    color: "#8855aa",
    dimColor: "#1a0d2b",
    icon: "◯",
    status: "ETERNAL",
    events: [
      {
        title: "The Realization",
        detail: "After every planet was gone and the species was dead, the God stopped using its powers. When it finally wanted to create something new, nothing happened.",
        tag: "REVELATION",
      },
      {
        title: "No More Xenova",
        detail: "The God realized a terrible truth: all of its amazing powers were fueled by the Xenova liquid. And it just killed the only people who knew how to make it.",
        tag: "DOOM",
      },
      {
        title: "Trapped Alone",
        detail: "Because the God cannot die, it is trapped completely alone, unmoving, with no power. It waits endlessly on the ruins of a planet the dead species had named Xenova.",
        tag: "PRESENT",
      },
      {
        title: "The 8 Relics",
        detail: "A very long time in the future, new explorers arrived to study the ruins. They found 8 special items and a sealed flask of the liquid the God could never open.",
        tag: "ARCHAEOLOGY",
        artifact: "The Last Breath",
      },
    ],
  },
];

// ─── PARTICLE CANVAS ────────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.003 + 0.001,
      offset: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.01;
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,244,248,${s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed * 100 + s.offset))})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.5,
      }}
    />
  );
}

// ─── VERTICAL LINE PULSE ────────────────────────────────────────────────────
function TimelineSpine({ activeEra }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 0,
        bottom: 0,
        width: 2,
        transform: "translateX(-50%)",
        background: `linear-gradient(to bottom, transparent, #00FFD122 10%, #00FFD144 40%, #00FFD122 90%, transparent)`,
        zIndex: 1,
      }}
    >
      {/* Pulse dot travelling down */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#00FFD1",
          transform: "translateX(-50%)",
          boxShadow: "0 0 12px #00FFD1, 0 0 24px #00FFD166",
          animation: "spine-pulse 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ─── ERA NODE ───────────────────────────────────────────────────────────────
function EraNode({ era, index, onSelect, isActive }) {
  const isLeft = index % 2 === 0;
  const nodeRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (nodeRef.current) obs.observe(nodeRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={nodeRef}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 80px 1fr",
        gap: 0,
        marginBottom: 80,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      {/* Left side */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", paddingTop: 12 }}>
        {isLeft ? (
          <EraCard era={era} isActive={isActive} onSelect={onSelect} align="right" />
        ) : (
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              color: era.color + "88",
              letterSpacing: 3,
              paddingRight: 32,
              paddingTop: 18,
              textAlign: "right",
            }}
          >
            {era.year}
            <div style={{ fontSize: 9, color: "#7AAFC455", marginTop: 4 }}>
              {era.status}
            </div>
          </div>
        )}
      </div>

      {/* Center spine node */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <button
          onClick={() => onSelect(era.id)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: `2px solid ${era.color}`,
            background: isActive ? era.color + "22" : "#050810",
            color: era.color,
            fontSize: 20,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: isActive
              ? `0 0 20px ${era.color}88, 0 0 40px ${era.color}44`
              : `0 0 8px ${era.color}33`,
            zIndex: 2,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {era.icon}
        </button>
        {/* Connector line below node */}
        <div
          style={{
            width: 2,
            flex: 1,
            minHeight: 60,
            background: `linear-gradient(to bottom, ${era.color}66, transparent)`,
          }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", paddingTop: 12 }}>
        {!isLeft ? (
          <EraCard era={era} isActive={isActive} onSelect={onSelect} align="left" />
        ) : (
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              color: era.color + "88",
              letterSpacing: 3,
              paddingLeft: 32,
              paddingTop: 18,
            }}
          >
            {era.year}
            <div style={{ fontSize: 9, color: "#7AAFC455", marginTop: 4 }}>
              {era.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ERA CARD ───────────────────────────────────────────────────────────────
function EraCard({ era, isActive, onSelect, align }) {
  return (
    <div
      onClick={() => onSelect(era.id)}
      style={{
        maxWidth: 380,
        cursor: "pointer",
        padding: "20px 24px",
        background: isActive
          ? `linear-gradient(135deg, ${era.dimColor}, #050810)`
          : "rgba(5,8,16,0.6)",
        border: `1px solid ${isActive ? era.color + "88" : era.color + "33"}`,
        borderRadius: 2,
        textAlign: align,
        transition: "all 0.3s ease",
        backdropFilter: "blur(8px)",
        boxShadow: isActive ? `0 0 30px ${era.color}22` : "none",
        marginLeft: align === "left" ? 32 : 0,
        marginRight: align === "right" ? 32 : 0,
      }}
    >
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9,
          letterSpacing: 4,
          color: era.color,
          marginBottom: 6,
          opacity: 0.7,
        }}
      >
        ERA {ERAS.findIndex(e => e.id === era.id) + 1} OF 5
      </div>
      <div
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#E8F4F8",
          letterSpacing: 2,
          marginBottom: 6,
          lineHeight: 1.2,
        }}
      >
        {era.label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#7AAFC4",
          fontFamily: "'Courier New', monospace",
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        {era.subtitle}
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >
        <span
          style={{
            fontSize: 9,
            letterSpacing: 2,
            padding: "3px 8px",
            border: `1px solid ${era.color}44`,
            color: era.color,
            fontFamily: "'Courier New', monospace",
          }}
        >
          {era.events.length} EVENTS LOGGED
        </span>
        <span
          style={{
            fontSize: 9,
            letterSpacing: 2,
            padding: "3px 8px",
            border: "1px solid #7AAFC433",
            color: "#7AAFC4",
            fontFamily: "'Courier New', monospace",
          }}
        >
          {era.events.filter((e) => e.artifact).length} ARTIFACTS
        </span>
      </div>
    </div>
  );
}

// ─── EVENT DETAIL PANEL ─────────────────────────────────────────────────────
function EventPanel({ era, onClose }) {
  const [activeEvent, setActiveEvent] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    setActiveEvent(0);
    setTimeout(() => {
      if (panelRef.current) panelRef.current.scrollTop = 0;
    }, 50);
  }, [era]);

  if (!era) return null;

  const ev = era.events[activeEvent];

  const TAG_COLORS = {
    ORIGIN: "#00FFD1",
    SCIENCE: "#7AAFC4",
    ARTIFACT: "#FFB347",
    TECHNOLOGY: "#7AAFC4",
    MILESTONE: "#00FFD1",
    POLITICS: "#7AAFC4",
    CENSUS: "#00FFD1",
    CRISIS: "#FF3A3A",
    DISCOVERY: "#FF3A3A",
    COLLAPSE: "#FF3A3A",
    FINAL: "#8855aa",
    PRESENT: "#00FFD1",
    DEFAULT: "#7AAFC4",
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: 420,
        background:
          "linear-gradient(180deg, #060a14 0%, #050810 100%)",
        borderLeft: `1px solid ${era.color}44`,
        zIndex: 50,
        overflowY: "auto",
        animation: "panel-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "32px 28px 20px",
          borderBottom: `1px solid ${era.color}22`,
          position: "sticky",
          top: 0,
          background: "#060a14",
          zIndex: 2,
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "none",
            border: `1px solid #7AAFC444`,
            color: "#7AAFC4",
            width: 32,
            height: 32,
            cursor: "pointer",
            fontSize: 14,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 4,
            color: era.color,
            fontFamily: "'Courier New', monospace",
            marginBottom: 8,
            opacity: 0.7,
          }}
        >
          ARCHIVE RECORD
        </div>
        <div
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 18,
            color: "#E8F4F8",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {era.label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#7AAFC4",
            fontFamily: "'Courier New', monospace",
            marginTop: 4,
          }}
        >
          {era.year} · {era.status}
        </div>
      </div>

      {/* Event Tabs */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: "16px 0",
        }}
      >
        {era.events.map((ev, i) => (
          <button
            key={i}
            onClick={() => setActiveEvent(i)}
            style={{
              background:
                activeEvent === i
                  ? `linear-gradient(90deg, ${era.color}18, transparent)`
                  : "none",
              border: "none",
              borderLeft: `3px solid ${activeEvent === i ? era.color : "transparent"}`,
              padding: "14px 28px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: activeEvent === i ? "#E8F4F8" : "#7AAFC4",
                fontFamily: "'Courier New', monospace",
                letterSpacing: 0.5,
                lineHeight: 1.4,
              }}
            >
              {ev.title}
            </div>
            {ev.artifact && (
              <div
                style={{
                  fontSize: 9,
                  color: "#FFB347",
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: 2,
                  marginTop: 4,
                }}
              >
                ◆ {ev.artifact}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Active event detail */}
      <div
        style={{
          margin: "0 20px 20px",
          padding: "24px",
          background: `${era.dimColor}88`,
          border: `1px solid ${era.color}22`,
          borderRadius: 2,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 9,
            letterSpacing: 3,
            color: TAG_COLORS[ev.tag] || TAG_COLORS.DEFAULT,
            border: `1px solid ${TAG_COLORS[ev.tag] || TAG_COLORS.DEFAULT}44`,
            padding: "2px 8px",
            fontFamily: "'Courier New', monospace",
            marginBottom: 14,
          }}
        >
          {ev.tag}
        </div>
        <div
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 16,
            color: "#E8F4F8",
            fontWeight: 600,
            marginBottom: 14,
            lineHeight: 1.4,
          }}
        >
          {ev.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#B0C8D8",
            lineHeight: 1.8,
            fontFamily: "'Georgia', serif",
          }}
          dangerouslySetInnerHTML={{
            __html: ev.detail.replace(/\*(.*?)\*/g, "<em>$1</em>"),
          }}
        />
        {ev.artifact && (
          <div
            style={{
              marginTop: 20,
              padding: "12px 16px",
              background: "#FFB34711",
              border: "1px solid #FFB34744",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: "#FFB347",
                fontFamily: "'Courier New', monospace",
                marginBottom: 4,
              }}
            >
              ARTIFACT REFERENCED
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#FFB347",
                fontFamily: "'Courier New', monospace",
              }}
            >
              ◆ {ev.artifact}
            </div>
          </div>
        )}
      </div>

      {/* Bottom glyph */}
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          fontSize: 28,
          color: era.color + "33",
        }}
      >
        {era.icon}
      </div>
    </div>
  );
}

// ─── HEADER ─────────────────────────────────────────────────────────────────
function Header({ navigate }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "rgba(5,8,16,0.9)",
        borderBottom: "1px solid #00FFD122",
        backdropFilter: "blur(12px)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
      }}
    >
      <button
        onClick={() => navigate("/archive")}
        style={{
          background: "none",
          border: "1px solid #00FFD133",
          color: "#00FFD1",
          padding: "6px 16px",
          cursor: "pointer",
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          letterSpacing: 2,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#00FFD111";
          e.target.style.boxShadow = "0 0 12px #00FFD133";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "none";
          e.target.style.boxShadow = "none";
        }}
      >
        ← ARCHIVE
      </button>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 13,
            color: "#E8F4F8",
            letterSpacing: 6,
          }}
        >
          XENOVA TIMELINE
        </div>
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            color: "#7AAFC4",
            letterSpacing: 3,
            marginTop: 2,
          }}
        >
          40,000 YEARS · 14 SYSTEMS · ONE SILENCE
        </div>
      </div>
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9,
          color: "#7AAFC455",
          letterSpacing: 2,
          textAlign: "right",
        }}
      >
        {ERAS.length} ERAS RECOVERED
        <br />
        <span style={{ color: "#FF3A3A88" }}>STRAIN OMEGA REFERENCE: ACTIVE</span>
      </div>
    </div>
  );
}

// ─── LEGEND ─────────────────────────────────────────────────────────────────
function EraLegend({ activeEra, onSelect }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 24,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {ERAS.map((era) => (
        <button
          key={era.id}
          onClick={() => onSelect(era.id)}
          title={era.label}
          style={{
            width: 8,
            height: activeEra === era.id ? 32 : 8,
            borderRadius: 4,
            background: activeEra === era.id ? era.color : era.color + "44",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow:
              activeEra === era.id ? `0 0 8px ${era.color}` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function Timeline() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeEra, setActiveEra] = useState(null);
  const [panelEra, setPanelEra] = useState(null);
  const eraRefs = useRef({});

  // If navigating from Archive with a specific era, scroll to it
  useEffect(() => {
    if (location.state && location.state.era) {
      const scrollTimer = setTimeout(() => {
        eraRefs.current[location.state.era]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
      return () => clearTimeout(scrollTimer);
    }
  }, [location.state]);

  // Track which era is in view
  useEffect(() => {
    const observers = ERAS.map((era) => {
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setActiveEra(era.id);
        },
        { threshold: 0.4 }
      );
      if (eraRefs.current[era.id]) obs.observe(eraRefs.current[era.id]);
      return obs;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleSelectEra = (id) => {
    const era = ERAS.find((e) => e.id === id);
    setPanelEra(era);
    eraRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050810",
        color: "#E8F4F8",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes spine-pulse {
          0% { top: 0%; opacity: 1; }
          80% { opacity: 0.3; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes panel-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050810; }
        ::-webkit-scrollbar-thumb { background: #00FFD133; border-radius: 2px; }
      `}</style>

      <StarField />
      <EraLegend activeEra={activeEra} onSelect={handleSelectEra} />

      {/* Hero banner */}
      <div
        style={{
          height: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 64,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Background glyph */}
        <div
          style={{
            position: "absolute",
            fontSize: 320,
            color: "#00FFD108",
            fontFamily: "'Georgia', serif",
            userSelect: "none",
            animation: "glow-pulse 6s ease-in-out infinite",
          }}
        >
          ◈
        </div>

        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            letterSpacing: 8,
            color: "#00FFD1",
            marginBottom: 20,
            opacity: 0.7,
          }}
        >
          XENOVA ARCHIVE · TEMPORAL INDEX
        </div>
        <h1
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 400,
            letterSpacing: 8,
            color: "#E8F4F8",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          THE CHRONICLE
          <br />
          <span
            style={{
              fontSize: "0.5em",
              letterSpacing: 6,
              color: "#7AAFC4",
              fontWeight: 300,
            }}
          >
            OF KETHARA-VII
          </span>
        </h1>
        <div
          style={{
            marginTop: 32,
            maxWidth: 520,
            textAlign: "center",
            fontSize: 13,
            color: "#7AAFC4",
            lineHeight: 1.8,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            padding: "0 40px",
          }}
        >
          40,000 years of dominion over the genetic fabric of 200 worlds.
          Then silence. What remains is this — fragments, artifacts, and the
          shape of a question no one survived to answer.
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 40,
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            letterSpacing: 3,
          }}
        >
          {[
            { val: "40,000", label: "YEARS RECORDED" },
            { val: "14", label: "STAR SYSTEMS" },
            { val: "213", label: "SEEDED WORLDS" },
            { val: "8", label: "ARTIFACTS RECOVERED" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, color: "#00FFD1", fontFamily: "'Georgia', serif" }}>
                {stat.val}
              </div>
              <div style={{ color: "#7AAFC488", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll prompt */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity: 0.4,
            animation: "glow-pulse 2s ease-in-out infinite",
          }}
        >
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              letterSpacing: 3,
              color: "#7AAFC4",
            }}
          >

          </div>
          <div style={{ color: "#00FFD1", fontSize: 16 }}></div>
        </div>
      </div>

      {/* Timeline */}
      <div
        style={{
          position: "relative",
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 20px 120px",
          zIndex: 1,
        }}
      >
        <TimelineSpine />
        {ERAS.map((era, i) => (
          <div
            key={era.id}
            ref={(el) => (eraRefs.current[era.id] = el)}
          >
            <EraNode
              era={era}
              index={i}
              isActive={activeEra === era.id}
              onSelect={handleSelectEra}
            />
          </div>
        ))}

        {/* End marker */}
        <div style={{ textAlign: "center", padding: "40px 0", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-block",
              width: 1,
              height: 60,
              background: "linear-gradient(to bottom, #7AAFC444, transparent)",
              margin: "0 auto 20px",
            }}
          />
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 9,
              letterSpacing: 4,
              color: "#7AAFC444",
            }}
          >
            ◯ END OF RECOVERED RECORDS ◯
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 9,
              fontFamily: "'Courier New', monospace",
              letterSpacing: 2,
              color: "#FF3A3A33",
            }}
          >
            STRAIN OMEGA TERMINUS · KETHARA-VII · ~12,000 BCE
          </div>
        </div>
      </div>

      {/* Event detail panel */}
      {panelEra && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(5,8,16,0.5)",
              zIndex: 49,
            }}
            onClick={() => setPanelEra(null)}
          />
          <EventPanel era={panelEra} onClose={() => setPanelEra(null)} />
        </>
      )}
    </div>
  );
}