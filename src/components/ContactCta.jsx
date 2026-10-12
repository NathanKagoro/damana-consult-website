import './ContactCta.css';

export default function ContactCta() {
  return (
    <section className="contact-cta sculpted-panel" id="contact">
      <div className="contact-cta__inner container">
        <div className="contact-cta__text">
          <p className="section-label">Get in Touch</p>
          <h2 className="display-heading carved contact-cta__heading">
            Ready to work<br />with us?
          </h2>
          <div className="gold-rule gold-rule-left" />
        </div>
        <div className="contact-cta__links">
          <a href="tel:+255784462531" className="contact-cta__item">
            <span className="contact-cta__icon">◈</span>
            <span className="contact-cta__label">Mobile</span>
            <span className="contact-cta__value">+255 784 462 531</span>
          </a>
          <a href="tel:+255767465231" className="contact-cta__item">
            <span className="contact-cta__icon">◈</span>
            <span className="contact-cta__label">Phone</span>
            <span className="contact-cta__value">+255 767 465 231</span>
          </a>
          <a href="mailto:info@damanaconsult.com" className="contact-cta__item contact-cta__item--email">
            <span className="contact-cta__icon">✉</span>
            <span className="contact-cta__label">Email</span>
            <span className="contact-cta__value">info@damanaconsult.com</span>
          </a>
        </div>
      </div>
      <div className="contact-cta__rule-top" />
      <div className="contact-cta__rule-bottom" />
    </section>
  );
}
