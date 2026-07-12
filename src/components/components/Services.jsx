import { useState } from "react";
import "../css/Services.css";
import { useNavigate } from "react-router-dom";
import img1 from "../img/Rectangle1.png";
import img2 from "../img/Rectangle2.png";
const SERVICES = [
  {
    title: "Voice & Video Call Assistance",
    desc: "Get instant help from a repair expert via voice or video call. They guide you step-by-step, answer your questions in real time, and help you fix your device correctly as you go.",
    image: img1,
    align: "left",
    link: "/book",
  },
  {
    title: "Shipment for Repair",
    desc: "Prefer a hands-off approach? Send your device to us and let our experts handle the repair—from pickup to safe return, hassle-free.",
    image: img2,
    align: "right",
    link: "/shipment",
  },
];

export default function Services() {
  const [slide, setSlide] = useState(0);
  const total = 10; // placeholder total
const navigate = useNavigate();
 // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <section className="services">
      <div className="services__intro">
        <h2 className="services__title">
          <span className="services__title-accent">fixer's</span> Services
        </h2>
        <p className="services__lead">
          Whether you're a hands-on fixer or prefer to let the pros handle it, we've got you covered
        </p>
        <p className="services__body">
          Start by identifying your device issue using simple guided checks and helpful articles,
          then get real-time support through voice or video call assistance for step-by-step
          guidance. If you prefer, you can carry out the repair yourself with expert help or choose
          our secure shipment service and let professionals handle it from start to finish.
        </p>
      </div>

      <div className="services__stack">
        {SERVICES.map((s, i) => (
          <div className={`services__item services__item--${s.align}`} key={i}>
            {/* Image */}
            <div className="services__img-wrap">
              <img src={s.image} alt={s.title} className="services__img" />
            </div>

            {/* Text */}
            <div className="services__text">
              <h3 className="services__item-title">{s.title}</h3>
              <p className="services__item-desc">{s.desc}</p>
             <button
                className="services__arrow-btn"
                aria-label="Learn More"
                onClick={() => {
                if (s.link === "/shipment") {
                  navigate("/shipment");
                  return;
                }

                if (user) {
                  navigate(s.link);
                } else {
                  setShowLoginModal(true);
                }
              }}
              >
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 14.25L14.25 3.75M14.25 3.75H6.75M14.25 3.75V11.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
   {showLoginModal && (
        <div
          className="login-required-overlay"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="login-required-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Login Required</h2>

            <p>
              You need to be signed in before booking a support session.
              Logging in lets you manage appointments, chat with technicians,
              and track repairs from your dashboard.
            </p>

            <div className="login-required-buttons">
              <button
                className="login-btn-modal"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login");
                }}
              >
                Login
              </button>

              <button
                className="register-btn-modal"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/register");
                }}
              >
                Create Account
              </button>
            </div>

            <button
              className="later-btn"
              onClick={() => setShowLoginModal(false)}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
