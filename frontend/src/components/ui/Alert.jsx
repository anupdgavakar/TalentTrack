import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * Inline status message for form submissions and page-level feedback.
 * variant: "success" | "error" | "warning" | "info"
 */
export default function Alert({ variant = "info", children, className = "" }) {
  const Icon = ICONS[variant] || Info;
  return (
    <div className={`alert alert--${variant} ${className}`} role={variant === "error" ? "alert" : "status"}>
      <Icon size={20} className="alert__icon" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
