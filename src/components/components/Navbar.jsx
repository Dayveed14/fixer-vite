import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    if (location.pathname === "/") {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/" + href);
    }
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
                    <p className="navbar__dropdown-name">Welcome!</p>
                    <p className="navbar__dropdown-sub">Sign in to access your account</p>
                  </div>
                </div>
                <div className="navbar__dropdown-divider" />
                <button
                  className="navbar__dropdown-item navbar__dropdown-item--primary"
                  onClick={() => { setDropOpen(false); navigate("/register"); }}
                >
                  Register
                </button>
                <button
                  className="navbar__dropdown-item"
                  onClick={() => { setDropOpen(false); navigate("/login"); }}
                >
                  Log In
                </button>
                <div className="navbar__dropdown-divider" />
                <div className="navbar__dropdown-footer">
                  <a href="#">About</a>
                  <a href="#">Articles</a>
                  <a href="#">Community</a>
                  <a href="#">Terms</a>
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
            <button
              className="navbar__drawer-btn navbar__drawer-btn--primary"
              onClick={() => { setMenuOpen(false); navigate("/login"); }}
            >
              Log In
            </button>
            <button
              className="navbar__drawer-btn"
              onClick={() => { setMenuOpen(false); navigate("/register"); }}
            >
              Register
            </button>
          </div>
        </div>

        <div className="navbar__drawer-footer">
          <a href="#">About</a>
          <a href="#">Articles</a>
          <a href="#">Community</a>
          <a href="#">Terms</a>
        </div>
      </div>

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
