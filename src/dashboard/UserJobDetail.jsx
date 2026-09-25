// UserJobDetail.jsx
// Detail view for a single repair ticket, linked from UserAppointments'
// "View" button on job rows. Lets the customer leave a rating once the
// job is completed and hasn't been rated yet.

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./TechnicianShared.css";
import "./UserAppointmentDetail.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://fixer-backend-7mng.onrender.com";

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

const UserJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Job not found.");
      } else {
        setError("Failed to load this job. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitRating = async () => {
    if (ratingValue < 1) {
      setRatingError("Pick a star rating first.");
      return;
    }

    setSubmittingRating(true);
    setRatingError("");

    try {
      await axios.post(`${API_BASE_URL}/api/ratings`, {
        ticket_id: ticket.id,
        technician_id: ticket.technician_id,
        customer_id: user?.id,
        rating: ratingValue,
        comment: ratingComment || null,
      });

      setTicket((prev) => ({
        ...prev,
        existing_rating: ratingValue,
        existing_rating_comment: ratingComment,
      }));
    } catch (err) {
      console.error(err);
      setRatingError("Couldn't submit your rating. Please try again.");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="tech-page">
        <p className="dashboard-loading">Loading job...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-page">
        <p className="dashboard-error">{error}</p>
        <Link to="/user/appointments" className="tech-action-btn">
          Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <div className="tech-page">
      <div className="tech-page-header">
        <div>
          <button
            className="back-link"
            onClick={() => navigate("/user/appointments")}>
            ← Back to Appointments
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
            <strong>
              {ticket.amount
                ? `$${Number(ticket.amount).toFixed(2)}`
                : "Not billed yet"}
            </strong>
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
                    <a href={`mailto:${ticket.technician_email}`}>
                      {ticket.technician_email}
                    </a>
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
        </div>
      </div>

      {ticket.status === "Completed" && (
        <div className="tech-panel detail-card rating-card">
          <h3>Your Rating</h3>

          {ticket.existing_rating ? (
            <>
              <span className="rating-stars large">
                {"★".repeat(ticket.existing_rating)}
                {"☆".repeat(5 - ticket.existing_rating)}
              </span>
              {ticket.existing_rating_comment && (
                <p className="rating-comment">
                  "{ticket.existing_rating_comment}"
                </p>
              )}
            </>
          ) : (
            <>
              <p>How was this repair? Let us know.</p>

              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`star-btn ${n <= ratingValue ? "filled" : ""}`}
                    onClick={() => setRatingValue(n)}>
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="rating-textarea"
                placeholder="Optional comment..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />

              {ratingError && <p className="manage-error">{ratingError}</p>}

              <button
                className="tech-action-btn primary"
                disabled={submittingRating}
                onClick={submitRating}>
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserJobDetail;
