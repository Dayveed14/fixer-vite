import { useEffect, useMemo, useState } from "react";
import { usePaystackPayment } from "react-paystack";
import "./css/BookCall.css";
import { getStoredUser } from "../api/client";
import { initializePayment as initializeServerPayment } from "../api/payments.api";
import { createBooking, getSupportTypes } from "../api/bookings.api";
import {
  availableSlots,
  formatSlot,
  isDateBookable,
  nowInBusinessTz,
  parseTime,
  toDateString,
} from "../utils/schedule";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEVICE_TYPES = [
  "Smartphone",
  "Laptop",
  "Tablet",
  "Desktop PC",
  "Smart Watch",
  "Gaming Console",
  "Other",
];

// Display copy. Prices shown here are refreshed from the server
// (GET /api/bookings/support-types) and the amount actually charged is
// always the one the server returns when the payment is initialised.
const DEFAULT_SUPPORT_TYPES = [
  {
    id: "voice",
    title: "Voice Call",
    desc: "Speak directly with an expert via phone line.",
    amount: 5000,
  },
  {
    id: "video",
    title: "Video Call",
    desc: "Face-to-face assistance via Google Meet.",
    amount: 7000,
  },
  {
    id: "remote",
    title: "Remote Support",
    desc: "Secure remote desktop access via TeamViewer/AnyDesk.",
    amount: 10000,
  },
];

const naira = (amount) => `₦${Number(amount).toLocaleString()}`;

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function BookCall() {
  // "now" ticks every minute so today's slots disappear as time passes.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const todayAbuja = nowInBusinessTz(now).date;
  const [todayYear, todayMonth] = todayAbuja.split("-").map(Number);

  const storedUser = getStoredUser();

  const [step, setStep] = useState(1);
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth - 1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null); // "HH:MM"

  // Flow State
  const [form, setForm] = useState({
    name: storedUser
      ? `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim()
      : "",
    email: storedUser?.email || "",
    device: "",
    issue: "",
  });
  const [supportTypes, setSupportTypes] = useState(DEFAULT_SUPPORT_TYPES);
  const [supportType, setSupportType] = useState("");
  const [paymentReference, setPaymentReference] = useState(null);
  const [paying, setPaying] = useState(false);

  const [deviceDropOpen, setDeviceDropOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [bookingReference, setBookingReference] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSupportTypes()
      .then((types) => {
        if (cancelled || !Array.isArray(types)) return;
        setSupportTypes((current) =>
          current.map((t) => {
            const server = types.find((s) => s.id === t.id);
            return server ? { ...t, amount: server.amount } : t;
          }),
        );
      })
      .catch(() => {
        /* keep defaults; the server still decides the charge */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dateString = selectedDate ? toDateString(year, month, selectedDate) : null;

  const slots = useMemo(
    () => (dateString ? availableSlots(dateString, "booking", now) : []),
    [dateString, now],
  );

  // If the chosen time slips into the past while the customer is on
  // this step, drop it so they can't continue with it.
  useEffect(() => {
    if (step === 1 && selectedTime && !slots.includes(selectedTime)) {
      setSelectedTime(null);
    }
  }, [slots, selectedTime, step]);

  const isCurrentMonth = year === todayYear && month === todayMonth - 1;

  const prevMonth = () => {
    if (isCurrentMonth) return;
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  // A day is unavailable if it's past, too far ahead, or (today) has no
  // slots left — e.g. after 9 PM.
  const isUnavailable = (day) =>
    !isDateBookable(toDateString(year, month, day), "booking", now);

  const selectedLabel = selectedDate
    ? `${DAYS[new Date(year, month, selectedDate).getDay()]}, ${MONTHS[month]} ${selectedDate}, ${year}`
    : "";
  const selectedTimeLabel = selectedTime ? formatSlot(selectedTime) : "";

  const handleNextStep = () => {
    setSubmitError(null);
    if (step === 1 && selectedDate && selectedTime) setStep(2);
    else if (step === 2 && form.name && form.email) setStep(3);
    else if (step === 3 && supportType) setStep(4);
  };

  const handleBackStep = () => {
    setSubmitError(null);
    if (step > 1) setStep((prev) => prev - 1);
  };

  const selectedType = supportTypes.find((t) => t.id === supportType);

  const openPaystack = usePaystackPayment({
    publicKey: PAYSTACK_PUBLIC_KEY,
  });

  const confirmBooking = async (reference) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createBooking({
        support_type: supportType,
        booking_date: dateString,
        booking_time: selectedTime,
        issue_summary: form.issue || null,
        device: form.device || null,
        payment_reference: reference,
      });

      setBookingReference(result.booking_reference);
      setMeetingUrl(result.meeting_url || null);
      setSubmitted(true);
    } catch (err) {
      // The payment is safe on the server: retrying with the same
      // reference either creates the booking or returns the one that
      // already exists — never a second charge or a duplicate.
      setSubmitError(
        `${err.message} Your payment reference is ${reference}. You can retry below, or contact support with it.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const payAndBook = async () => {
    if (!selectedType) return;

    if (!getStoredUser()) {
      setSubmitError("You need to be logged in to book a call.");
      return;
    }

    // Re-check the slot right before charging.
    if (!availableSlots(dateString, "booking", new Date()).includes(selectedTime)) {
      setSubmitError(
        "That time is no longer available. Please pick another time.",
      );
      setSelectedTime(null);
      setStep(1);
      return;
    }

    setSubmitError(null);
    setPaying(true);

    let intent;
    try {
      // The server prices the call and registers the payment against
      // this account and slot before Paystack is opened.
      intent = await initializeServerPayment({
        purpose: "booking",
        support_type: supportType,
        booking_date: dateString,
        booking_time: selectedTime,
      });
    } catch (err) {
      setPaying(false);
      setSubmitError(err.message);
      return;
    }

    openPaystack({
      config: {
        email: intent.email,
        amount: intent.amount_kobo,
        currency: intent.currency,
        reference: intent.reference,
        metadata: {
          name: form.name,
          support_type: supportType,
        },
      },
      onSuccess: (response) => {
        setPaying(false);
        setPaymentReference(response.reference || intent.reference);
        confirmBooking(response.reference || intent.reference);
      },
      onClose: () => {
        setPaying(false);
      },
    });
  };

  const resetForm = () => {
    setSubmitted(false);
    setBookingReference(null);
    setMeetingUrl(null);
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setSupportType("");
    setForm((f) => ({ ...f, device: "", issue: "" }));
    setPaymentReference(null);
    setSubmitError(null);
  };

  // Abuja is UTC+1 year-round, so the UTC start is one hour earlier.
  const icsStart = () => {
    const minutes = parseTime(selectedTime) - 60;
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    return `${dateString.replace(/-/g, "")}T${hh}${mm}00Z`;
  };

  // Helper to generate dynamic Google Calendar invite file
  const downloadCalendarInvite = () => {
    const eventDetails = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Device Repair Call (${supportType.toUpperCase()})\nDESCRIPTION:Expert troubleshooting appointment.\nDTSTART:${icsStart()}\nDURATION:PT30M\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([eventDetails], {
      type: "text/calendar;charset=utf-8;",
    });
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
        {bookingReference && (
          <p className="bookcall__reference">
            Reference: <strong>{bookingReference}</strong>
          </p>
        )}
        <p>
          Your{" "}
          <strong>
            {selectedType?.title}
          </strong>{" "}
          is scheduled for <strong>{selectedLabel}</strong> at{" "}
          <strong>{selectedTimeLabel}</strong> (Abuja time).
        </p>
        <p>
          A receipt and confirmation link have been sent to{" "}
          <strong>{form.email}</strong>. A technician will be assigned to your
          booking shortly.
        </p>

        <div className="bookcall__action-box">
          {supportType === "voice" && (
            <>
              <h4>📞 We'll call you</h4>
              <p>
                At your appointment time, your technician will call the phone
                number on your Fixer account (by phone or WhatsApp). Keep your
                phone nearby.
              </p>
            </>
          )}
          {supportType === "video" && (
            <>
              <h4>🎥 Your video call link</h4>
              {meetingUrl ? (
                <p>
                  Join here at your appointment time:{" "}
                  <a href={meetingUrl} target="_blank" rel="noreferrer">
                    {meetingUrl.replace(/^https?:\/\//, "")}
                  </a>
                  . We've emailed it to you too, and it's on your appointment page.
                </p>
              ) : (
                <p>
                  Your video link will appear on your appointment page before
                  the session.
                </p>
              )}
            </>
          )}
          {supportType === "remote" && (
            <>
              <h4>💻 Remote Support Ready</h4>
              <p>
                Please ensure you have <strong>TeamViewer</strong> or{" "}
                <strong>AnyDesk</strong> downloaded before the session. Our
                technician will ask for your Access ID when they reach out.
              </p>
            </>
          )}
        </div>

        <button
          className="bookcall__btn bookcall__btn--ghost"
          onClick={downloadCalendarInvite}
          style={{ marginRight: "10px", marginTop: "15px" }}>
          📅 Add to Calendar
        </button>
        <button
          className="bookcall__btn bookcall__btn--primary"
          onClick={resetForm}>
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
            <div className={`bookcall__step ${step >= 1 ? "active" : ""}`}>
              <span className="bookcall__step-num">1</span>
              <span className="bookcall__step-label">Time</span>
            </div>
            <div className="bookcall__step-line" />
            <div className={`bookcall__step ${step >= 2 ? "active" : ""}`}>
              <span className="bookcall__step-num">2</span>
              <span className="bookcall__step-label">Details</span>
            </div>
            <div className="bookcall__step-line" />
            <div className={`bookcall__step ${step >= 3 ? "active" : ""}`}>
              <span className="bookcall__step-num">3</span>
              <span className="bookcall__step-label">Type</span>
            </div>
            <div className="bookcall__step-line" />
            <div className={`bookcall__step ${step >= 4 ? "active" : ""}`}>
              <span className="bookcall__step-num">4</span>
              <span className="bookcall__step-label">Review & Pay</span>
            </div>
          </div>
        </div>

        {/* Universal Banner for displaying current data selection */}
        {step > 1 && (
          <div className="bookcall__confirm-banner">
            <span className="banner-item">
              📅 {selectedLabel} @ {selectedTimeLabel}
            </span>
            {supportType && (
              <span className="banner-item">
                {" "}
                • ⚙️ {selectedType?.title}
              </span>
            )}
            <button
              className="bookcall__change"
              onClick={() => setStep(1)}
              disabled={paying || submitting || Boolean(paymentReference)}>
              Restart
            </button>
          </div>
        )}

        {/* STEP 1 — Calendar + Time (8am - 10pm Working Hours) */}
        {step === 1 && (
          <div className="bookcall__body">
            <div className="bookcall__calendar-wrap">
              <div className="bookcall__cal-nav">
                <button
                  className="bookcall__cal-arrow"
                  onClick={prevMonth}
                  disabled={isCurrentMonth}
                  aria-label="Previous month">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10 3L5 8l5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="bookcall__cal-month">
                  {MONTHS[month]} {year}
                </span>
                <button
                  className="bookcall__cal-arrow"
                  onClick={nextMonth}
                  aria-label="Next month">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="bookcall__cal-grid">
                {DAYS.map((d) => (
                  <div key={d} className="bookcall__cal-dayname">
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const past = isUnavailable(day);
                  const sel = selectedDate === day;
                  return (
                    <button
                      key={day}
                      className={`bookcall__cal-day ${past ? "past" : ""} ${sel ? "selected" : ""}`}
                      onClick={() => {
                        if (past) return;
                        setSelectedDate(day);
                        setSelectedTime(null);
                      }}
                      disabled={past}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bookcall__time-wrap">
              <h3 className="bookcall__time-title">
                {selectedDate
                  ? "Available times (8:00 AM – 10:00 PM, Abuja time)"
                  : "Select a date to see available times"}
              </h3>
              {selectedDate && slots.length === 0 && (
                <p className="bookcall__no-slots">
                  No times left on this day. Please choose another date.
                </p>
              )}
              {selectedDate && slots.length > 0 && (
                <div className="bookcall__time-grid">
                  {slots.map((t) => (
                    <button
                      key={t}
                      className={`bookcall__time-slot ${selectedTime === t ? "selected" : ""}`}
                      onClick={() => setSelectedTime(t)}>
                      {formatSlot(t)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bookcall__footer">
              <button
                className={`bookcall__btn bookcall__btn--primary ${!selectedDate || !selectedTime ? "disabled" : ""}`}
                onClick={handleNextStep}
                disabled={!selectedDate || !selectedTime}>
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
                  <input
                    className="bookcall__input"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="bookcall__field">
                  <label className="bookcall__label">Email address</label>
                  <input
                    className="bookcall__input"
                    type="email"
                    placeholder="john@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="bookcall__field">
                <label className="bookcall__label">Device type</label>
                <div className="bookcall__select-wrap">
                  <button
                    className="bookcall__select"
                    onClick={() => setDeviceDropOpen((v) => !v)}>
                    <span className={form.device ? "" : "placeholder"}>
                      {form.device || "Choose a device"}
                    </span>
                  </button>
                  {deviceDropOpen && (
                    <ul className="bookcall__dropdown">
                      {DEVICE_TYPES.map((d) => (
                        <li
                          key={d}
                          className={`bookcall__dropdown-item ${form.device === d ? "selected" : ""}`}
                          onClick={() => {
                            setForm((f) => ({ ...f, device: d }));
                            setDeviceDropOpen(false);
                          }}>
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="bookcall__field">
                <label className="bookcall__label">Describe your issue</label>
                <textarea
                  className="bookcall__textarea"
                  rows={3}
                  placeholder="What is happening with your device?"
                  value={form.issue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, issue: e.target.value }))
                  }
                />
              </div>

              <div className="bookcall__form-actions">
                <button
                  className="bookcall__btn bookcall__btn--ghost"
                  onClick={handleBackStep}>
                  Back
                </button>
                <button
                  className={`bookcall__btn bookcall__btn--primary ${!form.name || !form.email ? "disabled" : ""}`}
                  onClick={handleNextStep}
                  disabled={!form.name || !form.email}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Select Call/Support Type */}
        {step === 3 && (
          <div className="bookcall__body">
            <h3>Choose Support Type</h3>
            <div className="bookcall__support-list">
              {supportTypes.map((type) => (
                <div
                  key={type.id}
                  className={`bookcall__support-card ${supportType === type.id ? "selected" : ""}`}
                  onClick={() => setSupportType(type.id)}>
                  <div className="support-card__info">
                    <h4>{type.title}</h4>
                    <p>{type.desc}</p>
                  </div>
                  <div className="support-card__cost">{naira(type.amount)}</div>
                </div>
              ))}
            </div>
            <div
              className="bookcall__form-actions"
              style={{ marginTop: "20px" }}>
              <button
                className="bookcall__btn bookcall__btn--ghost"
                onClick={handleBackStep}>
                Back
              </button>
              <button
                className={`bookcall__btn bookcall__btn--primary ${!supportType ? "disabled" : ""}`}
                onClick={handleNextStep}
                disabled={!supportType}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Review, pay via Paystack, booking confirmed automatically */}
        {step === 4 && (
          <div className="bookcall__body">
            <h3>Review & Pay</h3>
            <div className="bookcall__review-panel">
              <div className="review-item">
                <strong>Name:</strong> {form.name}
              </div>
              <div className="review-item">
                <strong>Email:</strong> {form.email}
              </div>
              <div className="review-item">
                <strong>Device:</strong> {form.device || "N/A"}
              </div>
              <div className="review-item">
                <strong>Service Type:</strong> {selectedType?.title}
              </div>
              <div className="review-item">
                <strong>Date & Time:</strong> {selectedLabel} at{" "}
                {selectedTimeLabel} (Abuja time)
              </div>
              {form.issue && (
                <div className="review-item">
                  <strong>Issue:</strong> "{form.issue}"
                </div>
              )}
            </div>

            <p className="payment-total">
              Total Amount:{" "}
              <strong>{selectedType ? naira(selectedType.amount) : ""}</strong>
            </p>
            <p className="bookcall__payment-note">
              You'll be securely redirected to Paystack to complete payment.
              Your booking is confirmed as soon as payment succeeds.
            </p>

            {submitError && (
              <p className="bookcall__error" role="alert">
                {submitError}
              </p>
            )}

            <div
              className="bookcall__form-actions"
              style={{ marginTop: "25px" }}>
              <button
                className="bookcall__btn bookcall__btn--ghost"
                onClick={handleBackStep}
                disabled={paying || submitting || Boolean(paymentReference)}>
                Back
              </button>
              {paymentReference ? (
                <button
                  className="bookcall__btn bookcall__btn--primary"
                  onClick={() => confirmBooking(paymentReference)}
                  disabled={submitting}>
                  {submitting ? "Confirming..." : "Retry confirmation"}
                </button>
              ) : (
                <button
                  className="bookcall__btn bookcall__btn--primary"
                  onClick={payAndBook}
                  disabled={paying || submitting || !form.email}>
                  {paying
                    ? "Processing..."
                    : `Pay ${selectedType ? naira(selectedType.amount) : ""} with Paystack`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
