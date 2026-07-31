// AdminTicketDetail.jsx
// Read-only detail view for a single ticket, linked from AdminTickets'
// "View" button. Mirrors UserJobDetail's layout, admin-facing: shows the
// customer's contact info instead of a rating form, and links to Edit.

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./TechnicianShared.css";
import "./UserAppointmentDetail.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

function badgeClass(status) {
  switch (status) {
    case "Open":
      return "badge open";
    case "In Progress":
      return "badge inprogress";
    case "Pending":
      return "badge pending";
    case "Completed":
      return "badge completed";
    default:
      return "badge";
  }
}

const AdminTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Ticket not found.");
      } else {
        setError("Failed to load this ticket. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this ticket? This can't be undone.")) return;

    setDeleting(true);

    try {
      await axios.delete(`${API_BASE_URL}/api/tickets/${id}`);
      navigate("/admintickets");
    } catch (err) {
      console.error(err);
      setDeleting(false);
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
          <button className="back-link" onClick={() => navigate("/admintickets")}>
            ← Back to Tickets
          </button>
          <h1>{ticket.ticket_code}</h1>
          <p>Opened {new Date(ticket.created_at).toLocaleDateString()}</p>
        </div>
        <span className={badgeClass(ticket.status)}>{ticket.status}</span>
      </div>

      <div className="detail-grid">

        <div className="tech-panel detail-card">
          <h3>Repair</h3>

          <div className="detail-row">
            <span>Customer</span>
            <strong>{ticket.customer_name}</strong>
          </div>

          {ticket.customer_email && (
            <div className="detail-row">
              <span>Email</span>
              <strong>
                <a href={`mailto:${ticket.customer_email}`}>{ticket.customer_email}</a>
              </strong>
            </div>
          )}

          {ticket.customer_phone && (
            <div className="detail-row">
              <span>Phone</span>
              <strong>{ticket.customer_phone}</strong>
            </div>
          )}

          <div className="detail-row">
            <span>Device</span>
            <strong>{ticket.device || "—"}</strong>
          </div>

          <div className="detail-row">
            <span>Issue</span>
            <strong>{ticket.issue}</strong>
          </div>

          <div className="detail-row">
            <span>Priority</span>
            <strong>{ticket.priority}</strong>
          </div>

          <div className="detail-row">
            <span>Amount</span>
            <strong>{ticket.amount ? `$${Number(ticket.amount).toFixed(2)}` : "Not billed yet"}</strong>
          </div>

          <div className="detail-row">
            <span>Last updated</span>
            <strong>{new Date(ticket.updated_at).toLocaleString()}</strong>
          </div>
        </div>

        <div className="tech-panel detail-card">
          <h3>Technician</h3>

          {ticket.technician_name ? (
            <>
              <div className="detail-row">
                <span>Name</span>
                <strong>{ticket.technician_name}</strong>
              </div>

              {ticket.technician_email && (
                <div className="detail-row">
                  <span>Email</span>
                  <strong>
                    <a href={`mailto:${ticket.technician_email}`}>{ticket.technician_email}</a>
                  </strong>
                </div>
              )}

              {ticket.technician_phone && (
                <div className="detail-row">
                  <span>Phone</span>
                  <strong>{ticket.technician_phone}</strong>
                </div>
              )}
            </>
          ) : (
            <p className="dashboard-empty">Not assigned yet.</p>
          )}

          <h3 className="section-gap">Customer Rating</h3>

          {ticket.existing_rating ? (
            <>
              <span className="rating-stars large">
                {"★".repeat(ticket.existing_rating)}{"☆".repeat(5 - ticket.existing_rating)}
              </span>
              {ticket.existing_rating_comment && (
                <p className="rating-comment">"{ticket.existing_rating_comment}"</p>
              )}
            </>
          ) : (
            <p className="dashboard-empty">No rating yet.</p>
          )}
        </div>

      </div>

      <div className="detail-actions row-actions">
        <Link to={`/admin/tickets/edit/${ticket.id}`} className="tech-action-btn primary">
          Edit Ticket
        </Link>

        <button
          className="tech-action-btn danger"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? "Deleting..." : "Delete Ticket"}
        </button>
      </div>

    </div>
  );
};

export default AdminTicketDetail;
