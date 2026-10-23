import {
  FaTicketAlt,
  FaTools,
  FaLaptop,
  FaRobot,
  FaCalendarAlt,
  FaTruck,
  FaArrowRight,
  FaClock,
  FaStar,
} from "react-icons/fa";
import "./UserDashboard.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import CircuitArt from "../components/decor/CircuitArt";
import { rowLink } from "../utils/rowLink";
import { notificationLink } from "../utils/notificationLink";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const formatTime = (value) => {
  const [h, m] = String(value || "").split(":").map(Number);
  if (Number.isNaN(h)) return value || "";
  const suffix = h >= 12 ? "pm" : "am";
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")}${suffix}`;
};

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
      await api.post(`/api/ratings`, {
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
  const navigate = useNavigate();

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
const [activities, setActivities] = useState([]);
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
        const [statsRes, ticketsRes, appointmentRes, deviceRes, activityRes] =
          await Promise.all([
            api.get(`/api/stats/user/${user.id}`),
            api.get(`/api/tickets`, {
              params: { customer_id: user.id, limit: 3 },
            }),
            api.get(`/api/bookings`, {
              params: { user_id: user.id, upcoming: true, limit: 1 },
            }),
            api.get(`/api/devices`, {
              params: { customer_id: user.id, limit: 1 },
            }),
            api.get("/api/notifications", {
              params: { limit: 5 },
            }),
          ]);

        if (!cancelled) {
          setUserStats(statsRes.data);
          setTickets(ticketsRes.data);
          setNextAppointment(appointmentRes.data[0] || null);
          setDevice(deviceRes.data[0] || null);
          setActivities(activityRes.data.notifications || []);
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
      value: userStats?.appointmentsCount ?? 0,
      icon: <FaTicketAlt />,
      color: "#0B63CE",
      to: "/user/appointments",
      },
      {
      title: "Repairs in Progress",
      value: userStats?.repairsInProgress ?? 0,
      icon: <FaTools />,
      color: "#F59E0B",
      to: "/usershipments",
      },
      {
      title: "Registered Devices",
      value: userStats?.registeredDevices ?? 0,
      icon: <FaLaptop />,
      color: "#16A34A",
      to: "/registerdevice",
      },
      {
      title: "AI Diagnoses",
      value: userStats?.aiDiagnoses ?? 0,
      icon: <FaRobot />,
      color: "#9333EA",
      to: "/diagnosis",
      },
      ];


  return (
    <div className="user-dashboard">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <CircuitArt tone="light" className="banner-circuit" />
        <div>
          <h1>Welcome Back, {user?.first_name} 👋</h1>
          <p>
            Manage your support tickets, monitor repairs and request assistance
            from our certified technicians.
          </p>
        </div>
        <button onClick={() => navigate("/registerdevice")}>
          {" "}
          Register Device
        </button>
      </section>

      {/* Stats */}
      <section className="dashboard-stats">
        {stats.map((item) => (
          <Link className="stat-card" key={item.title} to={item.to}>
            <div className="icon" style={{ background: item.color }}>
              {item.icon}
            </div>
            <div>
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          </Link>
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
              <button onClick={() => navigate("/user/appointments")}>
                View All <FaArrowRight />
              </button>
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
                      <tr key={ticket.id} {...rowLink(navigate, `/userjob/${ticket.id}`)}>
                        <td>{ticket.ticket_code}</td>
                        <td>{ticket.issue}</td>
                        <td>{ticket.technician_name || "Pending"}</td>
                        <td>
                          <span
                            className={`status ${ticket.status
                              .replace(/\s+/g, "")
                              .toLowerCase()}`}>
                            {ticket.status}
                          </span>

                          {ticket.status === "Completed" &&
                            ticket.technician_id &&
                            (ticket.existing_rating ? (
                              <span className="rating-done">
                                Rated {ticket.existing_rating}/5
                              </span>
                            ) : (
                              <span data-no-row-link>
                                <StarRating
                                  ticket={ticket}
                                  onSubmitted={handleRatingSubmitted}
                                />
                              </span>
                            ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Activity */}
            <div className="dashboard-card">
              <h2>Recent Activity</h2>

              {activities.length === 0 ? (
                <p className="dashboard-empty">
                  No recent activity yet.
                </p>
              ) : (
                <div className="activity-list">
                  {activities.map((activity) => {
                    const body = (
                      <>
                        <FaClock />

                        <div className="activity-content">
                          <h4>{activity.title}</h4>

                          <p>{activity.message}</p>

                          <small>
                            {new Date(activity.created_at).toLocaleString("en-NG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </small>
                        </div>
                      </>
                    );
                    const to = notificationLink(activity, "user");
                    return to ? (
                      <Link className="activity-item dash-link-card" key={activity.id} to={to}>
                        {body}
                      </Link>
                    ) : (
                      <div className="activity-item" key={activity.id}>
                        {body}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        </div>

        {/* Right */}
        <div className="right-panel">
          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <button
              className="action-btn"
              onClick={() => navigate("/diagnosis")}>
              <FaRobot /> Smart Diagnosis
            </button>
            <button className="action-btn" onClick={() => navigate("/book")}>
              <FaCalendarAlt /> Book a Technician
            </button>
            <button
              className="action-btn"
              onClick={() => navigate("/shipment")}>
              <FaTruck /> Send Device for Repair
            </button>
            <button
              className="action-btn"
              onClick={() => navigate("/registerdevice")}>
              <FaLaptop /> Register Device
            </button>
          </div>

          {/* Appointment */}
          <div className="dashboard-card">
            <h2>Upcoming Appointment</h2>

            {nextAppointment ? (
              <Link
                className="appointment dash-link-card"
                to={`/userappointment/${nextAppointment.id}`}>
                <FaCalendarAlt className="calendar-icon" />
                <h3>
                  {SUPPORT_TYPE_LABELS[nextAppointment.support_type] ||
                    "Support Call"}
                </h3>
                <p>{formatDate(nextAppointment.booking_date)}</p>
                <span>{formatTime(nextAppointment.booking_time)}</span>
                {nextAppointment.meeting_url && (
                  <small className="appointment-meeting">Video call link ready</small>
                )}
              </Link>
            ) : (
              <div className="dashboard-empty">
                <p>No upcoming appointments.</p>
                <Link to="/book">Book a technician</Link>
              </div>
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
                    ? `Last serviced: ${formatDate(device.last_serviced_at)}`
                    : "Not serviced yet"}
                </small>
              </div>
            ) : (
              <div className="dashboard-empty">
                <p>No devices registered yet.</p>
                <Link to="/registerdevice">Register a device</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
