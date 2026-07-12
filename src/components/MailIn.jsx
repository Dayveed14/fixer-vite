import { useState } from "react";
import "./css/Shipment.css";
import Navbar from "./components/Navbar";

const STEPS = [
  { icon: "📦", title: "Request pickup", desc: "Fill in your device details and address. We'll schedule a courier to collect your device at your convenience." },
  { icon: "🔍", title: "Diagnosis", desc: "Our technicians run a full diagnostic on your device and send you a detailed report with repair options and pricing." },
  { icon: "🔧", title: "Repair", desc: "Once you approve, our certified technicians carry out the repair using quality parts." },
  { icon: "🚚", title: "Safe return", desc: "Your repaired device is securely packaged and shipped back to you. Track every step of the journey." },
];

const DEVICE_TYPES = ["Smartphone","Laptop","Tablet","Desktop PC","Smart Watch","Gaming Console","Other"];

export default function Shipment() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    device: "", brand: "", fault: "",
    address: "", city: "", notes: "",
  });
  const [deviceDropOpen, setDeviceDropOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    if (form.name && form.email && form.device && form.address) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="shipment__success">
        <div className="shipment__success-icon">✓</div>
        <h2>Shipment Requested!</h2>
        <p>We've received your request. A courier will be in touch within 24 hours to arrange pickup from <strong>{form.address}, {form.city}</strong>.</p>
        <p>Updates will be sent to <strong>{form.email}</strong>.</p>
        <button className="shipment__btn shipment__btn--primary" onClick={() => setSubmitted(false)}>
          Submit another request
        </button>
      </div>
    );
  }

  return (
    
        <div className="ship">
    <div className="shipment">
      {/* LEFT — info panel */}
      <div className="shipment__left">
        <h1 className="shipment__title">Shipment for Repair</h1>
        <p className="shipment__sub">
          Can't fix it yourself? Send your device in for professional repair.
          Schedule a collection, and we'll handle everything from pickup to
          repair and safe return—keeping you updated every step of the way.
        </p>

        <div className="shipment__steps">
          {STEPS.map((s, i) => (
            <div className="shipment__step" key={i}>
              <div className="shipment__step-left">
                <div className="shipment__step-icon">{s.icon}</div>
                {i < STEPS.length - 1 && <div className="shipment__step-connector" />}
              </div>
              <div className="shipment__step-content">
                <h4 className="shipment__step-title">{s.title}</h4>
                <p className="shipment__step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="shipment__right">
        <p className="shipment__form-heading">Tell us about your device and where to collect it</p>

        {/* Personal info */}
        <div className="shipment__section-label">Your details</div>
        <div className="shipment__row">
          <div className="shipment__field">
            <label className="shipment__label">Full name</label>
            <input className="shipment__input" type="text" placeholder="e.g. John Doe" value={form.name} onChange={set("name")} />
          </div>
          <div className="shipment__field">
            <label className="shipment__label">Email address</label>
            <input className="shipment__input" type="email" placeholder="e.g. john@email.com" value={form.email} onChange={set("email")} />
          </div>
        </div>

        <div className="shipment__field shipment__field--full">
          <label className="shipment__label">Phone number</label>
          <input className="shipment__input" type="tel" placeholder="e.g. +234 800 000 0000" value={form.phone} onChange={set("phone")} />
        </div>

        {/* Device info */}
        <div className="shipment__section-label">Device details</div>
        <div className="shipment__row">
          <div className="shipment__field">
            <label className="shipment__label">Device type</label>
            <div className="shipment__select-wrap">
              <button className="shipment__select" onClick={() => setDeviceDropOpen(v => !v)}>
                <span className={form.device ? "" : "placeholder"}>{form.device || "Choose a device"}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {deviceDropOpen && (
                <ul className="shipment__dropdown">
                  {DEVICE_TYPES.map(d => (
                    <li key={d} className={`shipment__dropdown-item ${form.device === d ? "selected" : ""}`}
                      onClick={() => { setForm(f => ({...f, device: d})); setDeviceDropOpen(false); }}>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="shipment__field">
            <label className="shipment__label">Brand / Model</label>
            <input className="shipment__input" type="text" placeholder="e.g. iPhone 17 Pro" value={form.brand} onChange={set("brand")} />
          </div>
        </div>

        <div className="shipment__field shipment__field--full">
          <label className="shipment__label">Primary fault</label>
          <input className="shipment__input" type="text" placeholder="e.g. Cracked screen, water damage..." value={form.fault} onChange={set("fault")} />
        </div>

        {/* Pickup address */}
        <div className="shipment__section-label">Pickup address</div>
        <div className="shipment__field shipment__field--full">
          <label className="shipment__label">Street address</label>
          <input className="shipment__input" type="text" placeholder="e.g. 14 Adeola Odeku Street" value={form.address} onChange={set("address")} />
        </div>
        <div className="shipment__field shipment__field--full">
          <label className="shipment__label">City / State</label>
          <input className="shipment__input" type="text" placeholder="e.g. Lagos, Nigeria" value={form.city} onChange={set("city")} />
        </div>

        {/* Notes */}
        <div className="shipment__field shipment__field--full">
          <label className="shipment__label">Additional notes (optional)</label>
          <textarea className="shipment__textarea" rows={4}
            placeholder="e.g. Please call before arriving. Device is in a blue case..."
            value={form.notes} onChange={set("notes")} />
        </div>

        <div className="shipment__actions">
          <button
            className={`shipment__btn shipment__btn--primary ${(!form.name || !form.email || !form.device || !form.address) ? "disabled" : ""}`}
            onClick={handleSubmit}
            disabled={!form.name || !form.email || !form.device || !form.address}
          >
            Request pickup
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 14.25L14.25 3.75M14.25 3.75H6.75M14.25 3.75V11.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
