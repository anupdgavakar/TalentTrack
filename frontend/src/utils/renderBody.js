/**
 * Renders an admin-authored "body" field for display, whether it was saved
 * by the plain Textarea this project used everywhere until now, or by the
 * new RichTextEditor (see components/admin/RichTextEditor.jsx) wired into
 * the "Introduction" and "Get in touch" blocks.
 *
 * The two formats need different treatment:
 *  - Old rows hold plain text, with a blank line as the only paragraph
 *    break an admin typing into a Textarea could signal. That's what
 *    AboutPage.jsx's old renderParagraphs() handled, and what pages.css's
 *    `.prose p { white-space: pre-line }` handles for single line breaks
 *    within one paragraph.
 *  - Rows saved through the rich editor hold real HTML
 *    ("<p>...</p><ul><li>...</li></ul>") that should be rendered as-is.
 *
 * A row is treated as rich HTML the moment it *contains* an HTML tag —
 * which is exactly when it was saved through the new editor (a plain
 * Textarea has no way to produce a "<" followed by a tag name). Until an
 * admin re-saves a given field through the new editor, it keeps rendering
 * the old way; nothing needs a one-time migration.
 *
 * Returns an object with `__html`, meant to be spread onto
 * dangerouslySetInnerHTML — see the trust-boundary note in
 * RichTextEditor.jsx for why this isn't run through a sanitizer: this
 * content only ever comes from an authenticated admin.
 */
const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Mirrors the old renderParagraphs(): blank line = new paragraph, single
// line break within a paragraph is preserved as a <br>.
function plainTextToHtml(text) {
  return (text || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function renderBody(text) {
  const value = text || "";
  const html = HTML_TAG_PATTERN.test(value) ? value : plainTextToHtml(value);
  return { __html: html };
}
