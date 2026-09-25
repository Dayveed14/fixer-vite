import { useState } from "react";
import axios from "axios";
import "./css/StaticPage.css";
import Navbar from "./components/Navbar";
import SEO from "./SEO";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://fixer-backend-7mng.onrender.com";

const CHANNELS = [
  {
    icon: "📧",
    title: "Email us",
    desc: "For general enquiries and support",
    value: "support@fixerng.app",
    href: "mailto:support@fixerng.app",
  },
  {
    icon: "💬",
    title: "Live chat",
    desc: "Chat with our team in real time",
    value: "Start a chat",
    href: "#",
  },
  {
    icon: "📞",
    title: "Call us",
    desc: "Available Mon – Fri, 8am – 6pm",
    value: "+234 800 000 0000",
    href: "tel:+2348000000000",
  },
];

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!(form.name && form.email && form.message)) return;

    setSending(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/api/contact`, form);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Couldn't send your message right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="static-page">
      <SEO
        title="Contact Fixer"
        description="Get in touch with the Fixer team by email, live chat, or phone for support, partnership enquiries, or general questions."
        path="/contact"
      />
      <Navbar />
      <section className="static-hero">
        <p className="static-hero__eyebrow">Contact</p>
        <h1 className="static-hero__title">We'd love to hear from you</h1>
        <p className="static-hero__sub">
          Whether you have a question, a suggestion, or just want to say hi —
          we're here.
        </p>
      </section>

      <section className="static-section">
        <div className="static-section__inner">
          {/* Contact channels */}
          <div className="contact-channels">
            {CHANNELS.map((c) => (
              <a href={c.href} className="contact-channel" key={c.title}>
                <span className="contact-channel__icon">{c.icon}</span>
                <div>
                  <h3 className="contact-channel__title">{c.title}</h3>
                  <p className="contact-channel__desc">{c.desc}</p>
                  <span className="contact-channel__value">{c.value}</span>
                </div>
              </a>
            ))}
          </div>

          {/* Form */}
          <div className="contact-form-wrap">
            <h2 className="static-section__title">Send us a message</h2>
            {sent ? (
              <div className="contact-success">
                <span>✓</span>
                <h3>Message sent!</h3>
                <p>We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}>
                  Send another
                </button>
              </div>
            ) : (
              <div className="contact-form">
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label>Full name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={set("name")}
                    />
                  </div>
                  <div className="contact-form__field">
                    <label>Email address</label>
                    <input
                      type="email"
                      placeholder="e.g. john@email.com"
                      value={form.email}
                      onChange={set("email")}
                    />
                  </div>
                </div>
                <div className="contact-form__field">
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={set("subject")}
                  />
                </div>
                <div className="contact-form__field">
                  <label>Message</label>
                  <textarea
                    rows={6}
                    placeholder="Tell us more..."
                    value={form.message}
                    onChange={set("message")}
                  />
                </div>
                {error && (
                  <p
                    className="contact-form__error"
                    style={{ color: "#c0392b" }}>
                    {error}
                  </p>
                )}
                <button
                  className="contact-form__submit"
                  onClick={handleSubmit}
                  disabled={
                    !form.name || !form.email || !form.message || sending
                  }>
                  {sending ? "Sending..." : "Send message →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
