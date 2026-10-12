/**
 * Eight small line engravings for the services, drawn on a 32-unit grid with
 * one hairline weight and a few hatch strokes for shade. They replace an icon
 * library that was being loaded for these eight marks alone.
 */
const paths = {
  audit: (
    <>
      <path d="M16 4l9 3v8c0 6-4 10-9 13-5-3-9-7-9-13V7z" />
      <path d="M11.5 15.5l3.2 3.2 6-6.4" />
      <path className="hatch" d="M18 24.6l5-5M20.5 25l4-4.4" />
    </>
  ),
  erp: (
    <>
      <rect x="4" y="5" width="9" height="7" />
      <rect x="19" y="5" width="9" height="7" />
      <rect x="11.5" y="20" width="9" height="7" />
      <path d="M8.5 12v4h15v-4M16 16v4" />
      <path className="hatch" d="M6 8h5M6 10h5M21 8h5M21 10h5M13.5 23h5M13.5 25h5" />
    </>
  ),
  finance: (
    <>
      <path d="M4 12l12-7 12 7zM5 27h22M7 24h18" />
      <path d="M9 14v8M14 14v8M18 14v8M23 14v8" />
      <path className="hatch" d="M10.5 14v8M15.5 14v8M19.5 14v8M24.5 14v8M12 10h8" />
    </>
  ),
  advisory: (
    <>
      <circle cx="16" cy="6" r="2" />
      <path d="M15 8L8 27M17 8l7 19M11.5 18h9" />
      <path className="hatch" d="M5 27c5 2 17 2 22 0M7 29c5 1.5 13 1.5 18 0" />
    </>
  ),
  training: (
    <>
      <path d="M16 9c-3-2-7-2.5-11-2v17c4-.5 8 0 11 2 3-2 7-2.5 11-2V7c-4-.5-8 0-11 2zM16 9v17" />
      <path className="hatch" d="M8 12h5M8 15h5M8 18h5M19 12h5M19 15h5M19 18h5" />
    </>
  ),
  secretarial: (
    <>
      <path d="M8 4h13l4 4v20H8zM21 4v4h4" />
      <path className="hatch" d="M11 12h10M11 15h10M11 18h6" />
      <circle cx="20" cy="22.5" r="2.5" />
    </>
  ),
  supply: (
    <>
      <path d="M5 10l11-5 11 5v13l-11 5-11-5zM5 10l11 5 11-5M16 15v13" />
      <path className="hatch" d="M8 14.5v9M11 16v9M21 16v9M24 14.5v9" />
    </>
  ),
  monitoring: (
    <>
      <circle cx="13.5" cy="13.5" r="8" />
      <path d="M19.5 19.5L27 27" />
      <path className="hatch" d="M9.5 11h8M9 14h9M10 17h7" />
    </>
  ),
};

export default function Glyph({ name }) {
  return (
    <svg className="glyph" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
