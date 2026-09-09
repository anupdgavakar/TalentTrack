/**
 * stat: { icon, value, label }
 * Fed by an admin-managed statistics API from Phase 9/10 onward.
 */
export default function StatsCard({ icon: Icon, value, label }) {
  return (
    <div className="stats-card">
      <div className="stats-card__icon">
        <Icon size={22} aria-hidden="true" />
      </div>
      <div className="stats-card__value">{value}</div>
      <div className="stats-card__label">{label}</div>
    </div>
  );
}
