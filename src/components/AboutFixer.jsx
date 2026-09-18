import "./css/StaticPage.css";
import Navbar from "./components/Navbar";
import SEO from "./SEO";
import imgFixer from "./img/imgg.png";

const TEAM = [
  { name: "David Aigbovbiosa", role: "Founder", avatar: imgFixer }
];

const VALUES = [
  { icon: "🔧", title: "Expertise First", desc: "Every guide and recommendation is verified by certified technicians with real hands-on experience." },
  { icon: "🤝", title: "Community Driven", desc: "We believe in the power of shared knowledge. Our community grows stronger with every fix." },
  { icon: "🔍", title: "Radical Transparency", desc: "No hidden fees, no vague estimates. You always know what's happening with your device." },
  { icon: "♻️", title: "Sustainability", desc: "Repairing devices instead of replacing them reduces e-waste and is better for the planet." },
];

export default function AboutFixer() {
  return (
    <div className="static-page">
      <SEO
        title="About Fixer"
        description="Fixer is on a mission to make device repair accessible to everyone — combining expert technicians, a DIY community, and smart diagnostic tools."
        path="/about"
      />
<Navbar />
      {/* Hero */}
      <section className="static-hero static-hero--blue">
        <p className="static-hero__eyebrow">About Us</p>
        <h1 className="static-hero__title">We're on a mission to make device repair accessible to everyone</h1>
         <p className="static-hero__sub">
          Fixer was built because getting your gadget repaired shouldn't be expensive, confusing, or stressful.
          We combine expert technicians, a DIY community, and smart AI tools — so you always have a path forward.
        </p>
      </section>

      {/* Story */}
      <section className="static-section">
        <div className="static-section__inner static-section__inner--split">
          <div>
             <h2 className="static-section__title">Our Story</h2>
            <p className="static-section__body">
              Fixer was birthed in 2022 when a young IT technician realized that millions of people discard working devices
              simply because they don't know how to fix a small fault — or can't afford professional repair shops.
            </p>
            <p className="static-section__body" style={{ marginTop: 16 }}>
              We set out to build a platform where anyone — from a first-time DIYer to a seasoned technician —
              could get the help they need.
            </p>
          </div>
          <div className="static-stats-grid">
            {[
              { v: "X", l: "Repairs completed" },
              { v: "X", l: "DIY articles" },
              { v: "98%", l: "Satisfaction rate" },
              { v: "X", l: "Daily active users" },
            ].map(s => (
              <div className="static-stat" key={s.l}>
                <span className="static-stat__value">{s.v}</span>
                <span className="static-stat__label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="static-section static-section--soft">
        <div className="static-section__inner">
          <h2 className="static-section__title static-section__title--center">What we stand for</h2>
          <div className="static-cards-grid">
            {VALUES.map(v => (
              <div className="static-card static-card--blue" key={v.title}>
                <span className="static-card__icon">{v.icon}</span>
                <h3 className="static-card__title">{v.title}</h3>
                <p className="static-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="static-section">
        <div className="static-section__inner">
          <h2 className="static-section__title static-section__title--center">Meet the team</h2>
          <div className="static-team-grid">
            {TEAM.map(t => (
              <div className="static-team-card" key={t.name}>
                <img src={t.avatar} alt={t.name} className="static-team-avatar" />
                <h3 className="static-team-name">{t.name}</h3>
                <p className="static-team-role">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
