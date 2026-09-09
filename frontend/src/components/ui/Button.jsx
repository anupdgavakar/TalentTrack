import { Link } from "react-router-dom";

/**
 * Shared CTA/action button. Renders a react-router <Link> when `to` is
 * given, a plain <a> when `href` is given, otherwise a real <button>.
 *
 * variant: "primary" | "accent" | "outline" | "outline-inverse" | "ghost"
 * size: "sm" | "md" | "lg"
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  type = "button",
  block = false,
  icon: Icon,
  iconPosition = "right",
  className = "",
  ...rest
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size !== "md" ? `btn--${size}` : "",
    block ? "btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon size={18} aria-hidden="true" />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={18} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
