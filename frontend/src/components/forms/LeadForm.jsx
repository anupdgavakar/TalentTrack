import { useState } from "react";
import FormInput from "../ui/FormInput";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import useSubmitForm from "../../hooks/useSubmitForm";

/**
 * Shared lead-capture form behind the Recruitment, Consulting and Contact
 * pages — all three post to the same `POST /api/leads` endpoint, and only
 * differ by the `type` value the backend uses to route/tag the enquiry
 * (see LeadRequest::rules(), `type` in ['recruitment','consulting',
 * 'training','placement','general']).
 */
export default function LeadForm({
  type,
  submitLabel = "Send Message",
  initialMessage = "",
  showCompany = false,
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: initialMessage });
  const { submit, submitting, success, error, fieldError } = useSubmitForm("/leads");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submit({ type, ...form });
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch {
      // fieldError()/error already reflect the failure — nothing else to do
    }
  };

  if (success) {
    return (
      <div className="form-card">
        <Alert variant="success">{success}</Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      {error && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <FormInput
        id={`${type}-name`}
        label="Full name"
        required
        value={form.name}
        onChange={update("name")}
        error={fieldError("name")}
      />
      <FormInput
        id={`${type}-email`}
        type="email"
        label="Email"
        required
        value={form.email}
        onChange={update("email")}
        error={fieldError("email")}
      />
      <FormInput
        id={`${type}-phone`}
        type="tel"
        label="Phone"
        value={form.phone}
        onChange={update("phone")}
        error={fieldError("phone")}
      />
      {showCompany && (
        <FormInput
          id={`${type}-company`}
          label="Company name"
          value={form.company}
          onChange={update("company")}
          error={fieldError("company")}
        />
      )}
      <Textarea
        id={`${type}-message`}
        label="Message"
        rows={4}
        value={form.message}
        onChange={update("message")}
        error={fieldError("message")}
      />

      <Button type="submit" variant="accent" block disabled={submitting}>
        {submitting ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
