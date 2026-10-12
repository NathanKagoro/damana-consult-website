import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  // scrolled: switches navbar from transparent to solid background after 40px of scroll
  const [scrolled, setScrolled] = useState(false);
  // menuOpen: controls the mobile burger/drawer state
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    // Clean up the listener when the component unmounts
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
      <div className="navbar__inner container">
        <a href="#top" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          <div className="navbar__logo-wrap">
            <img src="/logo.svg" alt="Damana Consult" />
          </div>
        </a>

        {/* Hamburger button — visible only on mobile via CSS; three <span>s form the three bars */}
        <button
          className={`navbar__burger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <nav className={`navbar__nav ${menuOpen ? 'open' : ''}`}>
          <a href="#top" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
          <a href="#track-record" onClick={() => setMenuOpen(false)}>Track Record</a>
          <a href="#sisal-focus" onClick={() => setMenuOpen(false)}>Sisal Focus</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#contact" className="navbar__cta" onClick={() => setMenuOpen(false)}>
            Contact Us
          </a>
        </nav>
      </div>
      <div className="navbar__gold-rule" />
    </header>
  );
}
