import { useState, useEffect } from "react";
import FormInput from "../../../components/ui/FormInput";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import Loader from "../../../components/ui/Loader";
import useFetch from "../../../hooks/useFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";

// Every key here is optional as far as the backend's concerned
// (Admin\UpdateSettingsRequest accepts any key/value pair) — this is just
// the fixed set the admin UI exposes fields for. footer_* / social_*_url
// are also the public-facing subset (Setting::PUBLIC_KEYS) read by
// GET /settings/public and rendered in Footer.jsx; admin_notification_email
// isn't public — it's read by App\Services\AdminNotifier (Phase 11) to
// decide who gets emailed about new leads/enrollments/applications.
const FIELDS = [
  {
    section: "Contact Info",
    hint: "Shown in the site footer.",
    keys: [
      { key: "footer_address", label: "Office address", type: "textarea" },
      { key: "footer_phone", label: "Phone", type: "text" },
      { key: "footer_email", label: "Email", type: "email" },
    ],
  },
  {
    section: "Social Links",
    hint: "Shown as icons in the site footer. Leave blank to hide an icon.",
    keys: [
      { key: "social_facebook_url", label: "Facebook URL", type: "url" },
      { key: "social_instagram_url", label: "Instagram URL", type: "url" },
      { key: "social_linkedin_url", label: "LinkedIn URL", type: "url" },
      { key: "social_youtube_url", label: "YouTube URL", type: "url" },
    ],
  },
  {
    section: "Notifications",
    hint: "Who gets emailed when a new lead, course enrollment, or job application comes in from the public site.",
    keys: [
      {
        key: "admin_notification_email",
        label: "Notify this address",
        type: "email",
        multiple: true,
        hint: "One or more email addresses, separated by commas.",
      },
    ],
  },
  {
    section: "Floating Buttons",
    hint: "The \"Get Job\" tab and the Call / WhatsApp bubbles shown on every public page. Each one can be turned off independently — see components/marketing/FloatingContactButtons.jsx.",
    keys: [
      { key: "whatsapp_number", label: "WhatsApp number", type: "text", hint: 'Include the country code, e.g. "+91 87884 20795". Leave blank to use the Phone number above instead.' },
      { key: "show_get_job_button", label: "Show \"Get Job\" tab", type: "checkbox" },
      { key: "show_whatsapp_button", label: "Show WhatsApp button", type: "checkbox" },
      { key: "show_call_button", label: "Show Call button", type: "checkbox" },
      {
        key: "get_job_whatsapp_message",
        label: "\"Get Job\" WhatsApp message",
        type: "textarea",
        hint: "Pre-filled into WhatsApp when a visitor taps the \"Get Job\" tab.",
      },
    ],
  },
];

const ALL_FIELDS = FIELDS.flatMap((section) => section.keys);
const ALL_KEYS = ALL_FIELDS.map((f) => f.key);
// Checkbox settings are stored server-side the same way every other
// setting is — a plain string value ("1"/"0") in the same key/value table
// — but edited in the form as a real boolean, so they need converting on
// the way in (string -> boolean, defaulting to "on" the same way
// FloatingContactButtons.jsx does) and back out (boolean -> "1"/"0")
// rather than passing straight through like the text/email/textarea
// fields already do.
const CHECKBOX_KEYS = new Set(ALL_FIELDS.filter((f) => f.type === "checkbox").map((f) => f.key));

export default function SettingsPage() {
  const { data, loading, error, refetch } = useFetch("/admin/settings");

  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm(
      Object.fromEntries(
        ALL_KEYS.map((key) => [key, CHECKBOX_KEYS.has(key) ? data[key] !== "0" : data[key] ?? ""])
      )
    );
  }, [data]);

  const update = (key) => (e) => {
    setSuccess(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };
  const updateChecked = (key) => (e) => {
    setSuccess(false);
    setForm((f) => ({ ...f, [key]: e.target.checked }));
  };
  const fieldError = (name) => fieldErrors[`settings.${name}`]?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSaveError(null);
    setFieldErrors({});
    setSuccess(false);
    try {
      const settings = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, CHECKBOX_KEYS.has(key) ? (value ? "1" : "0") : value])
      );
      await api.put("/admin/settings", { settings });
      invalidate("/admin/settings");
      // The public footer reads these same keys via GET /settings/public —
      // nothing caches that on the frontend, but Setting::get() is
      // write-through cached server-side and already clears itself on save.
      refetch();
      setSuccess(true);
    } catch (err) {
      const response = err.response;
      setSaveError(response?.data?.message || "Something went wrong — please try again.");
      setFieldErrors(response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader center label="Loading settings…" />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Settings</h1>
          <p>Site-wide contact info and social links, used across the public site.</p>
        </div>
      </div>

      {saveError && (
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Alert variant="error">{saveError}</Alert>
        </div>
      )}
      {success && (
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Alert variant="success">Settings saved.</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {FIELDS.map((section) => (
          <div className="admin-panel" style={{ marginBottom: "var(--space-6)" }} key={section.section}>
            <div className="admin-panel__header">
              <h2>{section.section}</h2>
            </div>
            <p className="admin-panel__hint">{section.hint}</p>

            <div className="admin-form-grid">
              {section.keys.map(({ key, label, type, hint, multiple }) =>
                type === "textarea" ? (
                  <Textarea
                    key={key}
                    id={`setting-${key}`}
                    label={label}
                    rows={2}
                    hint={hint}
                    className="admin-form-grid__span-2"
                    value={form[key] ?? ""}
                    onChange={update(key)}
                    error={fieldError(key)}
                  />
                ) : type === "checkbox" ? (
                  <label className="admin-checkbox" key={key} style={{ alignSelf: "center" }}>
                    <input type="checkbox" checked={Boolean(form[key])} onChange={updateChecked(key)} />
                    {label}
                  </label>
                ) : (
                  <FormInput
                    key={key}
                    id={`setting-${key}`}
                    type={type}
                    label={label}
                    hint={hint}
                    multiple={multiple}
                    value={form[key] ?? ""}
                    onChange={update(key)}
                    error={fieldError(key)}
                  />
                )
              )}
            </div>
          </div>
        ))}

        <div className="admin-form-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </form>
    </>
  );
}
