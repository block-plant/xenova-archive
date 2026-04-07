import NavBar from '../components/NavBar'
import StarField from '../components/StarField'
import Planet from '../components/Planet'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'

const eras = [
  {
    id: 'rise',
    label: 'ERA I',
    title: 'THE RISE',
    years: '0 — 15,000 AX',
    description: 'From binary star system Kethara-VII, the Xenova cracked the genetic code and began seeding life across the cosmos.',
    color: 'var(--bioluminescent-teal)',
    icon: '◈',
  },
  {
    id: 'peak',
    label: 'ERA II',
    title: 'THE PEAK',
    years: '15,000 — 38,000 AX',
    description: 'Masters of 14 star systems. Bio-synthetic cities. Ships that breathed. The Grand Codex — life itself as architecture.',
    color: 'var(--genetic-amber)',
    icon: '⬡',
  },
  {
    id: 'fall',
    label: 'ERA III',
    title: 'THE UNRAVELING',
    years: '38,000 — 40,000 AX',
    description: 'Strain Omega learned. Evolved. Released The Cascade. Planet by planet, the Xenova dissolved into silence.',
    color: 'var(--cascade-red)',
    icon: '⚠',
  },
]

function MainArchive() {
  const navigate = useNavigate()
  const heroRef = useRef(null)

  return (
    <div className="archive-page">

      <NavBar />

      {/* ── Hero Section ── */}
      <section className="archive-hero" ref={heroRef}>

        {/* Stars */}
        <StarField />

        {/* Bio grid */}
        <div className="bio-grid" />

        {/* 3D Planet */}
        <Planet />

        {/* Hero content — left aligned to make room for planet */}
        <div className="hero-content" style={{ marginRight: 'auto', marginLeft: '6rem', textAlign: 'left' }}>
          <p className="hero-label">KETHARA EXPANSE · 14 STAR SYSTEMS · 200+ WORLDS</p>

          <h1 className="hero-title">
            THE GRAND
            <span className="hero-title-accent"> CODEX</span>
          </h1>

          <p className="hero-subtitle">
            Enter the recovered archive of the Xenova — a civilization that
            engineered life itself, and was undone by their greatest creation.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">40,000</span>
              <span className="stat-label">YEARS OF DOMINION</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">200+</span>
              <span className="stat-label">WORLDS SEEDED</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">847</span>
              <span className="stat-label">CODEX FRAGMENTS</span>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>SCROLL TO EXPLORE</span>
          <div className="scroll-line" />
        </div>

      </section>

      {/* ── Era Selection ── */}
      <section className="era-section">
        <div className="era-header">
          <p className="era-label">CHRONOLOGICAL ARCHIVE</p>
          <h2 className="era-title">SELECT AN ERA</h2>
          <p className="era-desc">Three chapters. One civilisation. No survivors.</p>
        </div>

        <div className="era-grid">
          {eras.map((era) => (
            <div
              key={era.id}
              className="era-card"
              style={{ '--era-color': era.color }}
              onClick={() => navigate('/timeline')}
            >
              <div className="era-card-top">
                <span className="era-icon">{era.icon}</span>
                <span className="era-tag">{era.label}</span>
              </div>
              <h3 className="era-card-title">{era.title}</h3>
              <p className="era-years">{era.years}</p>
              <p className="era-card-desc">{era.description}</p>
              <div className="era-card-footer">
                <span>EXPLORE ERA →</span>
              </div>
              <div className="era-card-glow" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Access ── */}
      <section className="quick-access">
        <p className="era-label">NAVIGATE THE ARCHIVE</p>
        <div className="quick-grid">
          {[
            { label: 'ARTIFACTS VAULT',  desc: '8 recovered bio-synthetic relics', path: '/artifacts', icon: '◉' },
            { label: "VEX'AL CODEX",     desc: 'Decode the light-language',        path: '/codex',     icon: '⟡' },
            { label: 'KETHARA MAP',      desc: 'Explore the 14 star systems',      path: '/map',       icon: '✦' },
            { label: 'ARCHIVE TERMINAL', desc: 'Test your knowledge',              path: '/terminal',  icon: '▸' },
          ].map(item => (
            <div
              key={item.path}
              className="quick-card"
              onClick={() => navigate(item.path)}
            >
              <span className="quick-icon">{item.icon}</span>
              <span className="quick-label">{item.label}</span>
              <span className="quick-desc">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default MainArchive