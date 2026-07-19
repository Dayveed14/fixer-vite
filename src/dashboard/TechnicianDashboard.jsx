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
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

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
          axios.get(`${API_BASE_URL}/api/stats/technician/${user.id}`),
          axios.get(`${API_BASE_URL}/api/tickets`, {
            params: { technician_id: user.id, limit: 3 },
          }),
          axios.get(`${API_BASE_URL}/api/bookings`, {
            params: { technician_id: user.id, today: true, status: "confirmed" },
          }),
          axios.get(`${API_BASE_URL}/api/tickets/active/${user.id}`),
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
      value: techStats.assignedJobs,
      icon: <FaTicketAlt />,
      color: "#2563EB",
    },
    {
      title: "Completed Today",
      value: techStats.completedToday,
      icon: <FaCheckCircle />,
      color: "#16A34A",
    },
    {
      title: "Pending Repairs",
      value: techStats.pendingRepairs,
      icon: <FaClock />,
      color: "#F59E0B",
    },
    {
      title: "Devices Repaired",
      value: techStats.devicesRepaired,
      icon: <FaLaptop />,
      color: "#9333EA",
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

        <div>
          <h1>Welcome Back{user?.first_name ? `, ${user.first_name}` : ""} 👨‍🔧</h1>

          <p>
            Manage assigned repair requests, update customer
            tickets and monitor your repair progress.
          </p>
        </div>

        <button>View My Schedule</button>

      </section>

      {/* Stats */}

      <section className="tech-stats">

        {stats.map((item, index) => (

          <div className="tech-stat-card" key={index}>

            <div
              className="tech-icon"
              style={{ background: item.color }}
            >
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

      <section className="tech-grid">

        {/* Left Side */}

        <div className="left-tech">

          {/* Assigned Jobs */}

          <div className="tech-card">

            <div className="tech-header">

              <h2>Assigned Jobs</h2>

              <button>
                View All
                <FaArrowRight />
              </button>

            </div>

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

                    <tr key={job.id}>

                      <td>{job.ticket_code}</td>

                      <td>{job.customer_name}</td>

                      <td>{job.device || "—"}</td>

                      <td>
                        <span
                          className={`priority ${job.priority.toLowerCase()}`}
                        >
                          {job.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status ${job.status
                            .replace(/\s+/g, "")
                            .toLowerCase()}`}
                        >
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

              <p className="dashboard-empty">No bookings scheduled for today.</p>

            ) : (

              schedule.map((appt) => (

                <div className="schedule-item" key={appt.id}>
                  <FaCalendarAlt />
                  <div>
                    <h4>{SUPPORT_TYPE_LABELS[appt.support_type] || "Support Call"}</h4>
                    <p>
                      {appt.booking_time} - {appt.customer_name}
                    </p>
                  </div>
                </div>

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

                <FaUser className="customer-icon"/>

                <h3>{activeTicket.customer_name}</h3>

                <p>{activeTicket.device || "Device not specified"}</p>

                <small>{activeTicket.issue}</small>

              </div>

            ) : (

              <p className="dashboard-empty">No active job right now.</p>

            )}

          </div>

          {/* Quick Actions */}

          <div className="tech-card">

            <h2>Quick Actions</h2>

            <button className="tech-btn">
              Start Remote Session
            </button>

            <button className="tech-btn">
              Update Repair Status
            </button>

            <button className="tech-btn">
              Contact Customer
            </button>

            <button className="tech-btn">
              Upload Repair Report
            </button>

          </div>

          {/* Performance */}

          <div className="tech-card">

            <h2>Performance</h2>

            <div className="performance-box">

              <FaTools className="performance-icon"/>

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
