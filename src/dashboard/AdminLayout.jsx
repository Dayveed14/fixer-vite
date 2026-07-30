
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {FaBars,FaTimes,FaTachometerAlt,FaTicketAlt,FaRobot,FaBoxOpen,FaComments,FaCog,FaBell,FaSearch,FaSignOutAlt,FaUserCircle,FaChevronDown,FaUsers,FaUserCog,
  FaCalendarAlt,FaTruck, FaNewspaper, FaVideo, FaMoneyBillWave, FaQuestionCircle
} from "react-icons/fa";

import logo from "../components/img/logo.png";
import "./UserLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifFetchError, setNotifFetchError] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
        params: { user_id: user.id, role: user.role },
      });

      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread);
      setNotifFetchError(false);
    } catch (err) {
      console.error(err);
      setNotifFetchError(true);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markOneRead = async (notif) => {
    if (notif.is_read) return;

    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/${notif.id}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/read-all`, {
        user_id: user.id,
        role: user.role,
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

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
    path: "/admin/settings",
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

            <div className="notif-wrapper">
              <button
                className="icon-btn"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileMenu(false);
                }}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="dropdown notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button className="mark-all-btn" onClick={markAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifFetchError ? (
                    <p className="notif-empty notif-error">Couldn't load notifications. Check your connection and try again.</p>
                  ) : notifications.length === 0 ? (
                    <p className="notif-empty">No notifications yet.</p>
                  ) : (
                    <div className="notif-list">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          className={`notif-item ${notif.is_read ? "" : "unread"}`}
                          onClick={() => markOneRead(notif)}
                        >
                          <span className="notif-title">{notif.title}</span>
                          <span className="notif-message">{notif.message}</span>
                          <span className="notif-time">
                            {new Date(notif.created_at).toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="profile"
              onClick={() => {
                setProfileMenu(!profileMenu);
                setNotifOpen(false);
              }}
            >
              <FaUserCircle className="avatar" />

              <div className="profile-info">
                <h4>{user?.first_name}</h4>
                <p>{user?.role}</p>
              </div>

              <FaChevronDown />

              {profileMenu && (
                <div className="dropdown">

                  <Link to="/profile">
                    My Profile
                  </Link>

                  <Link to="/admin/settings">
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