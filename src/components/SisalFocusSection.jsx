import { useEffect, useRef } from 'react';
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

export default function SisalFocusSection() {
  const sectionRef = useRef(null);

  // Scroll-reveal — see ExperienceSection for full explanation
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    const els = sectionRef.current?.querySelectorAll('.reveal');
    els?.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sisal-focus" ref={sectionRef} id="sisal-focus">
      <div className="container sisal-focus__header">
        <p className="section-label reveal">Sisal Operations</p>
        <h2 className="display-heading carved sisal-focus__heading reveal reveal-delay-1">
          From Soil to Fibre
        </h2>
        <div className="gold-rule reveal reveal-delay-2" />
      </div>

      <div className="sisal-focus__panels">

        {/* ── Cultivation ─────────────────────── */}
        <div
          className="sisal-focus__panel sisal-focus__panel--cultivation reveal reveal-delay-1"
          style={{ backgroundImage: 'url(/hillside-plantation.jpg)' }}
        >
          <div className="sisal-focus__panel-overlay sisal-focus__panel-overlay--navy" />
          <div className="sisal-focus__panel-content">
            <p className="sisal-focus__panel-label">Cultivation</p>
            <h3 className="sisal-focus__panel-title carved">Growing the<br/>Future</h3>
            <div className="gold-rule gold-rule-left" style={{ margin: '0.8rem 0' }} />
            <ul className="sisal-focus__points">
              {cultivationPoints.map(p => (
                <li key={p}><span className="sisal-focus__dot">◈</span>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Processing & Manufacturing ──────── */}
        <div
          className="sisal-focus__panel sisal-focus__panel--processing reveal reveal-delay-2"
          style={{ backgroundImage: 'url(/fiber-drying.jpg)' }}
        >
          <div className="sisal-focus__panel-overlay sisal-focus__panel-overlay--gold" />
          <div className="sisal-focus__panel-content">
            <p className="sisal-focus__panel-label">Processing &amp; Manufacturing</p>
            <h3 className="sisal-focus__panel-title carved">Refining &amp;<br/>Expanding</h3>
            <div className="gold-rule gold-rule-left" style={{ margin: '0.8rem 0' }} />
            <ul className="sisal-focus__points">
              {processingPoints.map(p => (
                <li key={p}><span className="sisal-focus__dot">◈</span>{p}</li>
              ))}
            </ul>
            <div className="sisal-focus__expansion-badge">
              ✦ &nbsp;Expanding from plantation into manufacturing
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
