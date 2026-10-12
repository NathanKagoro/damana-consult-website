import { useEffect, useRef } from 'react';
import './ExperienceSection.css';

const stats = [
  { number: '20+', label: 'Years of Practice' },
  { number: '300+', label: 'Engagements Delivered' },
  { number: '8',   label: 'Industry Sectors' },
  { number: '15+', label: 'Professional Staff' },
];

const credentials = [
  'Certified external and internal auditors',
  'Certified Epicor ERP professionals',
  'ISA & ISSAI compliant audit practice',
  'VAT registered · TIN certified · Tanzania',
  'Public sector, private sector & donor-funded projects',
  'Management consulting, advisory & capacity building',
];

export default function ExperienceSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    // Scroll-reveal: once a .reveal element enters the viewport it gets the
    // .visible class, which triggers its CSS fade/slide-in transition.
    // reveal-delay-N classes stagger sibling elements within the section.
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.12 } // trigger when 12% of the element is visible
    );
    const els = sectionRef.current?.querySelectorAll('.reveal');
    els?.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="experience-section" ref={sectionRef} id="experience">
      <div className="experience-section__inner container">

        {/* ── Left: stats ───────────────────────── */}
        <div className="experience-section__stats">
          <p className="section-label reveal">Proven Track Record</p>
          <h2 className="experience-section__heading display-heading carved reveal reveal-delay-1">
            Built on<br />Experience
          </h2>
          <div className="gold-rule gold-rule-left reveal reveal-delay-2" />
          <div className="experience-section__stat-grid">
            {stats.map((s, i) => (
              <div key={s.label} className={`stat-block sculpted-panel reveal reveal-delay-${i + 1}`}>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: descriptor + credentials ──── */}
        <div className="experience-section__desc">
          <p className="experience-section__body reveal reveal-delay-2">
            Damana Consult Ltd is one of Tanzania's established management consulting and professional services firms — combining deep sectoral knowledge, certified expertise, and an uncompromising commitment to quality.
          </p>
          <div className="ornament-divider reveal reveal-delay-3">
            <span>✦</span>
          </div>
          <ul className="experience-section__credentials reveal reveal-delay-3">
            {credentials.map(c => (
              <li key={c}>
                <span className="cred-dot">◈</span>
                {c}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
