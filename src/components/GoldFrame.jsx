import './GoldFrame.css';

/**
 * GoldFrame wraps any content in four decorative gold corner brackets.
 * The corners are purely CSS pseudo-elements positioned at each corner of
 * the wrapper div. Pass an extra className to control sizing or spacing.
 */
export default function GoldFrame({ children, className = '' }) {
  return (
    <div className={`gold-frame-wrap ${className}`}>
      {/* One div per corner: top-left, top-right, bottom-left, bottom-right */}
      <div className="gf-corner gf-tl" />
      <div className="gf-corner gf-tr" />
      <div className="gf-corner gf-bl" />
      <div className="gf-corner gf-br" />
      {children}
    </div>
  );
}
