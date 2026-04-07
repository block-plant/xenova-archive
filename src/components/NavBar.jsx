import { Link, useLocation } from 'react-router-dom'

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

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/archive" className="nav-logo">
        <span className="nav-logo-x">X</span>
        <span className="nav-logo-text">ENOVA</span>
      </Link>

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