import { useRef } from "react";
import { Bold, Italic, List, ListOrdered, Undo2, Redo2 } from "lucide-react";

const COMMANDS = [
  { command: "bold", Icon: Bold, label: "Bold" },
  { command: "italic", Icon: Italic, label: "Italic" },
  { command: "insertUnorderedList", Icon: List, label: "Bulleted list" },
  { command: "insertOrderedList", Icon: ListOrdered, label: "Numbered list" },
];

const HISTORY_COMMANDS = [
  { command: "undo", Icon: Undo2, label: "Undo" },
  { command: "redo", Icon: Redo2, label: "Redo" },
];

/**
 * A small rich-text editor for the long-form "body" fields that benefit
 * from real formatting — the About page Introduction, the Contact page
 * "Get in touch" blurb — so an admin can make a proper bulleted list (the
 * "Our Key Services" checkmarks that used to be typed by hand as ✅
 * characters) instead of relying on plain text plus a CSS line-break
 * fallback.
 *
 * Deliberately built on a plain contentEditable div and the browser's own
 * execCommand rather than pulling in a rich-text library: this project has
 * consistently preferred what the platform already does over a new
 * dependency (the homepage's logo strip is a CSS marquee, not a carousel
 * library; the course carousel is CSS scroll-snap). execCommand is old and
 * only covers basic formatting, but basic formatting — bold, italic,
 * bulleted/numbered lists, line breaks — is exactly the level asked for
 * here.
 *
 * Stores and returns real HTML through `onChange` (the field's raw value
 * becomes e.g. "<p>...</p><ul><li>...</li></ul>" instead of plain text).
 * See utils/renderBody.js for how the public pages render that safely
 * alongside older rows that still hold plain text from before this editor
 * existed.
 *
 * This field is only ever written by an authenticated admin (the same
 * trust level already given to other admin-supplied content on this site
 * — image URLs, button links — which isn't sanitized either), so its
 * output is rendered as-is rather than run through an HTML sanitizer.
 *
 * Uncontrolled by design. contentEditable fights being kept in sync with
 * external state on every keystroke (it resets the cursor position), so
 * this component only ever reads `initialValue` once, on mount — the
 * parent should force a remount (a `key` prop) when the value needs to
 * change from outside, e.g. switching which row is being edited.
 * PageSectionManager does exactly that.
 */
export default function RichTextEditor({ id, label, initialValue, onChange, error, hint }) {
  const ref = useRef(null);

  const emitChange = () => onChange(ref.current?.innerHTML || "");

  const runCommand = (command) => (e) => {
    e.preventDefault(); // keep focus (and the text selection) in the editor
    document.execCommand(command);
    ref.current?.focus();
    emitChange();
  };

  return (
    <div className={`field${error ? " field--error" : ""}`}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      )}
      <div className="rich-text-editor">
        <div className="rich-text-editor__toolbar" role="toolbar" aria-label={`${label || "Text"} formatting`}>
          {COMMANDS.map(({ command, Icon, label: cmdLabel }) => (
            <button
              key={command}
              type="button"
              className="rich-text-editor__btn"
              onMouseDown={runCommand(command)}
              aria-label={cmdLabel}
              title={cmdLabel}
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
          <span className="rich-text-editor__divider" aria-hidden="true" />
          {HISTORY_COMMANDS.map(({ command, Icon, label: cmdLabel }) => (
            <button
              key={command}
              type="button"
              className="rich-text-editor__btn"
              onMouseDown={runCommand(command)}
              aria-label={cmdLabel}
              title={cmdLabel}
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div
          id={id}
          ref={ref}
          className="rich-text-editor__area"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          dangerouslySetInnerHTML={{ __html: initialValue || "" }}
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>
      {error && (
        <span className="field__error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}
