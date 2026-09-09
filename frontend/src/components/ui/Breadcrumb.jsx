import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * items: [{ label, to }] — the last item is rendered as plain (current)
 * text automatically, so callers don't need to omit `to` on it themselves.
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={item.label} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            {idx > 0 && (
              <span className="breadcrumb__sep">
                <ChevronRight size={14} aria-hidden="true" />
              </span>
            )}
            {isLast || !item.to ? (
              <span className="breadcrumb__current" aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="breadcrumb__link">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
