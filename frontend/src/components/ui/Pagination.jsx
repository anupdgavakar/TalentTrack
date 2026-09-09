import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Numbered pagination with prev/next. Purely presentational — the caller
 * owns the current page state and passes onPageChange.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageWindow(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      {pages.map((page, idx) =>
        page === "…" ? (
          <span key={`ellipsis-${idx}`} className="pagination__btn" aria-hidden="true" style={{ border: "none", cursor: "default" }}>
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`pagination__btn${page === currentPage ? " pagination__btn--active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}

function getPageWindow(current, total) {
  const window = 1;
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - window && i <= current + window)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  return pages;
}
