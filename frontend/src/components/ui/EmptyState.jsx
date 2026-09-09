import { Inbox } from "lucide-react";

/**
 * Shown instead of an empty list/table — "no jobs match your filters",
 * "no leads yet", etc. — instead of a blank space.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing to show yet",
  description,
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon size={26} aria-hidden="true" />
      </div>
      <p className="empty-state__title">{title}</p>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
