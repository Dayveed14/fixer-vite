// UserAppointmentDetail.jsx
// Detail view for a single booking, linked from UserAppointments' "View" button.

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./TechnicianShared.css";
import "./UserAppointmentDetail.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const SUPPORT_TYPE_LABELS = {
  voice: "Voice Call",
  video: "Video Call",
  remote_desktop: "Remote Support",
};

function badgeClass(status) {
  switch (status?.toLowerCase()) {
    case "pending":
      return "badge pending";
    case "confirmed":
      return "badge confirmed";
    case "completed":
      return "badge completed";
    case "cancelled":
    case "missed":
      return "badge cancelled";
    default:
      return "badge";
  }
}

const UserAppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Appointment not found.");
      } else {
        setError("Failed to load this appointment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this appointment?")) return;

    setCancelling(true);

    try {
      await axios.patch(`${API_BASE_URL}/api/bookings/${id}/status`, {
        status: "cancelled",
      });
      setBooking((prev) => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="tech-page">
        <p className="dashboard-loading">Loading appointment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-page">
        <p className="dashboard-error">{error}</p>
        <Link to="/user/appointments" className="tech-action-btn">Back to Appointments</Link>
      </div>
    );
  }

  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const isOwner = user?.id === booking.user_id;

  return (
    <div className="tech-page">

      <div className="tech-page-header">
        <div>
          <button className="back-link" onClick={() => navigate("/user/appointments")}>
            ← Back to Appointments
          </button>
          <h1>{booking.booking_reference}</h1>
          <p>Booked {new Date(booking.created_at).toLocaleDateString()}</p>
        </div>
        <span className={badgeClass(booking.status)}>{booking.status}</span>
      </div>

      <div className="detail-grid">

        <div className="tech-panel detail-card">
          <h3>Appointment</h3>

          <div className="detail-row">
            <span>Type</span>
            <strong>{SUPPORT_TYPE_LABELS[booking.support_type] || booking.support_type}</strong>
          </div>

          <div className="detail-row">
            <span>Date</span>
            <strong>{booking.booking_date}</strong>
          </div>

          <div className="detail-row">
            <span>Time</span>
            <strong>{booking.booking_time}</strong>
          </div>

          <div className="detail-row">
            <span>Duration</span>
            <strong>{booking.duration} min</strong>
          </div>

          <div className="detail-row">
            <span>Device</span>
            <strong>{booking.device || "—"}</strong>
          </div>

          <div className="detail-row">
            <span>Issue</span>
            <strong>{booking.issue_summary || "—"}</strong>
          </div>
        </div>

        <div className="tech-panel detail-card">
          <h3>Technician</h3>

          {booking.technician_name ? (
            <>
              <div className="detail-row">
                <span>Name</span>
                <strong>{booking.technician_name}</strong>
              </div>

              {booking.technician_email && (
                <div className="detail-row">
                  <span>Email</span>
                  <strong>
                    <a href={`mailto:${booking.technician_email}`}>{booking.technician_email}</a>
                  </strong>
                </div>
              )}

              {booking.technician_phone && (
                <div className="detail-row">
                  <span>Phone</span>
                  <strong>{booking.technician_phone}</strong>
                </div>
              )}
            </>
          ) : (
            <p className="dashboard-empty">Not assigned yet. We'll notify you once a technician is confirmed.</p>
          )}

          <h3 className="section-gap">Payment</h3>

          <div className="detail-row">
            <span>Amount</span>
            <strong>${Number(booking.amount).toFixed(2)}</strong>
          </div>

          <div className="detail-row">
            <span>Status</span>
            <strong className="capitalize">{booking.payment_status}</strong>
          </div>
        </div>

      </div>

      {isOwner && canCancel && (
        <div className="detail-actions">
          <button
            className="tech-action-btn danger"
            disabled={cancelling}
            onClick={handleCancel}
          >
            {cancelling ? "Cancelling..." : "Cancel Appointment"}
          </button>
        </div>
      )}

      {booking.ticket_id && (
        <div className="detail-actions">
          <Link to={`/userjob/${booking.ticket_id}`} className="tech-action-btn primary">
            View Linked Repair Job
          </Link>
        </div>
      )}

    </div>
  );
};

export default UserAppointmentDetail;
