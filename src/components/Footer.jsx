import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__top-rule" />
      <div className="footer__inner container">
        <div className="footer__brand">
          <p className="footer__company-name">DAMANA CONSULT LTD</p>
          <div className="footer__gold-rule" />
          <p className="footer__tagline">Delivering Excellence Across Every Sector</p>
          <p className="footer__address">
            4th Floor, Uhuru Financial Tower, Samora Avenue, Dar es Salaam, Tanzania
          </p>
        </div>

        <div className="footer__contact">
          <p className="footer__contact-label">Quick Access</p>
          <p className="footer__quick-copy">
            Full office, phone, and email details are listed in the Contact section above.
          </p>
          <a className="footer__contact-link" href="#contact">Go to Contact</a>
        </div>

        <div className="footer__nav">
          <p className="footer__contact-label">Navigate</p>
          <a href="#top">Home</a>
          <a href="#experience">Experience</a>
          <a href="#sisal-focus">Sisal Focus</a>
          <a href="#services">Services</a>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-rule" />
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} Damana Consult Ltd. All rights reserved.</span>
          <span>Dar es Salaam, Tanzania</span>
        </div>
      </div>
    </footer>
  );
}
