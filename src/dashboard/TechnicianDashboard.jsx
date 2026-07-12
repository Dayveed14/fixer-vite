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

const TechnicianDashboard = () => {
  const stats = [
    {
      title: "Assigned Jobs",
      value: 18,
      icon: <FaTicketAlt />,
      color: "#2563EB",
    },
    {
      title: "Completed Today",
      value: 7,
      icon: <FaCheckCircle />,
      color: "#16A34A",
    },
    {
      title: "Pending Repairs",
      value: 11,
      icon: <FaClock />,
      color: "#F59E0B",
    },
    {
      title: "Devices Repaired",
      value: 364,
      icon: <FaLaptop />,
      color: "#9333EA",
    },
  ];

  const jobs = [
    {
      id: "#TK2011",
      customer: "David A.",
      device: "Dell Latitude 5420",
      issue: "Laptop won't boot",
      priority: "High",
      status: "In Progress",
    },
    {
      id: "#TK2012",
      customer: "Mary O.",
      device: "HP EliteBook",
      issue: "Slow Performance",
      priority: "Medium",
      status: "Pending",
    },
    {
      id: "#TK2013",
      customer: "John C.",
      device: "MacBook Air",
      issue: "Battery Replacement",
      priority: "Low",
      status: "Completed",
    },
  ];

  return (
    <div className="technician-dashboard">

      {/* Banner */}

      <section className="tech-banner">

        <div>
          <h1>Welcome Back, John 👨‍🔧</h1>

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

                    <td>{job.id}</td>

                    <td>{job.customer}</td>

                    <td>{job.device}</td>

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

          </div>

          {/* Today's Tasks */}

          <div className="tech-card">

            <h2>Today's Schedule</h2>

            <div className="schedule-item">
              <FaCalendarAlt />
              <div>
                <h4>Remote Support Session</h4>
                <p>09:00 AM - David A.</p>
              </div>
            </div>

            <div className="schedule-item">
              <FaCalendarAlt />
              <div>
                <h4>Mail-in Device Inspection</h4>
                <p>11:30 AM - Mary O.</p>
              </div>
            </div>

            <div className="schedule-item">
              <FaCalendarAlt />
              <div>
                <h4>Software Installation</h4>
                <p>03:00 PM - John C.</p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="right-tech">

          {/* Customer Info */}

          <div className="tech-card">

            <h2>Current Customer</h2>

            <div className="customer-box">

              <FaUser className="customer-icon"/>

              <h3>David A.</h3>

              <p>Dell Latitude 5420</p>

              <small>
                Laptop won't boot after Windows update.
              </small>

            </div>

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

              <h1>97%</h1>

              <p>Customer Satisfaction</p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default TechnicianDashboard;