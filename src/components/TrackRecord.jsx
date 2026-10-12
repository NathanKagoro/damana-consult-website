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

/**
 * The engagements are entered as lines in an audit ledger: the year in the
 * margin, left of the red rule, and the particulars to its right. A plain
 * vertical register has nothing to scroll sideways, so it reads the same with
 * a keyboard, a mouse or a thumb.
 */
export default function TrackRecord() {
  return (
    <section className="track-record" id="track-record">
      <div className="container">
        <div className="ledger">
          <header className="ledger__title">
            <p className="script">Selected Engagements</p>
            <h2 className="engraved track-record__heading">Decades of Delivery</h2>
            <p className="track-record__sub">
              A selection of our work across public sector, private sector, and development partner projects.
            </p>
          </header>

          <div className="ledger__sheet" role="table" aria-label="Selected engagements">
            <div className="ledger__row ledger__row--head" role="row">
              <span role="columnheader">Year</span>
              <span role="columnheader">Engagement</span>
              <span role="columnheader">Sector</span>
              <span role="columnheader">Scope of work</span>
            </div>
            {projects.map((p) => (
              <div key={p.client} className="ledger__row" role="row">
                <span className="ledger__year" role="cell">{p.year}</span>
                <span className="ledger__client" role="cell">{p.client}</span>
                <span className="ledger__sector" role="cell">{p.sector}</span>
                <span className="ledger__scope" role="cell">{p.scope}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
