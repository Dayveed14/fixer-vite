import { useState, useEffect } from "react";
import "./css/Diagnosis.css";
import Navbar from "./components/Navbar";
import { useNavigate } from "react-router-dom";
const DEVICE_TYPES = [
  "Smartphone",
  "Laptop",
  "Tablet",
  "Desktop PC",
  "Smart Watch",
  "Gaming Console",
  "Printer",
  "Other",
];

const SYMPTOMS = [
  "Make noise",
  "Overheating",
  "Battery drains fast",
  "Burning smell",
  "Touchscreen unresponsive",
  "Lagging",
  "Keyboard not working",
  "Random restart",
  "Won't charge",
  "Won't Power on",
];

// Safe parse — never throws, never crashes the modal
const safeParse = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const severityMap = {
  low:    { label: "Low",    color: "var(--sev-low)",    bg: "var(--sev-low-bg)" },
  medium: { label: "Medium", color: "var(--sev-medium)", bg: "var(--sev-medium-bg)" },
  high:   { label: "High",   color: "var(--sev-high)",   bg: "var(--sev-high-bg)" },
};
const getSeverity = (s) => severityMap[(s || "").toLowerCase()] || severityMap.medium;

export default function Diagnosis() {
  const [deviceType, setDeviceType] = useState("");
  const [brand, setBrand] = useState("");
  const [primaryFault, setPrimaryFault] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [description, setDescription] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const navigate = useNavigate();
  const toggleSymptom = (s) =>
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleRun = async () => {

      try {

          setLoading(true);

          const response = await fetch(
              "http://localhost:4000/api/diagnosis/run",
              {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                      deviceType,
                      brand,
                      primaryFault,
                      selectedSymptoms,
                      description
                  })
              }
          );

          const data = await response.json();
          console.log(data);
          setDiagnosis(data);
          setShowModal(true);

      } catch (err) {

          console.error(err);

      } finally {

          setLoading(false);

      }

  };

  useEffect(() => {
    if (!showModal) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [showModal]);

  return (
    <div className="diagnosis">
      <div className="diag">
     
        {/* ── LEFT ── */}
        <div className="diag__left">
              <h1 className="diag__title">Smart Issue Analyzer</h1>
              <p className="diag__body">
                Can't fix it yourself? Send your device in for professional repair.
                Schedule a collection, and we'll handle everything from pickup to
                repair and safe return—keeping you updated every step of the way.
              </p>
        </div>

        {/* ── RIGHT ── */}
        <form className="diag__right" onSubmit={(e) => { e.preventDefault(); handleRun(); }}>
                <h2 className="diag__prompt">
                  Describe your device and it's symptoms to get a diagnosis
                </h2>

                {/* Device type + Brand row */}
                <div className="diag__row">
                  <div className="diag__field">
                    <label className="diag__label">Device type</label>
                    <div className="diag__select-wrap">
                      <button
                        type="button"
                        className="diag__select"
                        onClick={() => setDropdownOpen(v => !v)}>
                        <span className={deviceType ? "diag__select-value" : "diag__select-placeholder"}>
                          {deviceType || "Choose a device"}
                        </span>
                        <svg
                          className={`diag__chevron ${dropdownOpen ? "open" : ""}`}
                          width="14" height="14" viewBox="0 0 14 14" fill="none"
                        >
                          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {dropdownOpen && (
                        <ul className="diag__dropdown">
                          {DEVICE_TYPES.map((d) => (
                            <li
                              key={d}
                              className={`diag__dropdown-item ${deviceType === d ? "selected" : ""}`}
                              onClick={() => { setDeviceType(d); setDropdownOpen(false); }}
                            >
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="diag__field">
                    <label className="diag__label">Gadget brand/model</label>
                    <input
                      className="diag__input"
                      type="text"
                      placeholder="e.g. iPhone 17 pro"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>
                </div>

                {/* Primary fault */}
                <div className="diag__field diag__field--full">
                  <label className="diag__label">Primary fault</label>
                  <input
                    className="diag__input"
                    type="text"
                    placeholder="e.g. Water damage"
                    value={primaryFault}
                    onChange={(e) => setPrimaryFault(e.target.value)}
                  />
                </div>

                {/* Additional symptoms */}
                <div className="diag__field diag__field--full">
                  <label className="diag__label">Additional symptoms</label>
                  <div className="diag__chips">
                    {SYMPTOMS.map((s) => (
                      <button
                        key={s}
                        className={`diag__chip ${selectedSymptoms.includes(s) ? "active" : ""}`}
                        onClick={() => toggleSymptom(s)}
                        type="button"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free text description */}
                <div className="diag__field diag__field--full">
                  <label className="diag__label">Describe the fault in your own words</label>
                  <textarea
                    className="diag__textarea"
                    placeholder="e.g. My keyboard stopped working after I did a system reboot..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                  />
                </div>

                {/* Action buttons */}
                <div className="diag__actions">
                  <button
            type="button"
            className="diag__btn diag__btn--skip">Skip</button>
                  <button
            type="submit"
            className="diag__btn diag__btn--run"
            disabled={loading}
        >
                    {loading ? "Analyzing..." : "Run Diagnostic"}
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <path d="M3.75 14.25L14.25 3.75M14.25 3.75H6.75M14.25 3.75V11.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
        </form>

        {showModal && diagnosis && (
              <div className="diag-modal-overlay" onClick={() => setShowModal(false)}>
                <div
                  className="diag-modal"
                  role="dialog"
                  aria-modal="true"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="diag-close" onClick={() => setShowModal(false)} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </button>

                  {diagnosis.source === "knowledge_base" && diagnosis.results?.length > 0 ? (
                    <>
                      <div className="diag-modal-header">
                        <div className="diag-modal-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M14.7 6.3a4 4 0 00-5.6 5.6L3 18v3h3l6.1-6.1a4 4 0 005.6-5.6l-2.5 2.5-2-2 2.5-2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <span className="diag-modal-eyebrow">Diagnosis result</span>
                          <h2>{diagnosis.results.length > 1 ? `${diagnosis.results.length} issues found` : "Issue identified"}</h2>
                        </div>
                      </div>

                      {diagnosis.results.map((issue) => {
                        const causes = safeParse(issue.possible_causes);
                        const steps = safeParse(issue.recommended_steps);
                        const sev = getSeverity(issue.severity);

                        return (
                          <div key={issue.id} className="diag-result">
                            <div className="diag-result-title-row">
                              <h3>{issue.primary_fault}</h3>
                              <span className="diag-sev-badge" style={{ color: sev.color, background: sev.bg }}>
                                {sev.label} severity
                              </span>
                            </div>

                            <div className="diag-stat-row">
                              <div className="diag-stat">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
                                  <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                                </svg>
                                <div>
                                  <span className="diag-stat-label">Est. time</span>
                                  <span className="diag-stat-value">{issue.estimated_time}</span>
                                </div>
                              </div>
                              <div className="diag-stat">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 8h14M5 8a2 2 0 01-2-2V5a1 1 0 011-1h16a1 1 0 011 1v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                                </svg>
                                <div>
                                  <span className="diag-stat-label">Est. cost</span>
                                  <span className="diag-stat-value">₦{Number(issue.estimated_cost).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            {causes.length > 0 && (
                              <div className="diag-section">
                                <h4>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <path d="M14.7 6.3a4 4 0 00-5.6 5.6L3 18v3h3l6.1-6.1a4 4 0 005.6-5.6l-2.5 2.5-2-2 2.5-2.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                                  </svg>
                                  Possible causes
                                </h4>
                                <ul className="diag-cause-list">
                                  {causes.map((cause, i) => <li key={i}>{cause}</li>)}
                                </ul>
                              </div>
                            )}

                            {steps.length > 0 && (
                              <div className="diag-section">
                                <h4>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 11l3 3L22 4M12 19a7 7 0 100-14 7 7 0 000 14z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Recommended steps
                                </h4>
                                <ol className="diag-step-list">
                                  {steps.map((step, i) => (
                                    <li key={i}>
                                      <span className="diag-step-num">{i + 1}</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            <p className="diag-followup">
                              Still stuck? Take it a step further — talk to our technical support team or send your device in for repair.
                            </p>

                            <div className="diag-modal-actions">
                              <button className="diag-action-btn diag-action-btn--primary" onClick={() => navigate("/book")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M4 12a8 8 0 0116 0v4a2 2 0 01-2 2h-1v-6h3M4 16v-4a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Book remote support
                              </button>
                              <button className="diag-action-btn diag-action-btn--secondary" onClick={() => navigate("/shipment")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                                </svg>
                                Mail-in repair
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
<div className="diag-ai-result">

  <div className="diag-modal-header">
    <div className="diag-modal-icon diag-modal-icon--muted">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </div>

    <div>
      <span className="diag-modal-eyebrow">AI Diagnosis</span>
      <h2>{diagnosis.likelyProblem}</h2>
    </div>
  </div>

  <div className="diag-result">

    <div className="diag-result-title-row">
      <h3>Confidence: {diagnosis.confidence}%</h3>

      <span
        className="diag-sev-badge"
        style={{
          color: getSeverity(diagnosis.severity).color,
          background: getSeverity(diagnosis.severity).bg
        }}
      >
        {diagnosis.severity} Severity
      </span>
    </div>

    <div className="diag-stat-row">

      <div className="diag-stat">
        <div>
          <span className="diag-stat-label">
            Estimated Repair
          </span>

          <span className="diag-stat-value">
            {diagnosis.estimatedRepair}
          </span>
        </div>
      </div>

    </div>

    <div className="diag-section">
      <h4>Possible Causes</h4>

      <ul className="diag-cause-list">
        {diagnosis.causes.map((cause, index) => (
          <li key={index}>{cause}</li>
        ))}
      </ul>
    </div>

    <div className="diag-section">
      <h4>Recommended Steps</h4>

      <ol className="diag-step-list">
        {diagnosis.steps.map((step, index) => (
          <li key={index}>
            <span className="diag-step-num">
              {index + 1}
            </span>

            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>

    <p className="diag-followup">
      This diagnosis was generated using AI based on the symptoms you provided.
      If the issue persists, we recommend professional assistance.
    </p>

    <div className="diag-modal-actions">

      {diagnosis.bookTechnician && (
        <button
          className="diag-action-btn diag-action-btn--primary"
          onClick={() => navigate("/book")}
        >
          Book Remote Support
        </button>
      )}

      {diagnosis.mailInRepair && (
        <button
          className="diag-action-btn diag-action-btn--secondary"
          onClick={() => navigate("/shipment")}
        >
          Mail-in Repair
        </button>
      )}

    </div>

  </div>

</div>
                  )}
                </div>
              </div>
        )}
      </div>
    </div>
  );
}
