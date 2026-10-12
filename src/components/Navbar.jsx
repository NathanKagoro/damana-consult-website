import { useEffect, useRef, useState } from 'react';
import logo from '../assets/logo.svg';
import './Navbar.css';

const links = [
  ['#top', 'Home'],
  ['#experience', 'Experience'],
  ['#track-record', 'Track Record'],
  ['#sisal-focus', 'Sisal Focus'],
  ['#services', 'Services'],
];

export default function Navbar() {
  // The only state on the page: whether the small-screen menu is open.
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const burgerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };
    // Tapping or tabbing away from the header closes the menu as well.
    const onAway = (e) => {
      if (!headerRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onAway);
    document.addEventListener('focusin', onAway);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onAway);
      document.removeEventListener('focusin', onAway);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className="navbar" ref={headerRef}>
      <div className="navbar__inner container">
        <a href="#top" className="navbar__logo" onClick={close}>
          <img src={logo} alt="Damana Consult Ltd" width="118" height="56" />
        </a>

        <button
          ref={burgerRef}
          type="button"
          className="navbar__burger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>

        <nav id="site-menu" className={menuOpen ? 'navbar__nav open' : 'navbar__nav'} aria-label="Sections">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={close}>{label}</a>
          ))}
          <a href="#contact" className="navbar__cta" onClick={close}>Contact Us</a>
        </nav>
      </div>
    </header>
  );
}
