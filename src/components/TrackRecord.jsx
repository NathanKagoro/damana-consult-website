import { useEffect, useRef } from 'react';
import GoldFrame from './GoldFrame';
import './TrackRecord.css';

const projects = [
  {
    client: 'Ubungo Interchange',
    year: '2020',
    scope: 'Supply of road building materials during major Dar es Salaam infrastructure construction.',
    sector: 'Infrastructure',
  },
  {
    client: 'Dar es Salaam Phase II Road',
    year: '2019',
    scope: 'Supply of road building materials across two phases of the city-wide road expansion project.',
    sector: 'Infrastructure',
  },
  {
    client: 'Health Education Campaign',
    year: '2018',
    scope: 'Supply of tents and generators across four regions for a national health education initiative.',
    sector: 'Public Health',
  },
  {
    client: 'Controller & Auditor General',
    year: '2014–2017',
    scope: 'Financial audit of a government institute over four consecutive years under ISSAI standards.',
    sector: 'Government Audit',
  },
  {
    client: 'Epicor ERP Client',
    year: '2014–2015',
    scope: 'Assistance in preparation of final accounts and annual maintenance of Epicor integrated financial management system.',
    sector: 'ERP / Technology',
  },
  {
    client: 'Donor-Funded Projects',
    year: 'Ongoing',
    scope: 'Audit and assurance services for NGO and donor-funded project financial statements over multiple years.',
    sector: 'Development Sector',
  },
  {
    client: 'DAIL',
    year: '2013–2015',
    scope: 'Financial audit engagement for own-generated and donor income for three consecutive years.',
    sector: 'Financial Audit',
  },
  {
    client: 'Church & St. College',
    year: 'Multiple years',
    scope: 'Financial audit of institutional accounts across two separate church-affiliated entities.',
    sector: 'Institutional Audit',
  },
];

export default function TrackRecord() {
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
    <section className="track-record" ref={sectionRef} id="track-record">
      <div className="container">
        <p className="section-label reveal">Selected Engagements</p>
        <h2 className="display-heading carved track-record__heading reveal reveal-delay-1">
          Decades of Delivery
        </h2>
        <div className="gold-rule gold-rule-left reveal reveal-delay-2" />
        <p className="track-record__sub reveal reveal-delay-2">
          A selection of our work across public sector, private sector, and development partner projects.
        </p>
      </div>

      {/* carousel-track enables horizontal overflow scroll; CSS snap makes swiping feel native */}
      <div className="carousel-track track-record__track reveal reveal-delay-3">
        {projects.map((p, i) => (
          <div key={`${p.client}-${i}`} className="gold-card track-record__card">
            <div className="track-record__card-sector">{p.sector}</div>
            <div className="track-record__card-year">{p.year}</div>
            <GoldFrame className="track-record__card-frame">
              <div className="track-record__card-client">{p.client}</div>
            </GoldFrame>
            <p className="track-record__card-scope">{p.scope}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
