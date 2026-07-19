  import { useState, useRef, useEffect } from "react";
  import {
    HiOutlineSparkles,
    HiOutlineCalendarDays,
    HiOutlineWrenchScrewdriver,
    HiOutlineClipboardDocumentCheck,
  } from "react-icons/hi2";
  import { useNavigate, useLocation, Link } from "react-router-dom";
  import "../css/Navbar.css";
  import logo from "../img/logo.png";

  const NAV_LINKS = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Services", href: "#services" },
    { label: "Resources", href: "#resources" },
  ];

  const AVATAR_URL = "https://i.pravatar.cc/40?img=12";

  export default function Navbar() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
  const [showHowModal, setShowHowModal] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));
    const dropRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close dropdown on outside click
    useEffect(() => {
      const handler = (e) => {
        if (dropRef.current && !dropRef.current.contains(e.target)) {
          setDropOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
      document.body.style.overflow = menuOpen ? "hidden" : "";
      return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    // Close mobile menu on route change
    useEffect(() => {
      setMenuOpen(false);
    }, [location.pathname]);

  const handleNav = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);

    if (href === "#how-it-works") {
      setShowHowModal(true);
      return;
    }

    if (location.pathname === "/") {
      document
        .querySelector(href)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/" + href);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setDropOpen(false);
    navigate("/");
    window.location.reload(); // refresh navbar state
  };

    return (
      <>
        <nav className="navbar">
          {/* Logo */}
          <a href="#home" className="navbar__logo" onClick={(e) => handleNav(e, "#home")}>
            <img src={logo} alt="fixer" className="navbar__logo-img" />
          </a>

          {/* Desktop nav links */}
          <ul className="navbar__links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(e) => handleNav(e, link.href)}
                  className="navbar__link"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="navbar__actions">
            <button
              className="navbar__cta"
              onClick={() => {
                if (user) { navigate("/book"); }
                else { setShowLoginModal(true); }
              }}
            >
              Book a Call
            </button>

            <div className="navbar__profile" ref={dropRef}>
              <button
                className="navbar__avatar-btn"
                onClick={() => setDropOpen((prev) => !prev)}
                aria-expanded={dropOpen}
              >
                <img src={AVATAR_URL} alt="Profile" className="navbar__avatar" />
                <svg
                  className={`navbar__chevron ${dropOpen ? "open" : ""}`}
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                >
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

  {dropOpen && (
    <div className="navbar__dropdown">
      <div className="navbar__dropdown-header">
        <img src={AVATAR_URL} alt="" className="navbar__dropdown-avatar" />
        <div>
          <p className="navbar__dropdown-name">
            {user ? `Hi, ${user.first_name || user.name || "User"}!` : "Welcome!"}
          </p>
          <p className="navbar__dropdown-sub">
            {user
              ? "Manage your account"
              : "Sign in to access your account"}
          </p>
        </div>
      </div>

      <div className="navbar__dropdown-divider" />

      {user ? (
        <>
          <button
            className="navbar__dropdown-item navbar__dropdown-item--primary"
            onClick={() => {
              setDropOpen(false);
              navigate("/dashboard"); // change to your dashboard route
            }}
          >
            Dashboard
          </button>

          <button
            className="navbar__dropdown-item"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </>
      ) : (
        <>
          <button
            className="navbar__dropdown-item navbar__dropdown-item--primary"
            onClick={() => {
              setDropOpen(false);
              navigate("/register");
            }}
          >
            Register
          </button>

          <button
            className="navbar__dropdown-item"
            onClick={() => {
              setDropOpen(false);
              navigate("/login");
            }}
          >
            Log In
          </button>
        </>
      )}

      <div className="navbar__dropdown-divider" />

      <div className="navbar__dropdown-footer">
        <Link to="/about">About</Link>
        <Link to="/">Articles</Link>
        <Link to="/community">Community</Link>
        <Link to="/privacy">Terms</Link>
      </div>
    </div>
  )}
            </div>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className={`navbar__hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        {/* Mobile drawer */}
        <div className={`navbar__drawer ${menuOpen ? "open" : ""}`}>
          <ul className="navbar__drawer-links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(e) => handleNav(e, link.href)}
                  className="navbar__drawer-link"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="navbar__drawer-actions">
            <button
              className="navbar__cta navbar__cta--full"
              onClick={() => {
                setMenuOpen(false);
                if (user) { navigate("/book"); }
                else { setShowLoginModal(true); }
              }}
            >
              Book a Call
            </button>
  <div className="navbar__drawer-auth">
    {user ? (
      <>
        <button
          className="navbar__drawer-btn navbar__drawer-btn--primary"
          onClick={() => {
            setMenuOpen(false);
            navigate("/dashboard"); // change to your dashboard route
          }}
        >
          Dashboard
        </button>

        <button
          className="navbar__drawer-btn"
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token"); // if applicable
            setMenuOpen(false);
            navigate("/");
            window.location.reload();
          }}
        >
          Log Out
        </button>
      </>
    ) : (
      <>
        <button
          className="navbar__drawer-btn navbar__drawer-btn--primary"
          onClick={() => {
            setMenuOpen(false);
            navigate("/login");
          }}
        >
          Log In
        </button>

        <button
          className="navbar__drawer-btn"
          onClick={() => {
            setMenuOpen(false);
            navigate("/register");
          }}
        >
          Register
        </button>
      </>
    )}
  </div>
          </div>

          <div className="navbar__drawer-footer">
            <a href="#">About</a>
            <a href="#">Articles</a>
            <a href="#">Community</a>
            <a href="#">Terms</a>
          </div>
        </div>
  {showHowModal && (
    <div
      className="how-modal-overlay"
      onClick={(e) =>
        e.target === e.currentTarget && setShowHowModal(false)
      }
    >
      <div className="how-modal">

        <button
          className="how-modal-close"
          onClick={() => setShowHowModal(false)}
        >
          ✕
        </button>

        <h2>How TechAssist Works</h2>

        <p className="how-modal-subtitle">
          Getting professional computer support has never been easier.
        </p>

        <div className="how-grid">

          <div className="how-card">
            <div className="how-icon">
              <HiOutlineSparkles />
            </div>

            <h3>AI Diagnosis</h3>

            <p>
              Describe your computer issue and let our AI suggest
              possible causes before speaking with a technician.
            </p>
          </div>

          <div className="how-card">
            <div className="how-icon">
              <HiOutlineCalendarDays />
            </div>

            <h3>Book Support</h3>

            <p>
              Choose a remote or onsite session and select a time
              that works for you.
            </p>
          </div>

          <div className="how-card">
            <div className="how-icon">
              <HiOutlineWrenchScrewdriver />
            </div>

            <h3>Expert Repair</h3>

            <p>
              Our certified technicians diagnose and resolve your
              issue remotely or in person.
            </p>
          </div>

          <div className="how-card">
            <div className="how-icon">
              <HiOutlineClipboardDocumentCheck />
            </div>

            <h3>Track Everything</h3>

            <p>
              Follow repair progress, chat with technicians,
              manage appointments, and download invoices.
            </p>
          </div>

        </div>

        <div className="how-buttons">

          <button
            className="navbar__cta"
            onClick={() => {
                setShowHowModal(false);

                if (user) {
                  navigate("/diagnosis");
                } else {
                  setShowLoginModal(true);
                }
              }}
          >
            Run AI Diagnosis
          </button>

          <button
            className="navbar__drawer-btn"
            onClick={() => {
              setShowHowModal(false);

              if (user) {
                navigate("/book");
              } else {
                setShowLoginModal(true);
              }
            }}
          >
            Book Support
          </button>

        </div>

      </div>
    </div>
  )}
        {/* Drawer backdrop */}
        {menuOpen && (
          <div className="navbar__backdrop" onClick={() => setMenuOpen(false)} />
        )}

        {/* Login required modal */}
        {showLoginModal && (
          <div className="login-required-overlay" onClick={(e) => e.target === e.currentTarget && setShowLoginModal(false)}>
            <div className="login-required-modal">
              <div className="login-required-icon">🔐</div>
              <h2>Login Required</h2>
              <p>
                You need to be signed in before booking a support session.
                Logging in lets you manage appointments, chat with technicians,
                and track repairs from your dashboard.
              </p>
              <div className="login-required-buttons">
                <button
                  className="login-btn-modal"
                  onClick={() => { setShowLoginModal(false); navigate("/login"); }}
                >
                  Login
                </button>
                <button
                  className="register-btn-modal"
                  onClick={() => { setShowLoginModal(false); navigate("/register"); }}
                >
                  Create Account
                </button>
              </div>
              <button className="later-btn" onClick={() => setShowLoginModal(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </>
    );
  }
