// AdminTicketEdit.jsx
// Full edit form for a ticket — issue, device, priority, status, amount,
// and technician assignment. Hits PATCH /api/tickets/:id (the admin
// full-edit endpoint), distinct from the technician's status-only one.

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./TechnicianShared.css";
import "./UserAppointmentDetail.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

const STATUS_OPTIONS = ["Open", "In Progress", "Pending", "Completed"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

const AdminTicketEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    issue: "",
    device: "",
    priority: "Medium",
    status: "Open",
    amount: "",
    technician_id: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [ticketRes, techRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/tickets/${id}`),
          axios.get(`${API_BASE_URL}/api/users/technicians`),
        ]);

        if (cancelled) return;

        const ticket = ticketRes.data;

        setForm({
          customer_name: ticket.customer_name || "",
          issue: ticket.issue || "",
          device: ticket.device || "",
          priority: ticket.priority || "Medium",
          status: ticket.status || "Open",
          amount: ticket.amount ?? "",
          technician_id: ticket.technician_id || "",
        });

        setTechnicians(techRes.data);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError("Ticket not found.");
          } else {
            setError("Failed to load this ticket. Please try again.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    if (!form.customer_name.trim() || !form.issue.trim()) {
      setSaveError("Customer name and issue are required.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      await axios.patch(`${API_BASE_URL}/api/tickets/${id}`, {
        customer_name: form.customer_name.trim(),
        issue: form.issue.trim(),
        device: form.device.trim() || null,
        priority: form.priority,
        status: form.status,
        amount: form.amount === "" ? null : Number(form.amount),
        technician_id: form.technician_id || null,
      });

      navigate(`/admin/tickets/${id}`);
    } catch (err) {
      console.error(err);
      setSaveError("Couldn't save these changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="tech-page">
        <p className="dashboard-loading">Loading ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-page">
        <p className="dashboard-error">{error}</p>
        <Link to="/admintickets" className="tech-action-btn">Back to Tickets</Link>
      </div>
    );
  }

  return (
    <div className="tech-page">

      <div className="tech-page-header">
        <div>
          <button className="back-link" onClick={() => navigate(`/admin/tickets/${id}`)}>
            ← Back to Ticket
          </button>
          <h1>Edit Ticket</h1>
          <p>Update the details of this repair job.</p>
        </div>
      </div>

      <div className="tech-panel edit-form-panel">

        <div className="edit-form-grid">

          <div className="manage-field">
            <label>Customer Name</label>
            <input
              type="text"
              value={form.customer_name}
              onChange={(e) => updateField("customer_name", e.target.value)}
            />
          </div>

          <div className="manage-field">
            <label>Device</label>
            <input
              type="text"
              value={form.device}
              onChange={(e) => updateField("device", e.target.value)}
              placeholder="e.g. MacBook Pro 14&quot;"
            />
          </div>

          <div className="manage-field full-width">
            <label>Issue</label>
            <textarea
              className="rating-textarea"
              value={form.issue}
              onChange={(e) => updateField("issue", e.target.value)}
            />
          </div>

          <div className="manage-field">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => updateField("priority", e.target.value)}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="manage-field">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="manage-field">
            <label>Technician</label>
            <select
              value={form.technician_id}
              onChange={(e) => updateField("technician_id", e.target.value)}
            >
              <option value="">Unassigned</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="manage-field">
            <label>Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="0.00"
            />
          </div>

        </div>

        {saveError && <p className="manage-error">{saveError}</p>}

        <div className="row-actions edit-form-actions">
          <button
            className="tech-action-btn primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            className="tech-action-btn"
            onClick={() => navigate(`/admin/tickets/${id}`)}
          >
            Cancel
          </button>
        </div>

      </div>

    </div>
  );
};

export default AdminTicketEdit;
