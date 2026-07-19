import { useState } from "react";
import "./css/Shipment.css";
import Navbar from "./components/Navbar";

const STEPS_NAV = [
  { step: 1, label: "Device Info" },
  { step: 2, label: "Schedule" },
  { step: 3, label: "Summary" },
  { step: 4, label: "Payment" },
  { step: 5, label: "Confirmation" }
];

const DEVICE_TYPES = ["Smartphone", "Laptop", "Tablet", "Desktop PC", "Other"];

const TIMELINE_STATUSES = [
  { label: "Pickup Scheduled", done: true },
  { label: "Courier Assigned", done: false },
  { label: "Device Collected", done: false },
  { label: "Diagnosis", done: false },
  { label: "Waiting for Approval", done: false },
  { label: "Repair", done: false },
  { label: "Quality Check", done: false },
  { label: "Ready for Delivery", done: false },
  { label: "Delivered", done: false }
];

export default function Shipment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState("next");

  // Centralized Wizard Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    device: "",
    brand: "",
    fault: "",
    address: "",
    city: "",
    notes: "",
    pickupDate: "",
    pickupTime: "",
    agreedToTerms: false
  });

  const [deviceDropOpen, setDeviceDropOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paystack");

  const setField = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection("next");
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection("back");
    setCurrentStep((prev) => prev - 1);
  };

  const resetWizard = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      device: "",
      brand: "",
      fault: "",
      address: "",
      city: "",
      notes: "",
      pickupDate: "",
      pickupTime: "",
      agreedToTerms: false
    });
    setDirection("back");
    setCurrentStep(1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return !!(form.name && form.email && form.phone && form.device && form.brand && form.fault && form.address && form.city);
      case 2:
        return !!(form.pickupDate && form.pickupTime);
      case 3:
        return form.agreedToTerms;
      case 4:
        return true; 
      default:
        return false;
    }
  };

  const estimatedPickupFee = "₦2,500";
  const mockReferenceNumber = "FXR-849204";

  return (
    <div className="ship">
      <Navbar />

      {currentStep < 5 ? (
        <div className="shipment">
          {/* LEFT PANEL — Kept for branding and dynamic multi-step guidelines */}
          <div className="shipment__left">
            <h1 className="shipment__title">Book a Device Pickup</h1>
            <p className="shipment__sub">
              Can't make it to our lab? Complete our quick multi-step wizard to arrange a secure courier 
              collection right from your doorstep.
            </p>

            {/* Vertical Multi-Step Progress Tracker */}
            <div className="shipment__steps">
              {STEPS_NAV.slice(0, 4).map((s) => (
                <div className="shipment__step" key={s.step}>
                  <div className="shipment__step-left">
                    <div className={`shipment__step-icon ${currentStep >= s.step ? "active" : ""}`}>
                      {currentStep > s.step ? "✓" : s.step}
                    </div>
                    {s.step < 4 && <div className={`shipment__step-connector ${currentStep > s.step ? "active" : ""}`} />}
                  </div>
                  <div className="shipment__step-content">
                    <h4 className="shipment__step-title" style={{ color: currentStep === s.step ? "var(--blue)" : "inherit" }}>
                      {s.label}
                    </h4>
                    <p className="shipment__step-desc">
                      {s.step === 1 && "Specify hardware attributes and collection address details."}
                      {s.step === 2 && "Pick your custom date and hour ranges for arrival."}
                      {s.step === 3 && "Confirm the processing terms and conditions framework."}
                      {s.step === 4 && "Finalize the gateway payment for delivery processing."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL — Multi-Step Form Panes */}
          <div className={`shipment__right slide-direction-${direction}`}>
            
            {/* STEP 1: Device Information */}
            {currentStep === 1 && (
              <>
                <p className="shipment__form-heading">Step 1: Tell us about your device and contact profile</p>
                
                <div className="shipment__section-label">Your details</div>
                <div className="shipment__row">
                  <div className="shipment__field">
                    <label className="shipment__label">Full name</label>
                    <input className="shipment__input" type="text" placeholder="e.g. John Doe" value={form.name} onChange={setField("name")} />
                  </div>
                  <div className="shipment__field">
                    <label className="shipment__label">Email address</label>
                    <input className="shipment__input" type="email" placeholder="e.g. john@email.com" value={form.email} onChange={setField("email")} />
                  </div>
                </div>

                <div className="shipment__field shipment__field--full">
                  <label className="shipment__label">Phone number</label>
                  <input className="shipment__input" type="tel" placeholder="e.g. +234 800 000 0000" value={form.phone} onChange={setField("phone")} />
                </div>

                <div className="shipment__section-label">Device details</div>
                <div className="shipment__row">
                  <div className="shipment__field">
                    <label className="shipment__label">Device type</label>
                    <div className="shipment__select-wrap">
                      <button className="shipment__select" onClick={() => setDeviceDropOpen(!deviceDropOpen)}>
                        <span className={form.device ? "" : "placeholder"}>{form.device || "Choose a device"}</span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {deviceDropOpen && (
                        <ul className="shipment__dropdown">
                          {DEVICE_TYPES.map((d) => (
                            <li 
                              key={d} 
                              className={`shipment__dropdown-item ${form.device === d ? "selected" : ""}`}
                              onClick={() => { setForm(f => ({ ...f, device: d })); setDeviceDropOpen(false); }}
                            >
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="shipment__field">
                    <label className="shipment__label">Brand / Model</label>
                    <input className="shipment__input" type="text" placeholder="e.g. iPhone 17 Pro" value={form.brand} onChange={setField("brand")} />
                  </div>
                </div>

                <div className="shipment__field shipment__field--full">
                  <label className="shipment__label">Primary fault</label>
                  <input className="shipment__input" type="text" placeholder="e.g. Cracked screen, water damage..." value={form.fault} onChange={setField("fault")} />
                </div>

                <div className="shipment__section-label">Pickup address</div>
                <div className="shipment__field shipment__field--full">
                  <label className="shipment__label">Street address</label>
                  <input className="shipment__input" type="text" placeholder="e.g. 14 Adeola Odeku Street" value={form.address} onChange={setField("address")} />
                </div>
                <div className="shipment__field shipment__field--full">
                  <label className="shipment__label">City / State</label>
                  <input className="shipment__input" type="text" placeholder="e.g. Lagos, Nigeria" value={form.city} onChange={setField("city")} />
                </div>

                <div className="shipment__field shipment__field--full">
                  <label className="shipment__label">Additional notes (optional)</label>
                  <textarea className="shipment__textarea" rows={3} placeholder="e.g. Please call before arriving..." value={form.notes} onChange={setField("notes")} />
                </div>

                <div className="shipment__actions">
                  <button className={`shipment__btn shipment__btn--primary ${!validateStep(1) ? "disabled" : ""}`} disabled={!validateStep(1)} onClick={handleNext}>
                    Next: Schedule Pickup
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Pickup Schedule */}
            {currentStep === 2 && (
              <>
                <p className="shipment__form-heading">Step 2: When should our courier arrive?</p>
                <div className="shipment__section-label">Timing Framework</div>
                
                <div className="shipment__row">
                  <div className="shipment__field">
                    <label className="shipment__label">Preferred Pickup Date</label>
                    <input className="shipment__input" type="date" value={form.pickupDate} onChange={setField("pickupDate")} />
                  </div>
                  <div className="shipment__field">
                    <label className="shipment__label">Preferred Pickup Time</label>
                    <input className="shipment__input" type="time" value={form.pickupTime} onChange={setField("pickupTime")} />
                  </div>
                </div>

                <div className="shipment__actions wizard-split-tray">
                  <button className="shipment__btn shipment__btn--secondary" onClick={handleBack}>Back</button>
                  <button className={`shipment__btn shipment__btn--primary ${!validateStep(2) ? "disabled" : ""}`} disabled={!validateStep(2)} onClick={handleNext}>
                    Next: Review Summary
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Pickup Summary */}
            {currentStep === 3 && (
              <>
                <p className="shipment__form-heading">Step 3: Review summary and booking configuration</p>
                <div className="shipment__section-label">Order Details</div>
                
                <div className="shipment__summary-box">
                  <div className="shipment__summary-row">
                    <span className="shipment__summary-label">Pickup Address:</span>
                    <span className="shipment__summary-val">{form.address}, {form.city}</span>
                  </div>
                  <div className="shipment__summary-row highlight">
                    <span className="shipment__summary-label">Estimated Pickup Fee:</span>
                    <span className="shipment__summary-val">{estimatedPickupFee}</span>
                  </div>
                </div>

                <div className="shipment__perks-panel">
                  <h4 className="shipment__label">What's Included</h4>
                  <ul>
                    <li>✓ Courier Pickup</li>
                    <li>✓ Initial Inspection</li>
                    <li>✓ Repair Quotation</li>
                  </ul>
                </div>

                <div className="shipment__policy-panel">
                  <h4 className="shipment__label">Policy Notice</h4>
                  <p>• Pickup fee is non-refundable once assigned.</p>
                  <p>• Repair charges are only payable after customer approval.</p>
                  <p>• If repair is declined, only return delivery fee applies.</p>
                </div>

                <div className="shipment__field shipment__field--full" style={{ padding: "8px 0" }}>
                  <label className="shipment__checkbox-container">
                    <input type="checkbox" checked={form.agreedToTerms} onChange={setField("agreedToTerms")} />
                    <span className="checkbox-custom-label">I have read and agree to the terms.</span>
                  </label>
                </div>

                <div className="shipment__actions wizard-split-tray">
                  <button className="shipment__btn shipment__btn--secondary" onClick={handleBack}>Back</button>
                  <button className={`shipment__btn shipment__btn--primary ${!validateStep(3) ? "disabled" : ""}`} disabled={!validateStep(3)} onClick={handleNext}>
                    Proceed to Payment
                  </button>
                </div>
              </>
            )}

            {/* STEP 4: Payment Layout */}
            {currentStep === 4 && (
              <>
                <p className="shipment__form-heading">Step 4: Secure Fee Settlement</p>
                <div className="shipment__section-label">Payment Invoice</div>

                <div className="shipment__summary-box highlight">
                  <div className="shipment__summary-row">
                    <span className="shipment__summary-label">Pickup Fee Due:</span>
                    <span className="shipment__summary-val" style={{ fontSize: "1.2rem" }}>{estimatedPickupFee}</span>
                  </div>
                </div>

                <div className="shipment__field">
                  <label className="shipment__label">Payment Method</label>
                  <div className="shipment__payment-selector">
                    <label className="payment-radio-option">
                      <input type="radio" name="method" value="paystack" checked={paymentMethod === "paystack"} onChange={() => setPaymentMethod("paystack")} />
                      <span>Paystack Integration Platform</span>
                    </label>
                  </div>
                </div>

                {/* Paystack Embed Gateway Hook Box */}
                <div className="shipment__paystack-box">
                  <div className="secure-badge-label">🔒 Secure Transaction Ecosystem</div>
                  <p>Click below to securely authorize payment and dispatch your tracking coordinates.</p>
                  <button className="shipment__btn shipment__btn--primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setCurrentStep(5)}>
                    Simulate Payment Success via Paystack
                  </button>
                </div>

                <div className="shipment__actions wizard-start-tray">
                  <button className="shipment__btn shipment__btn--secondary" onClick={handleBack}>Back</button>
                </div>
              </>
            )}

          </div>
        </div>
      ) : (
        /* STEP 5: Full Screen Confirmation Screen & Order Tracking Timeline */
        <div className="shipment__success custom-confirmation-pane">
          <div className="shipment__success-icon">✓</div>
          <h2>Pickup Scheduled</h2>

          <div className="shipment__receipt-grid">
            <div className="receipt-tile"><strong>Reference Number:</strong> <span>{mockReferenceNumber}</span></div>
            <div className="receipt-tile"><strong>Pickup Date:</strong> <span>{form.pickupDate}</span></div>
            <div className="receipt-tile"><strong>Pickup Time:</strong> <span>{form.pickupTime}</span></div>
            <div className="receipt-tile"><strong>Pickup Address:</strong> <span>{form.address}, {form.city}</span></div>
            <div className="receipt-tile"><strong>Email Profile:</strong> <span>{form.email}</span></div>
            <div className="receipt-tile"><strong>Phone Contact:</strong> <span>{form.phone}</span></div>
          </div>

          {/* Core Tracking Roadmap Engine */}
          <div className="shipment__timeline-tree">
            <h3>Shipment Lifecycle Progress</h3>
            <div className="timeline-nodes-container">
              {TIMELINE_STATUSES.map((status, index) => (
                <div key={index} className={`timeline-node-item ${status.done ? "completed" : ""}`}>
                  <div className="node-marker-column">
                    <div className="node-circle-dot" />
                    {index < TIMELINE_STATUSES.length - 1 && <div className="node-connector-line" />}
                  </div>
                  <div className="node-text-title">{status.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="confirmation-actions-footer">
            <button className="shipment__btn shipment__btn--primary tracking-action-btn" onClick={() => alert("Tracking systems operational. Dispatch sync completed.")}>
              Track Shipment
            </button>
            <button className="shipment__btn shipment__btn--secondary" onClick={resetWizard}>
              Submit another request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}