// UserAppointments.jsx
// Shows everything a customer has going on: booked appointments (bookings
// table) merged with repair jobs (tickets table) — both origins, every
// status, in one place.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./UserAppointments.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

const TABS = [
  { key: "All", label: "All" },
  { key: "Appointment", label: "Appointments" },
  { key: "Job", label: "Repairs & Jobs" },
];

function badgeClass(status) {
  switch (status?.toLowerCase()) {
    case "pending":
      return "badge warning";
    case "confirmed":
    case "open":
      return "badge info";
    case "in progress":
      return "badge blue";
    case "completed":
      return "badge success";
    case "cancelled":
    case "missed":
      return "badge danger";
    default:
      return "badge";
  }
}

const SUPPORT_TYPE_LABELS = {
  voice: "Voice Call",
  video: "Video Call",
  remote_desktop: "Remote Support",
};

const UserAppointments = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!user?.id) {
      setError("You need to be logged in to view your appointments.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [bookingsRes, ticketsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/bookings`, {
            params: { user_id: user.id },
          }),
          axios.get(`${API_BASE_URL}/api/tickets`, {
            params: { customer_id: user.id },
          }),
        ]);

        if (cancelled) return;

        const bookingItems = bookingsRes.data.map((b) => ({
          id: `booking-${b.id}`,
          type: "Appointment",
          reference: b.booking_reference,
          service: SUPPORT_TYPE_LABELS[b.support_type] || b.support_type,
          device: b.device,
          technician_name: b.technician_name,
          date: b.booking_date,
          time: b.booking_time,
          status: b.status,
          payment_status: b.payment_status,
          amount: b.amount,
          detailPath: `/userappointment/${b.id}`,
        }));

        const jobItems = ticketsRes.data.map((t) => ({
          id: `ticket-${t.id}`,
          type: "Job",
          reference: t.ticket_code,
          service: t.issue,
          device: t.device,
          technician_name: t.technician_name,
          date: t.created_at ? new Date(t.created_at).toLocaleDateString() : "—",
          time: null,
          status: t.status,
          payment_status: t.amount ? "paid" : "—",
          amount: t.amount,
          detailPath: `/userjob/${t.id}`,
        }));

        setItems(
          [...bookingItems, ...jobItems].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          ),
        );
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load your appointments. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "All") return items;
    return items.filter((i) => i.type === activeTab);
  }, [items, activeTab]);

  if (loading) {
    return (
      <div className="user-appointments">
        <div className="loading">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-appointments">
        <div className="empty-state">
          <h3>{error}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="user-appointments">
      <div className="page-header">
        <h2>My Appointments</h2>
        <p>Track all your support requests and repairs.</p>
      </div>

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No appointments found.</h3>

          <Link to="/book" className="book-btn">
            Book Appointment
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Service / Issue</th>
                <th>Device</th>
                <th>Technician</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.reference}</td>

                  <td>{item.type}</td>

                  <td>{item.service}</td>

                  <td>{item.device || "—"}</td>

                  <td>{item.technician_name || "Not assigned"}</td>

                  <td>
                    {item.date}
                    {item.time && <div className="cell-sub">{item.time}</div>}
                  </td>

                  <td>
                    <span className={badgeClass(item.status)}>{item.status}</span>
                  </td>

                  <td>{item.payment_status}</td>

                  <td>
                    <Link to={item.detailPath} className="view-btn">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserAppointments;