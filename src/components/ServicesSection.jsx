import Glyph from './Glyph';
import './ServicesSection.css';

const services = [
  {
    icon: 'audit',
    title: 'Audit & Assurance',
    desc: 'External, internal, forensic, statutory, IT and compliance audits conducted under ISA and ISSAI standards.',
  },
  {
    icon: 'erp',
    title: 'ERP Implementation',
    desc: 'Certified Epicor professionals delivering full system implementation, configuration, integration and end-user training.',
  },
  {
    icon: 'finance',
    title: 'Financial Management',
    desc: 'Preparation of financial statements, tax consultancy, and reporting accountant services across sectors.',
  },
  {
    icon: 'advisory',
    title: 'Advisory Services',
    desc: 'Business restructuring, strategic planning, accounting manuals, policy development and performance improvement.',
  },
  {
    icon: 'training',
    title: 'Capacity Building',
    desc: 'Training needs assessments, IFRS/IPSAS training programmes, professional coaching and mentoring.',
  },
  {
    icon: 'secretarial',
    title: 'Company Secretarial',
    desc: 'Regulatory filings, statutory books, share transfers, and ongoing compliance with Tanzanian law.',
  },
  {
    icon: 'supply',
    title: 'Supply & Distribution',
    desc: 'Building materials, metals, medical equipment, pharmaceuticals and computer hardware/networking.',
  },
  {
    icon: 'monitoring',
    title: 'Project Monitoring',
    desc: 'Donor-funded project oversight, compliance review, fund screening and capacity gap identification.',
  },
];

export default function ServicesSection() {
  return (
    <section className="services-section" id="services">
      <div className="container">
        <header className="services-section__header">
          <p className="script">What We Offer</p>
          <h2 className="engraved services-section__heading">Our Services</h2>
          <div className="flourish" aria-hidden="true"><span /></div>
        </header>

        <ul className="services-section__grid">
          {services.map((s) => (
            <li key={s.title} className="services-section__item">
              <span className="services-section__item-icon"><Glyph name={s.icon} /></span>
              <h3 className="services-section__item-title">{s.title}</h3>
              <p className="services-section__item-desc">{s.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
