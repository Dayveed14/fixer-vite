
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaTicketAlt,
  FaRobot,
  FaBoxOpen,
  FaComments,
  FaCog,
  FaBell,
  FaSearch,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";

import logo from "../components/img/logo.png";
import "./UserLayout.css";

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Book Support",
      path: "/book",
      icon: <FaTicketAlt />,
    },
    {
      name: "Smart Diagnosis",
      path: "/diagnosis",
      icon: <FaRobot />,
    },
    {
      name: "Mail-In Repair",
      path: "/mailin",
      icon: <FaBoxOpen />,
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <FaComments />,
    },
    {
      name: "Settings",
      path: "/settings",
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

         <img src={logo} alt="Fixer Logo" className="logo" />

        <button
  className="menu-btn"
  onClick={() => setSidebarOpen(prev => !prev)}
>
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
              placeholder="Search..."
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
                <h4>David</h4>
                <p>User</p>
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

export default UserLayout;