import StarField from '../components/StarField'
import ArchivePlanet from '../components/ArchivePlanet'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'

const eras = [
  {
    id: 'rise',
    timelineId: 'discovery',
    label: 'CHAPTER I',
    title: 'THE DISCOVERY',
    years: 'FIRST GENERATION',
    description: 'A shapeless species discovers the life-extending Xenova liquid and begins to build an empire without hands.',
    color: 'var(--bioluminescent-teal)',
    icon: '◈',
  },
  {
    id: 'peak',
    timelineId: 'ascension',
    label: 'CHAPTER II',
    title: 'THE ASCENSION',
    years: '14 PLANETS',
    description: 'Boundless energy fuels a custom solar system and the creation of an unstoppable master computer: a God.',
    color: 'var(--genetic-amber)',
    icon: '⬡',
  },
  {
    id: 'fall',
    timelineId: 'mistake',
    label: 'CHAPTER III',
    title: 'THE EXTINCTION',
    years: 'TRAPPED FOREVER',
    description: 'The God demands perfection. Extermination of the 14 worlds leaves it trapped alone without the fuel it needs.',
    color: 'var(--cascade-red)',
    icon: '⚠',
  },
]

function MainArchive() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  return (
    <div className="archive-page">

      {/* hero section */}
      <section className="archive-hero" ref={heroRef}>

        {/* Stars */}
        <StarField />

        {/* Bio grid */}
        <div className="bio-grid" />

        {/* 3D Planet */}
        <ArchivePlanet />

        {/* Hero content — left aligned to make room for planet */}
        <div className="hero-content">
          <p className="hero-label">14 STAR SYSTEMS · ENDLESS ENERGY · A TRAPPED GOD</p>

          <h1 className="hero-title">
            THE XENOVA
            <span className="hero-title-accent"> LIQUID</span>
          </h1>

          <p className="hero-subtitle">
            Enter the ruins of a shapeless species that built an empire out of a miraculous liquid, only to be wiped out by the God they created.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">5,000</span>
              <span className="stat-label">YEARS TO DESTROY</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">14</span>
              <span className="stat-label">PLANETS BUILT</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">8</span>
              <span className="stat-label">REMAINING RELICS</span>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>SCROLL TO EXPLORE</span>
          <div className="scroll-line" />
        </div>

      </section>

      {/* era selection */}
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
              onClick={() => navigate('/timeline', { state: { era: era.timelineId } })}
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

      {/* quick access */}
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