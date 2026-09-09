/**
 * Labeled <textarea>, styled to match FormInput/Select.
 */
export default function Textarea({
  id,
  label,
  error,
  hint,
  required = false,
  rows = 5,
  className = "",
  ...rest
}) {
  return (
    <div className={`field${error ? " field--error" : ""} ${className}`}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
          {required && (
            <span className="field__required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className="field__control"
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} className="field__error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${id}-hint`} className="field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}
