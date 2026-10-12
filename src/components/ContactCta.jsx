import './ContactCta.css';

export default function ContactCta() {
  return (
    <section className="contact-cta paper" id="contact">
      <div className="contact-cta__inner container">
        <div className="contact-cta__text">
          <p className="script">Get in Touch</p>
          <h2 className="engraved contact-cta__heading">Ready to work with us?</h2>
          <div className="flourish flourish--left" aria-hidden="true"><span /></div>
          <address className="contact-cta__address">
            4th Floor, Uhuru Financial Tower,<br />
            Samora Avenue, Dar es Salaam, Tanzania
          </address>
        </div>

        {/* Set out like the signature lines at the foot of a certificate. */}
        <div className="contact-cta__links">
          <a href="tel:+255784462531" className="contact-cta__item">
            <span className="contact-cta__value">+255 784 462 531</span>
            <span className="contact-cta__label">Mobile</span>
          </a>
          <a href="tel:+255767465231" className="contact-cta__item">
            <span className="contact-cta__value">+255 767 465 231</span>
            <span className="contact-cta__label">Phone</span>
          </a>
          <a href="mailto:info@damanaconsult.com" className="contact-cta__item">
            <span className="contact-cta__value contact-cta__value--email">info@damanaconsult.com</span>
            <span className="contact-cta__label">Email</span>
          </a>
        </div>
      </div>
    </section>
  );
}
