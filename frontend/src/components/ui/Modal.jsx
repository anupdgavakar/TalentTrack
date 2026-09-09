import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: closes on Escape or overlay click, locks body scroll
 * while open, and (Phase 12) traps Tab focus inside the dialog and returns
 * it to whatever triggered the modal once it closes — before this, Tab
 * could walk a keyboard/screen-reader user straight out of the dialog into
 * the page behind it, and closing the modal left focus wherever it last
 * was (often nowhere, if the trigger itself had been removed from the DOM
 * in the meantime, e.g. a deleted table row).
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember what had focus so it can be restored on close, and move
    // focus into the dialog itself so screen readers announce it and Tab
    // starts from inside rather than wherever focus happened to be.
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Cycle Tab/Shift+Tab back around within the dialog instead of
      // letting it escape into the page behind the overlay.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      // The trigger may have been removed from the DOM while the modal was
      // open (e.g. this was a delete-confirmation for a row that's now
      // gone) — .focus?.() on a detached element is a safe no-op, so focus
      // just falls back to the browser default (usually <body>) instead.
      triggerRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
          <X size={18} aria-hidden="true" />
        </button>
        {title && (
          <h3 id="modal-title" className="modal__title">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}
