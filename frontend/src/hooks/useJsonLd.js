import { useEffect } from "react";

/**
 * Injects (and cleans up) a `<script type="application/ld+json">` tag
 * holding structured data for search engines — Organization sitewide,
 * Course/JobPosting on their detail pages (Phase 12). `id` must be unique
 * per concurrently-mounted script (e.g. "org-schema", "course-schema") so
 * this can safely coexist with others without clobbering them.
 *
 * Pass `data: null` (e.g. while the page's own data is still loading) to
 * skip rendering anything for that render — nothing is written until
 * there's real content to describe.
 */
export default function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) return undefined;

    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);

    return () => {
      el?.remove();
    };
  }, [id, data]);
}
