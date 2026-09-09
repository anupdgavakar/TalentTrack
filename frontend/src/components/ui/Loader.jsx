/**
 * Small inline/centered loading indicator for async data (course lists,
 * job lists, dashboard widgets, etc.).
 */
export default function Loader({ label = "Loading…", center = false }) {
  return (
    <div className={`loader${center ? " loader--center" : ""}`} role="status">
      <span className="loader__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
