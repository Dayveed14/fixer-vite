import {
  FaTicketAlt,
  FaTools,
  FaLaptop,
  FaRobot,
  FaCalendarAlt,
  FaComments,
  FaArrowRight,
  FaClock,
  FaStar,
} from "react-icons/fa";
import "./UserDashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const SUPPORT_TYPE_LABELS = {
  voice: "Voice Call",
  video: "Video Call",
  remote_desktop: "Remote Support",
};

const StarRating = ({ ticket, onSubmitted }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const [selectedValue, setSelectedValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submitRating = async (value) => {
    setSelectedValue(value);
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/ratings`, {
        ticket_id: ticket.id,
        technician_id: ticket.technician_id,
        rating: value,
      });

      onSubmitted(ticket.id, value);
    } catch (err) {
      console.error(err);
      setSelectedValue(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <span className="rating-stars">
      {[1, 2, 3, 4, 5].map((value) => (
        <FaStar
          key={value}
          className={
            value <= (hoverValue || selectedValue) ? "star filled" : "star"
          }
          onMouseEnter={() => !submitting && setHoverValue(value)}
          onMouseLeave={() => !submitting && setHoverValue(0)}
          onClick={() => !submitting && submitRating(value)}
        />
      ))}
    </span>
  );
};

const UserDashboard = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [userStats, setUserStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setError("You need to be logged in to view your dashboard.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statsRes, ticketsRes, appointmentRes, deviceRes] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/api/stats/user/${user.id}`),
            axios.get(`${API_BASE_URL}/api/tickets`, {
              params: { customer_id: user.id, limit: 3 },
            }),
            axios.get(`${API_BASE_URL}/api/bookings`, {
              params: { user_id: user.id, upcoming: true, limit: 1 },
            }),
            axios.get(`${API_BASE_URL}/api/devices`, {
              params: { customer_id: user.id, limit: 1 },
            }),
          ]);

        if (!cancelled) {
          setUserStats(statsRes.data);
          setTickets(ticketsRes.data);
          setNextAppointment(appointmentRes.data[0] || null);
          setDevice(deviceRes.data[0] || null);
          console.log(deviceRes.data[0] || null);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Failed to load dashboard data. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleRatingSubmitted = (ticketId, rating) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, existing_rating: rating } : t,
      ),
    );
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <p className="dashboard-loading">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard">
        <p className="dashboard-error">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Appointments",
      value: userStats.appointmentsCount,
      icon: <FaTicketAlt />,
      color: "#0B63CE",
    },
    {
      title: "Repairs in Progress",
      value: userStats.repairsInProgress,
      icon: <FaTools />,
      color: "#F59E0B",
    },
    {
      title: "Registered Devices",
      value: userStats.registeredDevices,
      icon: <FaLaptop />,
      color: "#16A34A",
    },
    {
      title: "AI Diagnoses",
      value: userStats.aiDiagnoses,
      icon: <FaRobot />,
      color: "#9333EA",
    },
  ];

  return (
    <div className="user-dashboard">

      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div>
          <h1>Welcome Back, {user?.first_name} 👋</h1>
          <p>
            Manage your support tickets, monitor repairs and
            request assistance from our certified technicians.
          </p>
        </div>
        <button>Register Device</button>
      </section>

      {/* Stats */}
      <section className="dashboard-stats">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="icon" style={{ background: item.color }}>
              {item.icon}
            </div>
            <div>
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Main Grid */}
      <section className="dashboard-grid">

        {/* Left */}
        <div className="left-panel">

          {/* Tickets */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Support Tickets</h2>
              <button>View All <FaArrowRight /></button>
            </div>

            {/* Wrapper enables horizontal scroll on small screens */}
            <div className="table-wrapper">
              {tickets.length === 0 ? (

                <p className="dashboard-empty">No support tickets yet.</p>

              ) : (

                <table>
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Issue</th>
                      <th>Technician</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>{ticket.ticket_code}</td>
                        <td>{ticket.issue}</td>
                        <td>{ticket.technician_name || "Pending"}</td>
                        <td>
                          <span
                            className={`status ${ticket.status
                              .replace(/\s+/g, "")
                              .toLowerCase()}`}
                          >
                            {ticket.status}
                          </span>

                          {ticket.status === "Completed" && ticket.technician_id && (

                            ticket.existing_rating ? (

                              <span className="rating-done">
                                Rated {ticket.existing_rating}/5
                              </span>

                            ) : (

                              <StarRating
                                ticket={ticket}
                                onSubmitted={handleRatingSubmitted}
                              />

                            )

                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              )}
            </div>
          </div>

          {/* Activity */}
          <div className="dashboard-card">
            <h2>Recent Activity</h2>
            <div className="activity-item">
              <FaClock />
              <p>Technician accepted your repair request.</p>
            </div>
            <div className="activity-item">
              <FaClock />
              <p>AI completed diagnosis for your laptop.</p>
            </div>
            <div className="activity-item">
              <FaClock />
              <p>Your mail-in shipment has been received.</p>
            </div>
          </div>

        </div>

        {/* Right */}
        <div className="right-panel">

          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <button className="action-btn"><FaRobot /> Smart Diagnosis</button>
            <button className="action-btn"><FaComments /> Live Chat</button>
            <button className="action-btn"><FaLaptop /> Register Device</button>
          </div>

          {/* Appointment */}
          <div className="dashboard-card">
            <h2>Upcoming Appointment</h2>

            {nextAppointment ? (

              <div className="appointment">
                <FaCalendarAlt className="calendar-icon" />
                <h3>{SUPPORT_TYPE_LABELS[nextAppointment.support_type] || "Support Call"}</h3>
                <p>{nextAppointment.booking_date}</p>
                <span>{nextAppointment.booking_time}</span>
              </div>

            ) : (

              <p className="dashboard-empty">No upcoming appointments.</p>

            )}

          </div>

          {/* Registered Device */}
          <div className="dashboard-card">
            <h2>Registered Device</h2>

            {device ? (

              <div className="device-card">
                <FaLaptop className="device-icon" />
                <h3>{device.device_name}</h3>
                <p>{device.os || device.brand || "—"}</p>
                <small>
                  {device.last_serviced_at
                    ? `Last Serviced: ${device.last_serviced_at}`
                    : "Not serviced yet"}
                </small>
              </div>

            ) : (

              <p className="dashboard-empty">No devices registered yet.</p>

            )}

          </div>

        </div>

      </section>
    </div>
  );
};

export default UserDashboard;
