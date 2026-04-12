import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useVisitor } from '../context/VisitorContext'
import FeedbackModal from './FeedbackModal'

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
  const { logout } = useVisitor()
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Hide on gate page
  if (location.pathname === '/') return null

  // Styles for the mobile menu
  const mobileMenuStyle = {
    position: 'absolute',
    top: 'var(--navbar-height)',
    left: 0,
    right: 0,
    background: '#05121b',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0, 255, 209, 0.1)',
    display: isMobileMenuOpen ? 'flex' : 'none',
    flexDirection: 'column',
    padding: '1rem 1.5rem',
    gap: '1rem',
    zIndex: 9999
  }

  // Handle route change for mobile menu
  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  }

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

      {/* Hamburger Toggle (visible on mobile only, via inline media query simulation or class) */}
      <button 
        className="mobile-menu-btn lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          background: 'transparent', border: 'none', color: 'var(--bioluminescent-teal)',
          fontSize: '1.5rem', cursor: 'pointer', zIndex: 10001
        }}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu Dropdown */}
      <div style={mobileMenuStyle} className="lg:hidden">
        {navLinks.map(link => (
          <button
            key={link.path}
            onClick={() => handleNavClick(link.path)}
            className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
            style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 0', fontFamily: 'inherit' }}
          >
            {link.label}
          </button>
        ))}
        <div style={{ height: '1px', background: 'rgba(0, 255, 209, 0.1)', margin: '0.5rem 0' }} />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: 'var(--muted-cyan)' }}>
            <span className="status-dot" /> ONLINE
          </div>
        </div>
      </div>

      {/* Status indicator & Logout */}
      <div className="nav-status hidden lg:flex" style={{ gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot" />
          <span>ONLINE</span>
        </div>
        <button 
          onClick={() => setIsFeedbackOpen(true)}
          className="nav-link"
          style={{ 
            background: 'transparent', 
            border: '1px solid rgba(255, 179, 71, 0.3)', 
            color: 'rgba(255, 179, 71, 0.8)',
            cursor: 'pointer', 
            fontFamily: 'inherit',
            fontSize: '0.7rem',
            padding: '4px 8px',
            letterSpacing: '0.1em'
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 179, 71, 0.1)'; e.target.style.color = '#FFB347'; e.target.style.borderColor = '#FFB347'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(255, 179, 71, 0.8)'; e.target.style.borderColor = 'rgba(255, 179, 71, 0.3)'; }}
        >
          REPORT ANOMALY
        </button>

        <button 
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="nav-link"
          style={{ 
            background: 'transparent', 
            border: '1px solid rgba(255, 58, 58, 0.3)', 
            color: 'rgba(255, 58, 58, 0.8)',
            cursor: 'pointer', 
            fontFamily: 'inherit',
            fontSize: '0.7rem',
            padding: '4px 8px',
            letterSpacing: '0.1em'
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 58, 58, 0.1)'; e.target.style.color = '#FF3A3A'; e.target.style.borderColor = '#FF3A3A'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(255, 58, 58, 0.8)'; e.target.style.borderColor = 'rgba(255, 58, 58, 0.3)'; }}
        >
          DISCONNECT
        </button>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

    </nav>
  )
}

export default NavBar