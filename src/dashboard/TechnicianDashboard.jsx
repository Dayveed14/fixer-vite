// TechnicianDashboard.jsx

import {
  FaTools,
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaUser,
  FaLaptop,
  FaCalendarAlt,
  FaArrowRight,
} from "react-icons/fa";
import "./TechnicianDashboard.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import CircuitArt from "../components/decor/CircuitArt";
import { rowLink } from "../utils/rowLink";

const digits = (phone) => String(phone || "").replace(/[^\d+]/g, "");
// Nigerian numbers: 0803… → 234803… for WhatsApp links.
const whatsappNumber = (phone) => {
  const d = digits(phone).replace(/^\+/, "");
  return d.startsWith("0") ? `234${d.slice(1)}` : d;
};


const SUPPORT_TYPE_LABELS = {
  voice: "Voice Call",
  video: "Video Call",
  remote_desktop: "Remote Support",
};

const TechnicianDashboard = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const navigate = useNavigate();

  const [techStats, setTechStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
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
        const [statsRes, jobsRes, scheduleRes, activeRes] = await Promise.all([
          api.get(`/api/stats/technician/${user.id}`),
          api.get(`/api/tickets`, {
            params: { technician_id: user.id, limit: 3 },
          }),
          api.get(`/api/bookings`, {
            params: {
              technician_id: user.id,
              today: true,
              status: "confirmed",
            },
          }),
          api.get(`/api/tickets/active/${user.id}`),
        ]);

        if (!cancelled) {
          setTechStats(statsRes.data);
          setJobs(jobsRes.data);
          setSchedule(scheduleRes.data);
          setActiveTicket(activeRes.data);
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

  if (loading) {
    return (
      <div className="technician-dashboard">
        <p className="dashboard-loading">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="technician-dashboard">
        <p className="dashboard-error">{error}</p>
      </div>
    );
  }

  const stats = [
    {
    title: "Assigned Jobs",
    value: techStats?.assignedJobs ?? 0,
    icon: <FaTicketAlt />,
    color: "#2563EB",
    to: "/technician/jobs",
    },
    {
    title: "Completed Today",
    value: techStats?.completedToday ?? 0,
    icon: <FaCheckCircle />,
    color: "#16A34A",
    to: "/technician/history",
    },
    {
    title: "Pending Repairs",
    value: techStats?.pendingRepairs ?? 0,
    icon: <FaClock />,
    color: "#F59E0B",
    to: "/technician/repairs",
    },
    {
    title: "Devices Repaired",
    value: techStats?.devicesRepaired ?? 0,
    icon: <FaLaptop />,
    color: "#9333EA",
    to: "/technician/history",
    },
    ];


  const performanceLabel =
    techStats.performancePercent === null
      ? "No ratings yet"
      : "Customer Satisfaction";

  return (
    <div className="technician-dashboard">
      {/* Banner */}

      <section className="tech-banner">
        <CircuitArt tone="light" className="banner-circuit" />
        <div>
          <h1>
            Welcome Back{user?.first_name ? `, ${user.first_name}` : ""} 👨‍🔧
          </h1>

          <p>
            Manage assigned repair requests, update customer tickets and monitor
            your repair progress.
          </p>
        </div>

        <button onClick={() => navigate("/technician/appointments")}>
          View My Schedule
        </button>
      </section>

      {/* Stats */}

      <section className="tech-stats">
        {stats.map((item) => (
          <Link className="tech-stat-card" key={item.title} to={item.to}>
            <div className="tech-icon" style={{ background: item.color }}>
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

      <section className="tech-grid">
        {/* Left Side */}

        <div className="left-tech">
          {/* Assigned Jobs */}
          <div className="tech-header">
            <h2>Assigned Jobs</h2>

            <button onClick={() => navigate("/technician/jobs")}>
              View All
              <FaArrowRight />
            </button>
          </div>
          <div className="tech-card table-wrapper">
            {jobs.length === 0 ? (
              <p className="dashboard-empty">No jobs assigned yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Customer</th>
                    <th>Device</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} {...rowLink(navigate, "/technician/jobs")}>
                      <td>{job.ticket_code}</td>

                      <td>{job.customer_name}</td>

                      <td>{job.device || "—"}</td>

                      <td>
                        <span
                          className={`priority ${job.priority.toLowerCase()}`}>
                          {job.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status ${job.status
                            .replace(/\s+/g, "")
                            .toLowerCase()}`}>
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Today's Tasks */}

          <div className="tech-card">
            <h2>Today's Schedule</h2>

            {schedule.length === 0 ? (
              <p className="dashboard-empty">
                No bookings scheduled for today.
              </p>
            ) : (
              schedule.map((appt) => (
                <Link
                  className="schedule-item dash-link-card"
                  key={appt.id}
                  to="/technician/appointments">
                  <FaCalendarAlt />
                  <div>
                    <h4>
                      {SUPPORT_TYPE_LABELS[appt.support_type] || "Support Call"}
                    </h4>
                    <p>
                      {String(appt.booking_time || "").slice(0, 5)} · {appt.customer_name}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Side */}

        <div className="right-tech">
          {/* Customer Info */}

          <div className="tech-card">
            <h2>Current Customer</h2>

            {activeTicket ? (
              <div className="customer-box">
                <FaUser className="customer-icon" />

                <h3>{activeTicket.customer_name}</h3>

                <p>{activeTicket.device || "Device not specified"}</p>

                <small>{activeTicket.issue}</small>

                {activeTicket.customer_phone && (
                  <div className="customer-contact">
                    <a href={`tel:${digits(activeTicket.customer_phone)}`}>Call</a>
                    <a
                      href={`https://wa.me/${whatsappNumber(activeTicket.customer_phone)}`}
                      target="_blank"
                      rel="noreferrer">
                      WhatsApp
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="dashboard-empty">No active job right now.</p>
            )}
          </div>

          {/* Quick Actions */}

          <div className="tech-card">
            <h2>Quick Actions</h2>

            <button
              className="tech-btn"
              onClick={() => navigate("/technician/appointments")}>
              Start Remote Session
            </button>

            <button
              className="tech-btn"
              onClick={() => navigate("/technician/jobs")}>
              Update Repair Status
            </button>

            <button
              className="tech-btn"
              disabled={!activeTicket?.customer_email}
              title={
                activeTicket?.customer_email
                  ? `Email ${activeTicket.customer_name}`
                  : "No active job to contact a customer for"
              }
              onClick={() => {
                if (activeTicket?.customer_email) {
                  window.location.href = `mailto:${activeTicket.customer_email}`;
                }
              }}>
              Contact Customer
            </button>

            <button
              className="tech-btn"
              onClick={() => navigate("/technician/repairs")}>
              Report a Repair Result
            </button>
          </div>

          {/* Performance */}

          <div className="tech-card">
            <h2>Performance</h2>

            <div className="performance-box">
              <FaTools className="performance-icon" />

              <h1>
                {techStats.performancePercent === null
                  ? "—"
                  : `${techStats.performancePercent}%`}
              </h1>

              <p>{performanceLabel}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TechnicianDashboard;
