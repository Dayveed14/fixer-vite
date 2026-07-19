import { useState } from "react";
import "./css/StaticPage.css";
import Navbar from "./components/Navbar";

const CHANNELS = [
  { icon: "📧", title: "Email us", desc: "For general enquiries and support", value: "hello@fixer.ng", href: "mailto:hello@fixer.ng" },
  { icon: "💬", title: "Live chat", desc: "Chat with our team in real time", value: "Start a chat", href: "#" },
  { icon: "📞", title: "Call us", desc: "Available Mon – Fri, 8am – 6pm", value: "+234 800 000 0000", href: "tel:+2348000000000" },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    if (form.name && form.email && form.message) setSent(true);
  };

  return (
    <div className="static-page">
<Navbar />
      <section className="static-hero">
        <p className="static-hero__eyebrow">Contact</p>
        <h1 className="static-hero__title">We'd love to hear from you</h1>
        <p className="static-hero__sub">Whether you have a question, a suggestion, or just want to say hi — we're here.</p>
      </section>

      <section className="static-section">
        <div className="static-section__inner">

          {/* Contact channels */}
          <div className="contact-channels">
            {CHANNELS.map(c => (
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
                <button onClick={() => { setSent(false); setForm({ name:"", email:"", subject:"", message:"" }); }}>
                  Send another
                </button>
              </div>
            ) : (
              <div className="contact-form">
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label>Full name</label>
                    <input type="text" placeholder="e.g. John Doe" value={form.name} onChange={set("name")} />
                  </div>
                  <div className="contact-form__field">
                    <label>Email address</label>
                    <input type="email" placeholder="e.g. john@email.com" value={form.email} onChange={set("email")} />
                  </div>
                </div>
                <div className="contact-form__field">
                  <label>Subject</label>
                  <input type="text" placeholder="What's this about?" value={form.subject} onChange={set("subject")} />
                </div>
                <div className="contact-form__field">
                  <label>Message</label>
                  <textarea rows={6} placeholder="Tell us more..." value={form.message} onChange={set("message")} />
                </div>
                <button
                  className="contact-form__submit"
                  onClick={handleSubmit}
                  disabled={!form.name || !form.email || !form.message}
                >
                  Send message →
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
