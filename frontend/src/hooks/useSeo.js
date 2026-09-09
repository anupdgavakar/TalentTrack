import { useEffect } from "react";
import { SITE_NAME, SITE_URL } from "../config/site";

function setMetaTag(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLinkTag(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets the document `<title>` plus the meta description, canonical link,
 * Open Graph and Twitter Card tags for whichever page calls it — every
 * public page shared one static title/description (from `index.html`)
 * before this phase, which is a real SEO problem: search engines and
 * social-share previews saw "Talent Track Technologies" for every single
 * URL. Each page now calls this with its own title/description once its
 * content (including any async-loaded data, e.g. a course title) is
 * known.
 *
 * A known limitation worth knowing about: this is a client-side SPA, so
 * these tags are set by JavaScript after the page loads, not present in
 * the initial HTML response. Google's crawler renders JavaScript and
 * picks these up fine, but simpler crawlers and most social-media
 * unfurl bots (Slack, WhatsApp, older Facebook/Twitter scrapers) don't
 * execute JS and will only ever see the static defaults baked into
 * `index.html`. Properly fixing that needs server-side rendering or
 * prerendering — a real architecture change, out of scope for this
 * phase's pass — so it's called out here rather than silently assumed
 * to be solved.
 *
 * @param {object} options
 * @param {string} [options.title] - Page-specific title; omitted uses the
 *   site name alone (e.g. the homepage). Otherwise rendered as
 *   "<title> | Talent Track Technologies".
 * @param {string} [options.description] - Meta description / OG description.
 * @param {string} [options.image] - Absolute image URL for social previews.
 * @param {"website"|"article"} [options.type] - og:type.
 * @param {boolean} [options.noindex] - Set for pages that shouldn't be
 *   indexed (login/register forms, 404s, a signed-in-only dashboard) —
 *   thin, private, or duplicate content with nothing for a search result
 *   to usefully point at.
 */
export default function useSeo({ title, description, image, type = "website", noindex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    setMetaTag("name", "description", description);
    setMetaTag("name", "robots", noindex ? "noindex, nofollow" : null);

    setMetaTag("property", "og:site_name", SITE_NAME);
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:url", SITE_URL + window.location.pathname);
    setMetaTag("property", "og:image", image);

    setMetaTag("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", image);

    // Skipped for noindex pages — a canonical link on a page you've also
    // told search engines not to index sends a mixed signal.
    setLinkTag("canonical", noindex ? null : SITE_URL + window.location.pathname);
  }, [title, description, image, type, noindex]);
}
