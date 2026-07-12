import {
  FaTicketAlt,
  FaTools,
  FaLaptop,
  FaRobot,
  FaCalendarAlt,
  FaComments,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";
import "./UserDashboard.css";

const UserDashboard = () => {
  const stats = [
    { title: "Appointments",      value: 3, icon: <FaTicketAlt />, color: "#0B63CE" },
    { title: "Repairs in Progress", value: 2, icon: <FaTools />,    color: "#F59E0B" },
    { title: "Registered Devices", value: 5, icon: <FaLaptop />,   color: "#16A34A" },
    { title: "AI Diagnoses",       value: 7, icon: <FaRobot />,    color: "#9333EA" },
  ];

  const tickets = [
    { id: "#TK1001", issue: "Laptop won't boot",   technician: "John Adams",  status: "In Progress", date: "12 Jul 2026" },
    { id: "#TK1002", issue: "Wi-Fi not working",   technician: "Pending",     status: "Open",        date: "10 Jul 2026" },
    { id: "#TK1003", issue: "Broken Screen",       technician: "Sarah James", status: "Completed",   date: "04 Jul 2026" },
  ];

  return (
    <div className="user-dashboard">

      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div>
          <h1>Welcome Back, David 👋</h1>
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
                      <td>{ticket.id}</td>
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
            <div className="appointment">
              <FaCalendarAlt className="calendar-icon" />
              <h3>Remote Support Session</h3>
              <p>Monday, 13 July 2026</p>
              <span>10:00 AM</span>
            </div>
          </div>

          {/* Registered Device */}
          <div className="dashboard-card">
            <h2>Registered Device</h2>
            <div className="device-card">
              <FaLaptop className="device-icon" />
              <h3>Dell Latitude 5420</h3>
              <p>Windows 11 Pro</p>
              <small>Last Serviced: 22 June 2026</small>
            </div>
          </div>

        </div>

      </section>
    </div>
  );
};

export default UserDashboard;
