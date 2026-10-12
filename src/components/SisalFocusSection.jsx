import hillside480 from '../assets/photos/hillside-plantation-480.webp';
import hillside960 from '../assets/photos/hillside-plantation-960.webp';
import drying480 from '../assets/photos/fiber-drying-480.webp';
import drying960 from '../assets/photos/fiber-drying-960.webp';
import './SisalFocusSection.css';

const cultivationPoints = [
  'Sisal plantation cultivation across productive Tanzanian terrain',
  'Sustainable land management and crop rotation practices',
  'High-yield agave sisalana cultivation for long-term output',
  'Experienced field teams with deep local agricultural knowledge',
];

const processingPoints = [
  'Harvesting and extraction of premium sisal fibre from leaves',
  'Fibre drying, grading and quality control for export readiness',
  'Supply of raw sisal fibre to local and international markets',
  'Expanding into value-added sisal manufacturing and processing',
];

const sizes = '(max-width: 860px) calc(100vw - 5rem), 500px';

export default function SisalFocusSection() {
  return (
    <section className="sisal-focus" id="sisal-focus">
      <div className="container">
        <header className="sisal-focus__header">
          <p className="script">Sisal Operations</p>
          <h2 className="engraved sisal-focus__heading">From Soil to Fibre</h2>
        </header>

        <div className="sisal-focus__panels">
          <article className="sisal-focus__panel">
            <figure className="sisal-focus__plate">
              <img
                src={hillside480}
                srcSet={`${hillside480} 480w, ${hillside960} 960w`}
                sizes={sizes}
                width="960"
                height="454"
                loading="lazy"
                alt="Young sisal planted in rows across a hillside"
              />
            </figure>
            <p className="script sisal-focus__panel-label">Cultivation</p>
            <h3 className="engraved sisal-focus__panel-title">Growing the Future</h3>
            <ul className="sisal-focus__points">
              {cultivationPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </article>

          <article className="sisal-focus__panel">
            <figure className="sisal-focus__plate">
              <img
                src={drying480}
                srcSet={`${drying480} 480w, ${drying960} 960w`}
                sizes={sizes}
                width="960"
                height="454"
                loading="lazy"
                alt="Sisal fibre hung to dry on lines between posts"
              />
            </figure>
            <p className="script sisal-focus__panel-label">Processing &amp; Manufacturing</p>
            <h3 className="engraved sisal-focus__panel-title">Refining &amp; Expanding</h3>
            <ul className="sisal-focus__points">
              {processingPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <p className="sisal-focus__expansion-badge">Expanding from plantation into manufacturing</p>
          </article>
        </div>
      </div>
    </section>
  );
}
