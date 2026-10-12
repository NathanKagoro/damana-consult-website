import GoldFrame from './GoldFrame';
import './Hero.css';

export default function Hero() {
  return (
    <section
      className="hero hero--home"
      style={{ backgroundImage: 'url(/plantation-overview.jpg)' }}
    >
      <div className="hero__overlay" />
      <div className="hero__content container">
        <HomeHeroContent />
      </div>
      <div className="hero__bottom-fade" />
    </section>
  );
}

function HomeHeroContent() {
  return (
    <div className="hero__text-wrap reveal visible">
      <p className="section-label">Tanzania · Est. in Excellence</p>
      <div className="ornament-divider gold-rule-left" style={{ margin: '0.6rem 0 1.2rem' }}>
        <span>✦</span>
      </div>
      <GoldFrame className="hero__frame">
        <div className="hero__headline-box">
          <h1 className="display-heading carved hero__h1">
            Damana<br />Consult Ltd
          </h1>
          <p className="hero__tagline">
            Decades of professional excellence across finance, audit,<br />
            strategy, and the emerging sisal value chain.
          </p>
          <p className="hero__expansion-note">
            ✦ &nbsp;Expanding from plantation to manufacturing
          </p>
        </div>
      </GoldFrame>
      <a href="#contact" className="hero__btn">
        Begin a Conversation
      </a>
    </div>
  );
}
