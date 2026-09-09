import { useState } from "react";
import { Download, Inbox, GraduationCap, Briefcase } from "lucide-react";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import Alert from "../../../components/ui/Alert";
import FormInput from "../../../components/ui/FormInput";
import useCachedFetch from "../../../hooks/useCachedFetch";
import api from "../../../services/api";

const LEAD_TYPE_LABEL = {
  recruitment: "Recruitment",
  consulting: "Consulting",
  training: "Training",
  placement: "Placement",
  general: "General",
};

const LEAD_STATUS_LABEL = { new: "New", in_progress: "In Progress", converted: "Converted", closed: "Closed" };
const ENROLLMENT_STATUS_LABEL = { new: "New", contacted: "Contacted", enrolled: "Enrolled", rejected: "Rejected" };
const APPLICATION_STATUS_LABEL = {
  new: "New",
  shortlisted: "Shortlisted",
  interview: "Interview",
  placed: "Placed",
  rejected: "Rejected",
};

function BreakdownGrid({ counts, labels }) {
  return (
    <div className="admin-stat-grid">
      {Object.entries(labels).map(([key, label]) => (
        <div className="admin-stat-card" key={key}>
          <div>
            <div className="admin-stat-card__value">{counts?.[key] ?? 0}</div>
            <div className="admin-stat-card__label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Summary counts + a CSV export — see docs/PHASE_PLAN.md's Phase 10 section
// for why this stayed at numbers-and-a-download rather than charts.
export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();

  const { data, loading, error } = useCachedFetch(`/admin/reports/summary${query ? `?${query}` : ""}`);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const response = await api.get(`/admin/reports/leads/export${query ? `?${query}` : ""}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Couldn't export the CSV — please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Reports</h1>
          <p>Lead, enrollment and application counts, optionally filtered to a date range.</p>
        </div>
      </div>

      <div className="admin-report-range">
        <FormInput
          id="report-from"
          type="date"
          label="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <FormInput id="report-to" type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} />
        {(from || to) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            Clear range
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {exportError && <Alert variant="error">{exportError}</Alert>}

      {loading && <Loader center label="Loading report…" />}

      {!loading && !error && data && (
        <>
          <div className="admin-report-section">
            <div className="admin-panel__header">
              <h2>
                <Inbox size={18} aria-hidden="true" style={{ verticalAlign: "-3px", marginRight: "8px" }} />
                Leads — {data.leads.total} total
              </h2>
              <Button variant="outline" size="sm" icon={Download} iconPosition="left" onClick={handleExport} disabled={exporting}>
                {exporting ? "Exporting…" : "Export CSV"}
              </Button>
            </div>
            <p className="admin-panel__hint">By type</p>
            <BreakdownGrid counts={data.leads.by_type} labels={LEAD_TYPE_LABEL} />
            <p className="admin-panel__hint" style={{ marginTop: "var(--space-6)" }}>
              By status
            </p>
            <BreakdownGrid counts={data.leads.by_status} labels={LEAD_STATUS_LABEL} />
          </div>

          <div className="admin-report-section">
            <h2>
              <GraduationCap size={18} aria-hidden="true" style={{ verticalAlign: "-3px", marginRight: "8px" }} />
              Course Enrollments — {data.enrollments.total} total
            </h2>
            <BreakdownGrid counts={data.enrollments.by_status} labels={ENROLLMENT_STATUS_LABEL} />
          </div>

          <div className="admin-report-section">
            <h2>
              <Briefcase size={18} aria-hidden="true" style={{ verticalAlign: "-3px", marginRight: "8px" }} />
              Job Applications — {data.applications.total} total
            </h2>
            <BreakdownGrid counts={data.applications.by_status} labels={APPLICATION_STATUS_LABEL} />
          </div>
        </>
      )}
    </>
  );
}
