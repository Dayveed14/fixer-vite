import { useState } from "react";
import "../css/Testimonials.css";

const TESTIMONIALS = [
  { name: "Dame Patience Johnathan", avatar: "https://i.pravatar.cc/80?img=47", text: "The DIY video tutorials are incredibly detailed! I fixed my laptop screen myself following their step-by-step guide. Saved me money and learned something new." },
  { name: "Olaniyi Adebayo", avatar: "https://i.pravatar.cc/80?img=15", text: "My PS5 controller drift was driving me absolutely crazy mid-game. I found the fix on here in under 2 minutes — clear video, easy steps, right tools listed. Fixed it the same evening. This app literally saved my setup." },
  { name: "Silas Francis", avatar: "https://i.pravatar.cc/80?img=8", text: "My tablet charging port snapped and I wanted to try fixing it myself. Found the guide, watched the video, and the repair came out perfect. These people know what they're doing." },
  { name: "Aisha Musa", avatar: "https://i.pravatar.cc/80?img=49", text: "I shipped my MacBook for repair and had it back in 3 days, good as new. The tracking updates were reassuring throughout the whole process." },
  { name: "Kevin Osei", avatar: "https://i.pravatar.cc/80?img=13", text: "Got on a video call with a tech and they walked me through fixing my phone's charging port. Absolute lifesaver. Didn't have to spend a dime at a shop." },
];

export default function Testimonials() {
  const [active, setActive] = useState(2);
  const offClasses = ["t-n2","t-n1","t-0","t-p1","t-p2"];

  return (
    <section className="testimonials">
      <div className="testimonials__header">
        <span className="testimonials__quote-l">"</span>
        <div>
          <h2 className="testimonials__title">What Our Users Say</h2>
          <p className="testimonials__sub">
            Hear from people who've successfully repaired their devices using our platform.
            From quick DIY fixes to guided support and seamless shipments, our users share
            real experiences you can trust.
          </p>
        </div>
        <span className="testimonials__quote-r">"</span>
      </div>

      <div className="testimonials__carousel">
        {TESTIMONIALS.map((t, i) => {
          const dist = Math.max(-2, Math.min(2, i - active));
          const cls = offClasses[dist + 2];
          const isCenter = dist === 0;
          const isAdj   = Math.abs(dist) === 1;
          const isFar   = Math.abs(dist) >= 2;
          return (
            <div
              key={i}
              className={`testimonials__card ${cls} ${isCenter ? "center" : ""} ${isAdj ? "adjacent" : ""} ${isFar ? "far" : ""}`}
              onClick={() => !isCenter && setActive(i)}
            >
              <img src={t.avatar} alt={t.name} className="testimonials__avatar" />
              <p className="testimonials__name">{t.name}</p>
              {isCenter && <p className="testimonials__text">{t.text}</p>}
            </div>
          );
        })}
      </div>

      <div className="testimonials__dots">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} className={`testimonials__dot ${i === active ? "active" : ""}`} onClick={() => setActive(i)} />
        ))}
      </div>
    </section>
  );
}
