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
  return (
    <section className="experience-section paper" id="experience">
      <div className="experience-section__inner container">
        <div className="experience-section__head">
          <p className="script">Proven Track Record</p>
          <h2 className="engraved experience-section__heading">Built on Experience</h2>
          <div className="flourish" aria-hidden="true"><span /></div>
          <p className="experience-section__body">
            Damana Consult Ltd is one of Tanzania's established management consulting and professional services firms. Its certified staff know the sectors they work in, and they hold every engagement to a high standard.
          </p>
        </div>

        {/* Each figure sits in a lathe-work counter, as a denomination does on a banknote. */}
        <ul className="experience-section__stat-grid">
          {stats.map((s) => (
            <li key={s.label} className="counter">
              <span className="counter__number">{s.number}</span>
              <span className="counter__label">{s.label}</span>
            </li>
          ))}
        </ul>

        <ul className="experience-section__credentials">
          {credentials.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
