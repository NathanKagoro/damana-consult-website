import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <p className="engraved footer__company-name">Damana Consult Ltd</p>
          <p className="footer__tagline">Delivering Excellence Across Every Sector</p>
          <p className="footer__address">
            4th Floor, Uhuru Financial Tower, Samora Avenue, Dar es Salaam, Tanzania
          </p>
        </div>

        <div className="footer__contact">
          <p className="footer__label">Quick Access</p>
          <p className="footer__quick-copy">
            Full office, phone, and email details are listed in the Contact section above.
          </p>
          <a className="footer__link" href="#contact">Go to Contact</a>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <p className="footer__label">Navigate</p>
          <a className="footer__link" href="#top">Home</a>
          <a className="footer__link" href="#experience">Experience</a>
          <a className="footer__link" href="#sisal-focus">Sisal Focus</a>
          <a className="footer__link" href="#services">Services</a>
        </nav>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Damana Consult Ltd. All rights reserved.</span>
        <span className="footer__credit">
          Website by Nathan Kagoro
          <a className="footer__back" href="https://nathankagoro.com">← nathankagoro.com</a>
        </span>
      </div>
    </footer>
  );
}
