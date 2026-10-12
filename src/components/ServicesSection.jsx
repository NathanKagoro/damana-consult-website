import { useEffect, useRef } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  Factory,
  GraduationCap,
  Handshake,
  Landmark,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import './ServicesSection.css';

const services = [
  {
    icon: ShieldCheck,
    title: 'Audit & Assurance',
    desc: 'External, internal, forensic, statutory, IT and compliance audits conducted under ISA and ISSAI standards.',
  },
  {
    icon: Workflow,
    title: 'ERP Implementation',
    desc: 'Certified Epicor professionals delivering full system implementation, configuration, integration and end-user training.',
  },
  {
    icon: Landmark,
    title: 'Financial Management',
    desc: 'Preparation of financial statements, tax consultancy, and reporting accountant services across sectors.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Advisory Services',
    desc: 'Business restructuring, strategic planning, accounting manuals, policy development and performance improvement.',
  },
  {
    icon: GraduationCap,
    title: 'Capacity Building',
    desc: 'Training needs assessments, IFRS/IPSAS training programmes, professional coaching and mentoring.',
  },
  {
    icon: Handshake,
    title: 'Company Secretarial',
    desc: 'Regulatory filings, statutory books, share transfers, and ongoing compliance with Tanzanian law.',
  },
  {
    icon: Building2,
    title: 'Supply & Distribution',
    desc: 'Building materials, metals, medical equipment, pharmaceuticals and computer hardware/networking.',
  },
  {
    icon: Factory,
    title: 'Project Monitoring',
    desc: 'Donor-funded project oversight, compliance review, fund screening and capacity gap identification.',
  },
];

export default function ServicesSection() {
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
    <section className="services-section" ref={sectionRef} id="services">
      <div className="container">
        <p className="section-label reveal">What We Offer</p>
        <h2 className="display-heading carved services-section__heading reveal reveal-delay-1">
          Our Services
        </h2>
        <div className="gold-rule gold-rule-left reveal reveal-delay-2" />

        <div className="services-section__grid">
          {services.map((s, i) => {
            const Icon = s.icon; // Lucide icon component stored in the services array
            return (
              <div
                key={s.title}
                // Cycle through delay-1..4 so every row of cards staggers independently
                className={`services-section__item reveal reveal-delay-${(i % 4) + 1}`}
              >
                <div className="services-section__item-icon">
                  <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <div className="services-section__item-body">
                  <h3 className="services-section__item-title">{s.title}</h3>
                  <p className="services-section__item-desc">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
