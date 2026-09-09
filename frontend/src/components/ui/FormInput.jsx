/**
 * Labeled text input with built-in error/hint display. Every form in the
 * project (leads, applications, admin) should use this instead of a raw
 * <input> so validation states look and behave consistently.
 */
export default function FormInput({
  id,
  label,
  error,
  hint,
  required = false,
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
      <input
        id={id}
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
