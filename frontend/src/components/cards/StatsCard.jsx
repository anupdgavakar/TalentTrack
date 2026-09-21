import useCountUp from "../../hooks/useCountUp";

/**
 * stat: { icon, value, label }
 * Fed by an admin-managed statistics API from Phase 9/10 onward.
 *
 * The number counts up from 0 to `value` once the card scrolls into view
 * (see useCountUp) — a one-time reveal each time the card mounts, not a
 * repeating animation, and it's skipped entirely for reduced-motion
 * visitors or a value that isn't a plain "<number><suffix>" shape.
 */
export default function StatsCard({ icon: Icon, value, label }) {
  const [ref, display] = useCountUp(value);

  return (
    <div className="stats-card" ref={ref}>
      <div className="stats-card__icon">
        <Icon size={22} aria-hidden="true" />
      </div>
      <div className="stats-card__value">{display}</div>
      <div className="stats-card__label">{label}</div>
    </div>
  );
}
