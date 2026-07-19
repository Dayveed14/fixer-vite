// TechnicianJobs.jsx
// Assigned Jobs — the technician's repair work queue (tickets table).
// This is the "action" page: update status, mark a job complete with a final amount.

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./TechnicianShared.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

const STATUS_OPTIONS = ["Open", "In Progress", "Pending", "Completed"];

const TABS = [
  { key: "All", label: "All" },
  { key: "Open", label: "Open" },
  { key: "In Progress", label: "In Progress" },
  { key: "Pending", label: "Pending" },
  { key: "Completed", label: "Completed" },
];

function statusClass(status) {
  return status.replace(/\s+/g, "").toLowerCase();
}

const TechnicianJobs = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  const [openRowId, setOpenRowId] = useState(null);
  const [formStatus, setFormStatus] = useState("Open");
  const [formAmount, setFormAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTickets = async () => {
    if (!user?.id) {
      setError("You need to be logged in to view your jobs.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/tickets`, {
        params: { technician_id: user.id },
      });

      setTickets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c = { All: tickets.length };
    for (const t of tickets) {
      c[t.status] = (c[t.status] || 0) + 1;
    }
    return c;
  }, [tickets]);

  const filtered = useMemo(() => {
    if (activeTab === "All") return tickets;
    return tickets.filter((t) => t.status === activeTab);
  }, [tickets, activeTab]);

  const openManage = (ticket) => {
    if (openRowId === ticket.id) {
      setOpenRowId(null);
      return;
    }
    setOpenRowId(ticket.id);
    setFormStatus(ticket.status);
    setFormAmount(ticket.amount ?? "");
    setFormError("");
  };

  const handleSave = async (ticket) => {
    if (formStatus === "Completed" && (formAmount === "" || Number(formAmount) < 0)) {
      setFormError("Enter a valid amount to mark this job as completed.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await axios.patch(`${API_BASE_URL}/api/tickets/${ticket.id}/status`, {
        status: formStatus,
        amount: formAmount === "" ? null : Number(formAmount),
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticket.id
            ? { ...t, status: formStatus, amount: formAmount === "" ? null : Number(formAmount) }
            : t,
        ),
      );

      setOpenRowId(null);
    } catch (err) {
      console.error(err);
      setFormError("Couldn't save that update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const quickComplete = (ticket) => {
    setOpenRowId(ticket.id);
    setFormStatus("Completed");
    setFormAmount(ticket.amount ?? "");
    setFormError("");
  };

  if (loading) {
    return (
      <div className="tech-page">
        <p className="dashboard-loading">Loading your jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-page">
        <p className="dashboard-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="tech-page">

      <div className="tech-page-header">
        <div>
          <h1>Assigned Jobs</h1>
          <p>Every repair ticket assigned to you. Update the status as you work, and mark a job complete once it's done.</p>
        </div>
      </div>

      <div className="tech-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tech-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="count">({counts[tab.key] || 0})</span>
          </button>
        ))}
      </div>

      <div className="tech-panel">

        {filtered.length === 0 ? (
          <p className="dashboard-empty">No jobs in this category.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Device / Issue</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <>
                  <tr key={job.id}>
                    <td className="cell-primary">{job.ticket_code}</td>
                    <td>
                      {job.customer_name}
                      {job.customer_phone && <div className="cell-sub">{job.customer_phone}</div>}
                    </td>
                    <td>
                      {job.device || "—"}
                      {job.issue && <div className="cell-sub">{job.issue}</div>}
                    </td>
                    <td>
                      <span className={`badge ${job.priority.toLowerCase()}`}>{job.priority}</span>
                    </td>
                    <td>
                      <span className={`badge ${statusClass(job.status)}`}>{job.status}</span>
                    </td>
                    <td>{job.amount ? `$${Number(job.amount).toFixed(2)}` : "—"}</td>
                    <td>
                      {job.existing_rating ? (
                        <span className="rating-stars">{"★".repeat(job.existing_rating)}{"☆".repeat(5 - job.existing_rating)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="tech-action-btn" onClick={() => openManage(job)}>
                          {openRowId === job.id ? "Close" : "Manage"}
                        </button>
                        {job.status !== "Completed" && (
                          <button className="tech-action-btn primary" onClick={() => quickComplete(job)}>
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {openRowId === job.id && (
                    <tr className="manage-row" key={`${job.id}-manage`}>
                      <td colSpan={8}>
                        <div className="manage-form">

                          <div className="manage-field">
                            <label>Status</label>
                            <select
                              value={formStatus}
                              onChange={(e) => setFormStatus(e.target.value)}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          <div className="manage-field">
                            <label>Amount ($){formStatus === "Completed" ? " — required" : " — optional"}</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formAmount}
                              onChange={(e) => setFormAmount(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>

                          <button
                            className="tech-action-btn primary"
                            disabled={saving}
                            onClick={() => handleSave(job)}
                          >
                            {saving ? "Saving..." : "Save Update"}
                          </button>

                          {formError && <p className="manage-error">{formError}</p>}

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
};

export default TechnicianJobs;
