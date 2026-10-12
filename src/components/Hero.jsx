import Seal from './Seal';
import overview480 from '../assets/photos/plantation-overview-480.webp';
import overview960 from '../assets/photos/plantation-overview-960.webp';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="certificate hero__certificate">
        <div className="hero__vignette">
          <img
            src={overview480}
            srcSet={`${overview480} 480w, ${overview960} 960w`}
            sizes="(max-width: 600px) 250px, 340px"
            width="960"
            height="454"
            alt="Rows of sisal on a plantation, running towards the horizon"
            fetchPriority="high"
          />
        </div>

        <p className="script hero__place">Dar es Salaam, Tanzania</p>
        <h1 className="engraved hero__h1">
          Damana <span>Consult Ltd</span>
        </h1>
        <div className="flourish" aria-hidden="true"><span /></div>
        <p className="hero__tagline">
          Decades of professional excellence across finance, audit,
          strategy, and the emerging sisal value chain.
        </p>
        <p className="hero__expansion-note">Expanding from plantation to manufacturing</p>
        <a href="#contact" className="plate-button hero__btn">Begin a Conversation</a>
        <Seal className="hero__seal" />
      </div>
    </section>
  );
}
