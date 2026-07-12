import { useState } from "react";
import "../css/Footer.css";

const FOOTER_LINKS = {
  Company:  ["About fixer", "Blog", "Contact Us"],
  Features: ["Community", "Shipment Policy"],
  Support:  ["Help"],
  Legal:    ["Privacy Policy", "Cookies"],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  return (
    <div className="footer-wrap">
      <footer className="footer">
        <div className="footer__left">
          <h2 className="footer__title">Subscribe to our newsletter</h2>
          <p className="footer__sub">
            Subscribe to get the latest repair tips, updates, and expert advice for your devices.
          </p>
          {subscribed ? (
            <p className="footer__success">✓ You're subscribed! Thanks for joining.</p>
          ) : (
            <>
              <label className="footer__form-label">Email address</label>
              <div className="footer__form-row">
                <input
                  className="footer__input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button className="footer__submit" onClick={handleSubmit}>Subscribe</button>
              </div>
              <p className="footer__legal">
                By subscribing you agree to our <a href="#">Privacy policy</a>
              </p>
            </>
          )}
        </div>

        <div className="footer__links">
          {Object.entries(FOOTER_LINKS).map(([col, links]) => (
            <div key={col}>
              <p className="footer__col-title">{col}</p>
              <ul className="footer__col-list">
                {links.map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
