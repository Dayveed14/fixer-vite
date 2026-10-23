import {
  FaUsers,
  FaUserTie,
  FaTicketAlt,
  FaMoneyBillWave,
  FaLaptop,
  FaTools,
  FaArrowRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import CircuitArt from "../components/decor/CircuitArt";
import { rowLink } from "../utils/rowLink";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statsRes, ticketsRes, techniciansRes] =
          await Promise.all([
            api.get(`/api/stats/dashboard`),
            api.get(`/api/tickets`, { params: { limit: 4 } }),
            api.get(`/api/users/technicians`),
          ]);

        if (!cancelled) {
          setStatsData(statsRes.data);
          setTickets(ticketsRes.data);
          setTechnicians(techniciansRes.data);
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
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <p className="admin-loading">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <p className="admin-error">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: statsData.totalUsers,
      icon: <FaUsers />,
      color: "#2563EB",
      to: "/admin/users",
    },
    {
      title: "Technicians",
      value: statsData.totalTechnicians,
      icon: <FaUserTie />,
      color: "#16A34A",
      to: "/admin/technicians",
    },
    {
      title: "Open Tickets",
      value: statsData.openTickets,
      icon: <FaTicketAlt />,
      color: "#F59E0B",
      to: "/admintickets",
    },
    {
      title: "Revenue",
      value: `₦${Number(statsData.revenue).toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      color: "#9333EA",
      to: "/admin/payments",
    },
  ];

  const revenueChangeLabel =
    statsData.revenueChangePercent === null ||
    statsData.revenueChangePercent === undefined
      ? "No data for last month"
      : `${statsData.revenueChangePercent >= 0 ? "+" : ""}${statsData.revenueChangePercent.toFixed(1)}% compared to last month`;

  return (
    <div className="admin-dashboard">
      {/* Hero */}

      <section className="admin-banner">
        <CircuitArt tone="light" className="banner-circuit" />
        <div>
          <h1>Admin{user?.first_name ? ` ${user.first_name}` : ""}</h1>

          <p>
            Monitor users, technicians, repairs, support requests and business
            performance.
          </p>
        </div>

        <button onClick={() => navigate("/admin/users/new")}>
          Add Technician
        </button>
      </section>

      {/* Stats */}

      <section className="admin-stats">
        {stats.map((item) => (
          <Link className="admin-stat-card" key={item.title} to={item.to}>
            <div className="admin-icon" style={{ background: item.color }}>
              {item.icon}
            </div>

            <div>
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Grid */}

      <section className="admin-grid">
        {/* LEFT */}

        <div className="left-admin">
          {/* Tickets */}

          <div className="admin-card">
            <div className="admin-header">
              <h2>Latest Tickets</h2>

              <button onClick={() => navigate("/admintickets")}>
                View All
                <FaArrowRight />
              </button>
            </div>
{/* Wrapper enables horizontal scroll on small screens */}
            <div className="table-wrapper">
            {tickets.length === 0 ? (
              <p className="admin-empty">No tickets yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Issue</th>
                    <th>Technician</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} {...rowLink(navigate, `/admin/tickets/${ticket.id}`)}>
                      <td>{ticket.ticket_code}</td>

                      <td>{ticket.customer_name}</td>

                      <td>{ticket.issue}</td>

                      <td>{ticket.technician_name || "Pending"}</td>

                      <td>
                        <span
                          className={`status ${ticket.status
                            .replace(/\s+/g, "")
                            .toLowerCase()}`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
          </div>

          {/* System Health */}

          <div className="admin-card">
            <h2>System Health</h2>

            <div className="health-item">
              <FaLaptop />
              <span>Registered Devices</span>
              <strong>{statsData.totalDevices}</strong>
            </div>

            <Link className="health-item" to="/adminshipments">
              <FaTools />
              <span>Repairs Delivered Today</span>
              <strong>{statsData.repairsToday ?? 0}</strong>
            </Link>

            <Link className="health-item" to="/admin/bookings">
              <FaExclamationTriangle />
              <span>Needs Attention</span>
              <strong>{statsData.pendingApprovals ?? statsData.unassignedCalls ?? 0}</strong>
            </Link>
          </div>
        </div>

        {/* RIGHT */}

        <div className="right-admin">
          {/* Technicians */}

          <div className="admin-card">
            <div className="admin-header">
              <h2>Technicians</h2>

              <button onClick={() => navigate("/admin/technicians")}>
                Manage
                <FaArrowRight />
              </button>
            </div>

            {technicians.length === 0 ? (
              <p className="admin-empty">No technicians yet. Add one to start assigning jobs.</p>
            ) : (
              technicians.map((tech) => (
                <Link className="admin-tech-row dash-link-card" key={tech.id} to={`/admin/technicians/edit/${tech.id}`}>
                  <div>
                    <h4>
                      {tech.first_name} {tech.last_name}
                    </h4>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Quick Actions */}

          <div className="admin-card">
            <h2>Quick Actions</h2>

            <button
              className="admin-btn"
              onClick={() => navigate("/admin/bookings")}>
              Pending Bookings
            </button>

            <button
              className="admin-btn"
              onClick={() => navigate("/admin/users")}>
              Manage Users
            </button>

            <button
              className="admin-btn"
              onClick={() => navigate("/admin/technicians")}>
              Manage Technicians
            </button>

            <button
              className="admin-btn"
              onClick={() => navigate("/admin/payments")}>
              Payments & Alerts
            </button>

            <button
              className="admin-btn"
              onClick={() => navigate("/adminshipments")}>
              Mail-In Repairs
            </button>

            <button
              className="admin-btn"
              onClick={() => navigate("/adminpricing")}>
              Pricing
            </button>
          </div>

          {/* Revenue */}

          <Link className="admin-card dash-link-card" to="/admin/payments">
            <h2>Monthly Revenue</h2>

            <div className="revenue-box">
              <h1>₦{Number(statsData.revenue).toLocaleString()}</h1>

              <p>{revenueChangeLabel}</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
