// AdminDashboard.jsx

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

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: 1248,
      icon: <FaUsers />,
      color: "#2563EB",
    },
    {
      title: "Technicians",
      value: 36,
      icon: <FaUserTie />,
      color: "#16A34A",
    },
    {
      title: "Open Tickets",
      value: 87,
      icon: <FaTicketAlt />,
      color: "#F59E0B",
    },
    {
      title: "Revenue",
      value: "₦3.4M",
      icon: <FaMoneyBillWave />,
      color: "#9333EA",
    },
  ];

  const tickets = [
    {
      id: "#TK1042",
      customer: "David A.",
      issue: "Laptop won't boot",
      technician: "John",
      status: "Open",
    },
    {
      id: "#TK1043",
      customer: "Mary O.",
      issue: "Blue Screen",
      technician: "Sarah",
      status: "In Progress",
    },
    {
      id: "#TK1044",
      customer: "Daniel C.",
      issue: "Slow PC",
      technician: "James",
      status: "Completed",
    },
    {
      id: "#TK1045",
      customer: "Sandra U.",
      issue: "Virus Removal",
      technician: "Pending",
      status: "Pending",
    },
  ];

  const technicians = [
    {
      name: "John Adams",
      jobs: 25,
      rating: "⭐⭐⭐⭐⭐",
    },
    {
      name: "Sarah James",
      jobs: 18,
      rating: "⭐⭐⭐⭐",
    },
    {
      name: "Mike Peter",
      jobs: 12,
      rating: "⭐⭐⭐⭐⭐",
    },
  ];

  return (
    <div className="admin-dashboard">

      {/* Hero */}

      <section className="admin-banner">

        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Monitor users, technicians, repairs,
            support requests and business performance.
          </p>
        </div>

        <button>Add Technician</button>

      </section>

      {/* Stats */}

      <section className="admin-stats">

        {stats.map((item, index) => (

          <div className="admin-stat-card" key={index}>

            <div
              className="admin-icon"
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

      {/* Grid */}

      <section className="admin-grid">

        {/* LEFT */}

        <div className="left-admin">

          {/* Tickets */}

          <div className="admin-card">

            <div className="admin-header">

              <h2>Latest Tickets</h2>

              <button>
                View All
                <FaArrowRight />
              </button>

            </div>

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

                  <tr key={ticket.id}>

                    <td>{ticket.id}</td>

                    <td>{ticket.customer}</td>

                    <td>{ticket.issue}</td>

                    <td>{ticket.technician}</td>

                    <td>

                      <span
                        className={`status ${ticket.status
                          .replace(/\s+/g, "")
                          .toLowerCase()}`}
                      >
                        {ticket.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* System Health */}

          <div className="admin-card">

            <h2>System Health</h2>

            <div className="health-item">
              <FaLaptop />
              <span>Registered Devices</span>
              <strong>2,843</strong>
            </div>

            <div className="health-item">
              <FaTools />
              <span>Repairs Today</span>
              <strong>46</strong>
            </div>

            <div className="health-item">
              <FaExclamationTriangle />
              <span>Pending Approvals</span>
              <strong>11</strong>
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="right-admin">

          {/* Technicians */}

          <div className="admin-card">

            <h2>Top Technicians</h2>

            {technicians.map((tech, index) => (

              <div className="tech-card" key={index}>

                <div>

                  <h4>{tech.name}</h4>

                  <small>
                    {tech.jobs} Jobs Completed
                  </small>

                </div>

                <span>{tech.rating}</span>

              </div>

            ))}

          </div>

          {/* Quick Actions */}

          <div className="admin-card">

            <h2>Quick Actions</h2>

            <button className="admin-btn">
              Manage Users
            </button>

            <button className="admin-btn">
              Manage Technicians
            </button>

            <button className="admin-btn">
              View Reports
            </button>

            <button className="admin-btn">
              Payment History
            </button>

            <button className="admin-btn">
              Mail-In Repairs
            </button>

          </div>

          {/* Revenue */}

          <div className="admin-card">

            <h2>Monthly Revenue</h2>

            <div className="revenue-box">

              <h1>₦3,400,000</h1>

              <p>+18% compared to last month</p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default AdminDashboard;