import { useState } from "react";
import axios from "axios";
import "./css/BookCall.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Updated working hours: 8:00 AM to 10:00 PM
const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"
];

const DEVICE_TYPES = ["Smartphone","Laptop","Tablet","Desktop PC","Smart Watch","Gaming Console","Other"];

const SUPPORT_TYPES = [
  { id: "voice", title: "Voice Call", desc: "Speak directly with an expert via phone line.", cost: "$29" },
  { id: "video", title: "Video Call", desc: "Face-to-face assistance via Google Meet.", cost: "$49" },
  { id: "remote", title: "Remote Support", desc: "Secure remote desktop access via TeamViewer/AnyDesk.", cost: "$69" }
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

// Convert "8:00 AM" -> "08:00:00" for the backend's TIME column.
function to24Hour(timeLabel) {
  const [time, period] = timeLabel.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export default function BookCall() {
  const today = new Date();
  const [step, setStep] = useState(1);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Flow State
  const [form, setForm] = useState({ name: "", email: "", device: "", issue: "" });
  const [supportType, setSupportType] = useState("");
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvc: "" });

  const [deviceDropOpen, setDeviceDropOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [bookingReference, setBookingReference] = useState(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const isPast = (day) => {
    const d = new Date(year, month, day);
    d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };

  const selectedLabel = selectedDate
    ? `${DAYS[new Date(year, month, selectedDate).getDay()]}, ${MONTHS[month]} ${selectedDate}, ${year}`
    : "";

  const handleNextStep = () => {
    if (step === 1 && selectedDate && selectedTime) setStep(2);
    else if (step === 2 && form.name && form.email) setStep(3);
    else if (step === 3 && supportType) setStep(4);
    else if (step === 4 && payment.cardNumber && payment.expiry && payment.cvc) setStep(5);
  };

  const handleBackStep = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!user?.id) {
      setSubmitError("You need to be logged in to book a call.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/bookings`, {
        user_id: user.id,
        support_type: supportType,
        booking_date: `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`,
        booking_time: to24Hour(selectedTime),
        duration: 30,
        issue_summary: form.issue || null,
        device: form.device || null,
      });

      setBookingReference(res.data.booking_reference);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to confirm booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setBookingReference(null);
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setSupportType("");
    setForm({ name:"", email:"", device:"", issue:"" });
    setPayment({ cardNumber: "", expiry: "", cvc: "" });
  };

  // Helper to generate dynamic Google Calendar invite file
  const downloadCalendarInvite = () => {
    const eventDetails = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Device Repair Call (${supportType.toUpperCase()})\nDESCRIPTION:Expert troubleshooting appointment.\nDTSTART:${year}${String(month + 1).padStart(2, '0')}${String(selectedDate).padStart(2, '0')}T120000Z\nDURATION:PT30M\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([eventDetails], { type: "text/calendar;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "repair_appointment.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (submitted) {
    return (
      <div className="bookcall__success">
        <div className="bookcall__success-icon">✓</div>
        <h2>Booking Confirmed!</h2>
        {bookingReference && <p className="bookcall__reference">Reference: <strong>{bookingReference}</strong></p>}
        <p>Your <strong>{SUPPORT_TYPES.find(t => t.id === supportType)?.title}</strong> is scheduled for <strong>{selectedLabel}</strong> at <strong>{selectedTime}</strong>.</p>
        <p>A receipt and confirmation link have been sent to <strong>{form.email}</strong>. A technician will be assigned to your booking shortly.</p>

        <div className="bookcall__action-box">
          {supportType === "voice" && (
            <>
              <h4>📞 Action Required: Call Us at Appointment Time</h4>
              <p>Please dial our support number: <strong>+2348093625430</strong>. Your session pin is your registered phone/email.</p>
            </>
          )}
          {supportType === "video" && (
            <>
              <h4>🎥 Google Meet Link Generated</h4>
              <p>Your secure meeting space: <a href="https://meet.google.com/abc-defg-hij" target="_blank" rel="noreferrer">meet.google.com/abc-defg-hij</a>. This link has also been added to your calendar event.</p>
            </>
          )}
          {supportType === "remote" && (
            <>
              <h4>💻 Remote Support Ready</h4>
              <p>Please ensure you have <strong>TeamViewer</strong> or <strong>AnyDesk</strong> downloaded before the session. Our technician will ask for your Access ID when they reach out.</p>
            </>
          )}
        </div>

        <button className="bookcall__btn bookcall__btn--ghost" onClick={downloadCalendarInvite} style={{ marginRight: '10px', marginTop: '15px' }}>
          📅 Add to Calendar
        </button>
        <button className="bookcall__btn bookcall__btn--primary" onClick={resetForm}>
          Book another call
        </button>
      </div>
    );
  }

  return (
    <div className="book">
      <div className="bookcall">
        
        {/* Header & Step Tracking Wizard Line */}
        <div className="bookcall__header">
          <h1 className="bookcall__title">Book an Expert Call</h1>
          <div className="bookcall__steps">
            <div className={`bookcall__step ${step >= 1 ? "active" : ""}`}><span className="bookcall__step-num">1</span><span className="bookcall__step-label">Time</span></div>
            <div className="bookcall__step-line" />
            <div className={`bookcall__step ${step >= 2 ? "active" : ""}`}><span className="bookcall__step-num">2</span><span className="bookcall__step-label">Details</span></div>
            <div className="bookcall__step-line" />
            <div className={`bookcall__step ${step >= 3 ? "active" : ""}`}><span className="bookcall__step-num">3</span><span className="bookcall__step-label">Type</span></div>
            <div className="bookcall__step-line" />
            <div className={`bookcall__step ${step >= 4 ? "active" : ""}`}><span className="bookcall__step-num">4</span><span className="bookcall__step-label">Payment</span></div>
            <div className="bookcall__step-line" />
            <div className={`bookcall__step ${step >= 5 ? "active" : ""}`}><span className="bookcall__step-num">5</span><span className="bookcall__step-label">Confirm</span></div>
          </div>
        </div>

        {/* Universal Banner for displaying current data selection */}
        {step > 1 && (
          <div className="bookcall__confirm-banner">
            <span className="banner-item">📅 {selectedLabel} @ {selectedTime}</span>
            {supportType && <span className="banner-item"> • ⚙️ {SUPPORT_TYPES.find(t => t.id === supportType)?.title}</span>}
            <button className="bookcall__change" onClick={() => setStep(1)}>Restart</button>
          </div>
        )}

        {/* STEP 1 — Calendar + Time (8am - 10pm Working Hours) */}
        {step === 1 && (
          <div className="bookcall__body">
            <div className="bookcall__calendar-wrap">
              <div className="bookcall__cal-nav">
                <button className="bookcall__cal-arrow" onClick={prevMonth}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="bookcall__cal-month">{MONTHS[month]} {year}</span>
                <button className="bookcall__cal-arrow" onClick={nextMonth}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              <div className="bookcall__cal-grid">
                {DAYS.map(d => <div key={d} className="bookcall__cal-dayname">{d}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const past = isPast(day);
                  const sel = selectedDate === day;
                  return (
                    <button
                      key={day}
                      className={`bookcall__cal-day ${past ? "past" : ""} ${sel ? "selected" : ""}`}
                      onClick={() => !past && setSelectedDate(day)}
                      disabled={past}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bookcall__time-wrap">
              <h3 className="bookcall__time-title">
                {selectedDate ? `Available Times (8:00 AM - 10:00 PM)` : "Select a date to see available times"}
              </h3>
              {selectedDate && (
                <div className="bookcall__time-grid">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      className={`bookcall__time-slot ${selectedTime === t ? "selected" : ""}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bookcall__footer">
              <button
                className={`bookcall__btn bookcall__btn--primary ${(!selectedDate || !selectedTime) ? "disabled" : ""}`}
                onClick={handleNextStep}
                disabled={!selectedDate || !selectedTime}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Details Form */}
        {step === 2 && (
          <div className="bookcall__body bookcall__body--form">
            <div className="bookcall__form">
              <div className="bookcall__form-row">
                <div className="bookcall__field">
                  <label className="bookcall__label">Full name</label>
                  <input className="bookcall__input" type="text" placeholder="John Doe"
                    value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className="bookcall__field">
                  <label className="bookcall__label">Email address</label>
                  <input className="bookcall__input" type="email" placeholder="john@email.com"
                    value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                </div>
              </div>

              <div className="bookcall__field">
                <label className="bookcall__label">Device type</label>
                <div className="bookcall__select-wrap">
                  <button className="bookcall__select" onClick={() => setDeviceDropOpen(v => !v)}>
                    <span className={form.device ? "" : "placeholder"}>{form.device || "Choose a device"}</span>
                  </button>
                  {deviceDropOpen && (
                    <ul className="bookcall__dropdown">
                      {DEVICE_TYPES.map(d => (
                        <li key={d} className={`bookcall__dropdown-item ${form.device === d ? "selected" : ""}`}
                          onClick={() => { setForm(f => ({...f, device: d})); setDeviceDropOpen(false); }}>
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="bookcall__field">
                <label className="bookcall__label">Describe your issue</label>
                <textarea className="bookcall__textarea" rows={3} placeholder="What is happening with your device?"
                  value={form.issue} onChange={e => setForm(f => ({...f, issue: e.target.value}))} />
              </div>

              <div className="bookcall__form-actions">
                <button className="bookcall__btn bookcall__btn--ghost" onClick={handleBackStep}>Back</button>
                <button className={`bookcall__btn bookcall__btn--primary ${(!form.name || !form.email) ? "disabled" : ""}`}
                  onClick={handleNextStep} disabled={!form.name || !form.email}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Select Call/Support Type */}
        {step === 3 && (
          <div className="bookcall__body">
            <h3>Choose Support Type</h3>
            <div className="bookcall__support-list">
              {SUPPORT_TYPES.map(type => (
                <div key={type.id} 
                  className={`bookcall__support-card ${supportType === type.id ? "selected" : ""}`}
                  onClick={() => setSupportType(type.id)}
                >
                  <div className="support-card__info">
                    <h4>{type.title}</h4>
                    <p>{type.desc}</p>
                  </div>
                  <div className="support-card__cost">{type.cost}</div>
                </div>
              ))}
            </div>
            <div className="bookcall__form-actions" style={{ marginTop: '20px' }}>
              <button className="bookcall__btn bookcall__btn--ghost" onClick={handleBackStep}>Back</button>
              <button className={`bookcall__btn bookcall__btn--primary ${!supportType ? "disabled" : ""}`}
                onClick={handleNextStep} disabled={!supportType}>Continue</button>
            </div>
          </div>
        )}

        {/* STEP 4 — Payment Details */}
        {step === 4 && (
          <div className="bookcall__body bookcall__body--form">
            <h3>Payment Details</h3>
            <p className="payment-total">Total Amount: <strong>{SUPPORT_TYPES.find(t => t.id === supportType)?.cost}</strong></p>
            <div className="bookcall__form">
              <div className="bookcall__field">
                <label className="bookcall__label">Card Number</label>
                <input className="bookcall__input" type="text" placeholder="💳 4111 2222 3333 4444"
                  value={payment.cardNumber} onChange={e => setPayment(p => ({...p, cardNumber: e.target.value}))} />
              </div>
              <div className="bookcall__form-row">
                <div className="bookcall__field">
                  <label className="bookcall__label">Expiry Date</label>
                  <input className="bookcall__input" type="text" placeholder="MM/YY"
                    value={payment.expiry} onChange={e => setPayment(p => ({...p, expiry: e.target.value}))} />
                </div>
                <div className="bookcall__field">
                  <label className="bookcall__label">CVC</label>
                  <input className="bookcall__input" type="password" placeholder="123"
                    value={payment.cvc} onChange={e => setPayment(p => ({...p, cvc: e.target.value}))} />
                </div>
              </div>
              <p className="bookcall__payment-note">
                Payment is simulated for now — no card details are transmitted or stored.
              </p>
              <div className="bookcall__form-actions">
                <button className="bookcall__btn bookcall__btn--ghost" onClick={handleBackStep}>Back</button>
                <button className={`bookcall__btn bookcall__btn--primary ${(!payment.cardNumber || !payment.expiry || !payment.cvc) ? "disabled" : ""}`}
                  onClick={handleNextStep} disabled={!payment.cardNumber || !payment.expiry || !payment.cvc}>Secure Checkout</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — Review Booking & Submit */}
        {step === 5 && (
          <div className="bookcall__body">
            <h3>Review Your Booking</h3>
            <div className="bookcall__review-panel">
              <div className="review-item"><strong>Name:</strong> {form.name}</div>
              <div className="review-item"><strong>Email:</strong> {form.email}</div>
              <div className="review-item"><strong>Device:</strong> {form.device || "N/A"}</div>
              <div className="review-item"><strong>Service Type:</strong> {SUPPORT_TYPES.find(t => t.id === supportType)?.title}</div>
              <div className="review-item"><strong>Date & Time:</strong> {selectedLabel} at {selectedTime}</div>
              {form.issue && <div className="review-item"><strong>Issue:</strong> "{form.issue}"</div>}
            </div>

            {submitError && <p className="bookcall__error">{submitError}</p>}

            <div className="bookcall__form-actions" style={{ marginTop: '25px' }}>
              <button className="bookcall__btn bookcall__btn--ghost" onClick={handleBackStep} disabled={submitting}>Back</button>
              <button className="bookcall__btn bookcall__btn--primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Confirming..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
