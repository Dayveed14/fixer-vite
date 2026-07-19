
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {FaBars,FaTimes,FaTachometerAlt,FaTicketAlt,FaRobot,FaBoxOpen,FaComments,FaCog,FaBell,FaSearch,FaSignOutAlt,FaUserCircle,FaChevronDown,FaUsers,FaUserCog,
  FaCalendarAlt,FaTruck, FaNewspaper, FaVideo, FaMoneyBillWave, FaQuestionCircle
} from "react-icons/fa";

import logo from "../components/img/logo.png";
import "./UserLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

const menuItems = [
  {
    name: "Dashboard",
    path: "/admindashboard",
    icon: <FaTachometerAlt />,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <FaUsers />,
  },
  {
    name: "Technicians",
    path: "/admin/technicians",
    icon: <FaUserCog />,
  },
  {
    name: "Bookings",
    path: "/admin/bookings",
    icon: <FaCalendarAlt />,
  },
  {
    name: "Support Tickets",
    path: "/admintickets",
    icon: <FaTicketAlt />,
  },
  {
    name: "Shipments",
    path: "/adminshipments",
    icon: <FaTruck />,
  },
  {
    name: "Articles",
    path: "/adminarticles",
    icon: <FaNewspaper />,
  },
  {
    name: "DIY Videos",
    path: "/adminvideos",
    icon: <FaVideo />,
  },
  {
    name: "Smart Diagnosis",
    path: "/admin/diagnosis",
    icon: <FaRobot />,
  },
  {
    name: "Pricing",
    path: "/adminpricing",
    icon: <FaMoneyBillWave />,
  },
  {
    name: "FAQ",
    path: "/adminfaq",
    icon: <FaQuestionCircle />,
  },
  {
    name: "Settings",
    path: "/adminsettings",
    icon: <FaCog />,
  },
];

  return (
    <div className="layout">

      {/* Sidebar */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "show-sidebar" : ""
        }`}
      >
        <div className="logo">

         <Link to="/" > <img src={logo} alt="Fixer Logo" className="logo" /></Link>

        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(prev => !prev)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        </div>

        <nav>

          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path
                  ? "active-link"
                  : ""
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}

        </nav>

        <button
          className="logout-btn"
          onClick={logout}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* Main */}

      <div className="main">

        {/* Topbar */}

        <header className="topbar">

          <button
            className="menu-btn"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <FaBars />
          </button>

          {/* Search */}

          <div className="search-box">

            <FaSearch />

            <input
              type="text"
              placeholder="Search users, articles, tickets..."
            />

          </div>

          {/* Right */}

          <div className="top-right">

            <button className="icon-btn">
              <FaBell />
              <span className="badge">3</span>
            </button>

            <div
              className="profile"
              onClick={() =>
                setProfileMenu(!profileMenu)
              }
            >
              <FaUserCircle className="avatar" />

              <div className="profile-info">
                <h4>{user.first_name}</h4>
                <p>{user.role}</p>
              </div>

              <FaChevronDown />

              {profileMenu && (
                <div className="dropdown">

                  <Link to="/profile">
                    My Profile
                  </Link>

                  <Link to="/settings">
                    Settings
                  </Link>

                  <button onClick={logout}>
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* Page Content */}

        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;