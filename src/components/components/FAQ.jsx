import { useState } from "react";
import "../css/FAQ.css";

const FAQS = [
  { q: "How does the DIY repair option work?", a: "You can access step-by-step guides, videos, and articles to fix your device yourself. If you need extra help, you can also connect with a technician in real time." },
  { q: "Can I talk to a technician during my repair?", a: "Yes! You can book a voice or video call with one of our expert technicians at any time. They'll guide you through the repair process step by step, answer your questions live, and make sure you feel confident every step of the way." },
  { q: "How does the shipment process work?", a: "Simply request a shipment pickup through your dashboard. We'll arrange a courier to collect your device, and our team will diagnose and repair it. You'll receive real-time tracking updates and your device will be returned safely once fixed." },
  { q: "How much does it cost to repair a device?", a: "Costs vary depending on the device type and repair needed. DIY guides are free. Live technician calls are charged per session, and shipment repairs are quoted after diagnosis. You'll always see pricing upfront before committing." },
  { q: "Is there a community where I can ask questions?", a: "Absolutely! Fixer has an active community forum where users share repair tips, ask questions, and help each other out. You can also find curated answers from our certified technicians." },
  { q: "Can I track my repair status?", a: "Yes. Once your device is received, you'll get live status updates at every stage — diagnosis, repair in progress, quality check, and dispatch. You'll always know exactly where your device is." },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <section className="faq">
      <div className="faq__inner">
        <h2 className="faq__title">FAQs</h2>
        <p className="faq__sub">
          Find quick answers to common questions about DIY repairs, live technician support,
          and device shipment. Everything you need to know to get started and fix your device
          with confidence.
        </p>
        <div className="faq__list">
          {FAQS.map((item, i) => (
            <div className={`faq__item ${open === i ? "open" : ""}`} key={i}>
              <button className="faq__trigger" onClick={() => toggle(i)}>
                <span className="faq__question">{item.q}</span>
                <span className="faq__icon">{open === i ? "×" : "+"}</span>
              </button>
              <div className="faq__body">
                <p className="faq__answer">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
      <div className="faq__watermark" aria-hidden="true">fixer</div>
    </section>
  );
}
