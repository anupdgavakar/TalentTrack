import { useState, useCallback } from "react";
import api from "../services/api";

/**
 * Shared submit/loading/success/error lifecycle for the site's public
 * forms — course enrollment, job application, and the three lead-capture
 * forms (Recruitment, Consulting, Contact). All of those endpoints are
 * public (no Sanctum CSRF-cookie dance needed, unlike AuthContext's
 * login/register), so this stays deliberately simple: POST the payload,
 * surface Laravel's validation `errors` object per-field, and let the
 * caller reset the form on success.
 */
export default function useSubmitForm(path) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const submit = useCallback(
    async (payload, { isMultipart = false } = {}) => {
      setSubmitting(true);
      setSuccess(null);
      setError(null);
      setFieldErrors({});
      try {
        const { data } = await api.post(
          path,
          payload,
          isMultipart ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
        );
        setSuccess(data.message);
        return data;
      } catch (err) {
        const response = err.response;
        setError(response?.data?.message || "Something went wrong — please try again.");
        setFieldErrors(response?.data?.errors || {});
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [path]
  );

  const reset = useCallback(() => {
    setSuccess(null);
    setError(null);
    setFieldErrors({});
  }, []);

  /** First message for a given field, Laravel's `errors` shape is `{ field: string[] }`. */
  const fieldError = useCallback((name) => fieldErrors[name]?.[0], [fieldErrors]);

  return { submit, submitting, success, error, fieldError, reset };
}
