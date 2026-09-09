import { useState } from "react";
import { Inbox, Eye } from "lucide-react";
import Loader from "../../../components/ui/Loader";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import Modal from "../../../components/ui/Modal";
import useCachedFetch from "../../../hooks/useCachedFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
];

const STATUS_OPTIONS = ["new", "in_progress", "converted", "closed"];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "recruitment", label: "Recruitment" },
  { value: "consulting", label: "Consulting" },
  { value: "training", label: "Training" },
  { value: "placement", label: "Placement" },
  { value: "general", label: "General" },
];

const TYPE_LABEL = Object.fromEntries(TYPE_OPTIONS.map((t) => [t.value, t.label]));

// Every lead submitted from the Recruitment, Consulting, Training (course
// enquiry) and general Contact forms lands here — one shared pipeline
// rather than a screen per source, since `type` already tells them apart
// (see LeadRequest's docblock).
export default function LeadsListPage() {
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);

  const path = `/admin/leads?page=${page}${status ? `&status=${status}` : ""}${type ? `&type=${type}` : ""}`;
  const { data, loading, error, refetch } = useCachedFetch(path);
  const leads = data?.items || [];
  const meta = data?.meta;

  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const handleStatusChange = async (lead, newStatus) => {
    setUpdatingId(lead.id);
    setUpdateError(null);
    try {
      await api.put(`/admin/leads/${lead.id}`, { status: newStatus });
      invalidate("/admin/leads");
      invalidate("/admin/reports");
      refetch();
      setViewing((v) => (v && v.id === lead.id ? { ...v, status: newStatus } : v));
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Couldn't update the status — please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const changeTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  const changeType = (e) => {
    setType(e.target.value);
    setPage(1);
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Leads</h1>
          <p>Enquiries from the Recruitment, Consulting, Training and Contact forms on the public site.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`admin-tabs__tab${status === tab.value ? " is-active" : ""}`}
              onClick={() => changeTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="admin-toolbar__filter">
          Type
          <select className="admin-status-select" value={type} onChange={changeType} aria-label="Filter by lead type">
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {updateError && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <Alert variant="error">{updateError}</Alert>
        </div>
      )}

      {loading && <Loader center label="Loading leads…" />}

      {!loading && !error && leads.length === 0 && (
        <EmptyState icon={Inbox} title="No leads here" description="Nothing matches this filter yet." />
      )}

      {!loading && !error && leads.length > 0 && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>Message</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="admin-table__title">{lead.name}</td>
                    <td>{TYPE_LABEL[lead.type] || lead.type}</td>
                    <td>
                      <div>{lead.email}</div>
                      {lead.phone && <div className="admin-table__muted">{lead.phone}</div>}
                    </td>
                    <td>{lead.company || "—"}</td>
                    <td className="admin-table__message-cell">{lead.message || "—"}</td>
                    <td className="admin-table__muted">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                        aria-label={`Status for ${lead.name}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-table__icon-btn"
                        onClick={() => setViewing(lead)}
                        aria-label={`View full enquiry from ${lead.name}`}
                      >
                        <Eye size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div style={{ marginTop: "var(--space-8)" }}>
              <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <Modal isOpen={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? `Enquiry from ${viewing.name}` : ""}>
        {viewing && (
          <div className="admin-lead-detail">
            <dl>
              <div>
                <dt>Type</dt>
                <dd>{TYPE_LABEL[viewing.type] || viewing.type}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{viewing.email}</dd>
              </div>
              {viewing.phone && (
                <div>
                  <dt>Phone</dt>
                  <dd>{viewing.phone}</dd>
                </div>
              )}
              {viewing.company && (
                <div>
                  <dt>Company</dt>
                  <dd>{viewing.company}</dd>
                </div>
              )}
              {viewing.source && (
                <div>
                  <dt>Source</dt>
                  <dd>{viewing.source}</dd>
                </div>
              )}
              <div>
                <dt>Submitted</dt>
                <dd>{new Date(viewing.created_at).toLocaleString()}</dd>
              </div>
            </dl>
            <p className="admin-lead-detail__message">{viewing.message || "No message provided."}</p>

            <label className="admin-toolbar__filter" style={{ marginTop: "var(--space-5)" }}>
              Status
              <select
                className="admin-status-select"
                value={viewing.status}
                disabled={updatingId === viewing.id}
                onChange={(e) => handleStatusChange(viewing, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
