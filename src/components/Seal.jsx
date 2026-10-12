import './Seal.css';

/**
 * The company seal: a serrated gold wafer of the kind pressed onto share
 * certificates, with the firm's name running round the rim. Decorative, so it
 * is hidden from assistive technology; the name is already on the page.
 */
const TEETH = 48;
const edge = Array.from({ length: TEETH * 2 }, (_, i) => {
  const r = i % 2 ? 93 : 99;
  const a = (i / (TEETH * 2)) * Math.PI * 2;
  return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

const rays = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  const p = (r) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  return `M${p(18)}L${p(52)}`;
}).join('');

export default function Seal({ className = '' }) {
  return (
    <svg className={`seal ${className}`} viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="seal-foil" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#F3E2A8" />
          <stop offset="0.45" stopColor="#C9A84C" />
          <stop offset="1" stopColor="#8E6F22" />
        </radialGradient>
        <path id="seal-rim-top" d="M0 67A67 67 0 1 1 0.01 67" />
        <path id="seal-rim-bottom" d="M0 -79A79 79 0 1 0 0.01 -79" />
      </defs>
      <polygon className="seal__wafer" points={edge} fill="url(#seal-foil)" />
      <g className="seal__die" fill="none">
        <circle r="86" strokeWidth="1.4" />
        <circle r="82.5" strokeWidth="0.6" />
        <circle r="61" strokeWidth="1.2" />
        <circle r="57.5" strokeWidth="0.6" />
        <path d={rays} strokeWidth="0.7" />
        <circle r="14" strokeWidth="1.2" />
        <path className="seal__star" d="M0 -9L2.6 -3 9 -3 3.8 1.2 5.8 7.6 0 3.8 -5.8 7.6 -3.8 1.2 -9 -3 -2.6 -3Z" />
      </g>
      <text className="seal__text">
        <textPath href="#seal-rim-top" startOffset="50%" textAnchor="middle">DAMANA CONSULT LTD</textPath>
      </text>
      <text className="seal__text seal__text--foot">
        <textPath href="#seal-rim-bottom" startOffset="50%" textAnchor="middle">DAR ES SALAAM</textPath>
      </text>
    </svg>
  );
}
