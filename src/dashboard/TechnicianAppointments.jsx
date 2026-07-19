// TechnicianAppointments.jsx
// Appointments — the technician's scheduled support calls (bookings table).
// Distinct from Assigned Jobs: this is the calendar of remote sessions,
// not the repair work order itself.

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./TechnicianShared.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

const SUPPORT_TYPE_LABELS = {
  voice: "Voice Call",
  video: "Video Call",
  remote_desktop: "Remote Support",
};

const TABS = [
  { key: "All", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "missed", label: "Missed" },
];

const TechnicianAppointments = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const loadBookings = async () => {
    if (!user?.id) {
      setError("You need to be logged in to view your appointments.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings`, {
        params: { technician_id: user.id },
      });

      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c = { All: bookings.length };
    for (const b of bookings) {
      c[b.status] = (c[b.status] || 0) + 1;
    }
    return c;
  }, [bookings]);

  const filtered = useMemo(() => {
    if (activeTab === "All") return bookings;
    return bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

  const updateStatus = async (booking, status) => {
    setUpdatingId(booking.id);

    try {
      await axios.patch(`${API_BASE_URL}/api/bookings/${booking.id}/status`, { status });

      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status } : b)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="tech-page">
        <p className="dashboard-loading">Loading your appointments...</p>
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
          <h1>Appointments</h1>
          <p>Your scheduled voice, video and remote-support sessions, booked by customers.</p>
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
          <p className="dashboard-empty">No appointments in this category.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Date / Time</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => (
                <tr key={appt.id}>
                  <td className="cell-primary">{appt.booking_reference}</td>
                  <td>{appt.customer_name}</td>
                  <td>{SUPPORT_TYPE_LABELS[appt.support_type] || appt.support_type}</td>
                  <td>
                    {appt.booking_date}
                    <div className="cell-sub">{appt.booking_time} · {appt.duration} min</div>
                  </td>
                  <td>
                    {appt.issue_summary || "—"}
                    {appt.device && <div className="cell-sub">{appt.device}</div>}
                  </td>
                  <td>
                    <span className={`badge ${appt.status}`}>{appt.status}</span>
                  </td>
                  <td>
                    {appt.status === "confirmed" ? (
                      <div className="row-actions">
                        <button
                          className="tech-action-btn primary"
                          disabled={updatingId === appt.id}
                          onClick={() => updateStatus(appt, "completed")}
                        >
                          Mark Completed
                        </button>
                        <button
                          className="tech-action-btn danger"
                          disabled={updatingId === appt.id}
                          onClick={() => updateStatus(appt, "missed")}
                        >
                          Mark Missed
                        </button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
};

export default TechnicianAppointments;
