import Modal from "../ui/Modal";
import Button from "../ui/Button";

/**
 * Shared delete/confirm modal for the admin CRUD screens — used instead of
 * a native `window.confirm()` so it matches the rest of the admin UI and
 * can show a loading state while the delete request is in flight.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-6)" }}>{message}</p>
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
