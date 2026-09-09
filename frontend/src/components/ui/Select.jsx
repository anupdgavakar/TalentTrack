/**
 * Labeled <select>. `options` is an array of { value, label }; pass a
 * `placeholder` to render a disabled leading option.
 */
export default function Select({
  id,
  label,
  error,
  hint,
  required = false,
  options = [],
  placeholder,
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
      <select
        id={id}
        className="field__control"
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        defaultValue=""
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
