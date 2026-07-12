import "../css/About.css";

const FEATURES = [
  {
   
    title: "Verified, step-by-step guidance",
    desc: "Step-by-step guides and how-to content to help you fix your gadget, tailored to your specific device model.",
  },
  {
    
    title: "Door-to-door pickup",
    desc: "Schedule a collection and we'll handle everything — from pickup to repair and safe return.",
  },
  {
    
    title: "Transparent Repair Tracking",
    desc: "Stay updated at every stage — from device received, to diagnosis, repair, and final delivery.",
  },
  {
    
    title: "Real time support",
    desc: "Connect with experienced technicians through video or audio calls whenever you need help.",
  },
];

export default function About() {
  return (
    <section className="about">
      <div className="about__inner">
        <div className="about__left">
          <h2 className="about__eyebrow">What We're Good At</h2>
          <p className="about__title">
            We combine professional-grade repair expertise with an open DIY community —
            no one else does this.
          </p>
          <p className="about__body">
             Our mission is to empower users with clear,
            step-by-step guidance to repair their gadgets, learn more about how their
            devices work, and easily ship them for professional repair when needed.
          </p>
        </div>

        <div className="about__right">
          <div className="about__grid">
            {FEATURES.map((f, i) => (
              <div className="about__card" key={i}>
                <h4 className="about__card-title">{f.title}</h4>
                <p className="about__card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
