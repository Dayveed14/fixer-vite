import { useState } from "react";
import "./css/StaticPage.css";
import Navbar from "./components/Navbar";

const TOPICS = [
  {
    icon: "🔧",
    title: "DIY Repairs",
    articles: [
      "How do I find a repair guide for my device?",
      "Can I request a custom guide for my specific model?",
      "What tools do I need for basic repairs?",
      "Are the guides free to access?",
    ],
  },
  {
    icon: "📞",
    title: "Booking a Call",
    articles: [
      "How do I book a voice or video call?",
      "Can I reschedule or cancel my booking?",
      "What happens during a technician call?",
      "How much does a call session cost?",
    ],
  },
  {
    icon: "📦",
    title: "Device Shipment",
    articles: [
      "How do I submit a shipment request?",
      "How long will my repair take?",
      "How is my device packaged and insured?",
      "What if my device isn't fixed after return?",
    ],
  },
  {
    icon: "🤖",
    title: "Smart Diagnosis",
    articles: [
      "How does the AI diagnostic tool work?",
      "Is the diagnosis always accurate?",
      "Can I run multiple diagnoses?",
      "What happens after I get a diagnosis result?",
    ],
  },
  {
    icon: "👤",
    title: "Account & Billing",
    articles: [
      "How do I create a Fixer account?",
      "How do I reset my password?",
      "What payment methods are accepted?",
      "How do I get a receipt for my repair?",
    ],
  },
  {
    icon: "🔒",
    title: "Privacy & Security",
    articles: [
      "How is my personal data stored?",
      "Is my device data wiped during repairs?",
      "How do I delete my account?",
      "Who has access to my device while it's in for repair?",
    ],
  },
];

export default function Help() {
  const [search, setSearch] = useState("");
  const [openTopic, setOpenTopic] = useState(null);

  const filtered = TOPICS.map(t => ({
    ...t,
    articles: search
      ? t.articles.filter(a => a.toLowerCase().includes(search.toLowerCase()))
      : t.articles,
  })).filter(t => !search || t.articles.length > 0);

  return (
    <div className="static-page">
<Navbar />
      <section className="static-hero static-hero--blue">
        <p className="static-hero__eyebrow">Help Center</p>
        <h1 className="static-hero__title">How can we help you?</h1>
        <div className="help-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className="help-search__input"
            type="text"
            placeholder="Search for answers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="static-section">
        <div className="static-section__inner">
          <div className="help-grid">
            {filtered.map((topic, i) => (
              <div
                className={`help-topic ${openTopic === i ? "open" : ""}`}
                key={topic.title}
              >
                <button
                  className="help-topic__header"
                  onClick={() => setOpenTopic(openTopic === i ? null : i)}
                >
                  <span className="help-topic__icon">{topic.icon}</span>
                  <span className="help-topic__title">{topic.title}</span>
                  <svg
                    className="help-topic__chevron"
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <ul className="help-topic__articles">
                  {topic.articles.map(a => (
                    <li key={a}>
                      <a href="#" className="help-topic__article">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {a}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Still stuck CTA */}
          <div className="help-cta">
            <h2>Still need help?</h2>
            <p>Our support team is available Monday to Friday, 8am – 6pm.</p>
            <div className="help-cta__buttons">
              <a href="/contact" className="help-cta__btn help-cta__btn--primary">Contact us</a>
              <a href="#" className="help-cta__btn">Start live chat</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
