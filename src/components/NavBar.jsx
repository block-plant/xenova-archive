import { Link, useLocation, useNavigate } from 'react-router-dom'

const navLinks = [
  { label: 'ARCHIVE',    path: '/archive' },
  { label: 'ARTIFACTS',  path: '/artifacts' },
  { label: 'TIMELINE',   path: '/timeline' },
  { label: "VEX'AL",     path: '/codex' },
  { label: 'KETHARA',    path: '/map' },
  { label: 'TERMINAL',   path: '/terminal' },
]

function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()

  // Hide on gate page
  if (location.pathname === '/') return null

  return (
    <nav className="navbar">

      {/* Back and Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {location.pathname !== '/archive' && (
          <button 
            onClick={() => navigate('/archive')}
            className="nav-link"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: 0
            }}
          >
            <span>←</span> BACK
          </button>
        )}

        <Link to="/archive" className="nav-logo">
          <span className="nav-logo-x">X</span>
          <span className="nav-logo-text">ENOVA</span>
        </Link>
      </div>

      {/* Links */}
      <div className="nav-links">
        {navLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Status indicator */}
      <div className="nav-status">
        <span className="status-dot" />
        <span>ONLINE</span>
      </div>

    </nav>
  )
}

export default NavBar