import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Hero.css";

const STATS = [
  { value: "+1500", label: "Articles" },
  { value: "25k",   label: "Repairs" },
  { value: "+2k",   label: "Daily users" },
];

const DEVICE_TYPES = ["Smartphone","Laptop","Tablet","Desktop PC","Smart Watch","Gaming Console","Printer","Other"];
const SYMPTOMS = [
  "Make noise","Overheating","Battery drains fast",
  "Burning smell","Touchscreen unresponsive","Lagging",
  "Keyboard not working","Random restart","Won't charge",
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

function DiagnosisModal({ onClose }) {
  const [deviceType, setDeviceType]     = useState("");
  const [brand, setBrand]               = useState("");
  const [primaryFault, setPrimaryFault] = useState("");
  const [selectedSymptoms, setSymptoms] = useState([]);
  const [description, setDescription]   = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [diagnosis, setDiagnosis]       = useState(null);
  const [error, setError]               = useState(null);
  const [authPrompt, setAuthPrompt]     = useState(null); // "/book" | "/shipment" | null

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggleSymptom = (s) =>
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleRun = async () => {
    if (!deviceType && !primaryFault && !description) return;

    setLoading(true);
    setDiagnosis(null);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:4000/api/diagnosis/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deviceType,
            brand,
            primaryFault,
            selectedSymptoms,
            description,
          }),
        }
      );

      const data = await response.json();
      setDiagnosis(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while running the diagnosis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDiagnosis(null); setError(null);
    setDeviceType(""); setBrand("");
    setPrimaryFault(""); setSymptoms([]); setDescription("");
  };

  const hasKbResults = diagnosis?.source === "knowledge_base" && diagnosis.results?.length > 0;

  return (
    <>
    <div className="diag-modal__overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="diag-modal__panel">

        {/* Close button */}
        <button className="diag-modal__close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Left column */}
        <div className="diag-modal__left">
          <div className="diag-modal__badge">fixer's</div>
          <h2 className="diag-modal__title">Smart Issue Analyzer</h2>
          <p className="diag-modal__body">
            Describe your device and its symptoms and we'll pinpoint the likely issue
            and recommend the best fix — DIY guide, technician call, or professional repair.
          </p>

          {loading && (
            <div className="diag-modal__result diag-modal__result--loading">
              <div className="diag-modal__spinner" />
              <p>Analyzing your device symptoms…</p>
            </div>
          )}

          {error && !loading && (
            <div className="diag-modal__result diag-modal__result--error">
              <p>{error}</p>
              <button className="diag-modal__res-btn diag-modal__res-btn--ghost" onClick={handleReset}>
                Try again
              </button>
            </div>
          )}

          {diagnosis && !loading && !error && (
            <div className="diag-modal__result">
              {hasKbResults ? (
                <>
                  <p className="diag-modal__result-sub">
                    {diagnosis.results.length > 1
                      ? `${diagnosis.results.length} issues found`
                      : "Issue identified"}
                  </p>

                  {diagnosis.results.map((issue) => {
                    const causes = safeParse(issue.possible_causes);
                    const steps = safeParse(issue.recommended_steps);
                    const sev = getSeverity(issue.severity);

                    return (
                      <div key={issue.id} className="diag-result">
                        <div className="diag-result-title-row">
                          <h4 className="diag-modal__result-title">{issue.primary_fault}</h4>
                          <span
                            className="diag-sev-badge"
                            style={{ color: sev.color, background: sev.bg }}
                          >
                            {sev.label} severity
                          </span>
                        </div>

                        <div className="diag-stat-row">
                          <div className="diag-stat">
                            <span className="diag-stat-label">Est. time</span>
                            <span className="diag-stat-value">{issue.estimated_time}</span>
                          </div>
                          <div className="diag-stat">
                            <span className="diag-stat-label">Est. cost</span>
                            <span className="diag-stat-value">
                              ₦{Number(issue.estimated_cost).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {causes.length > 0 && (
                          <>
                            <p className="diag-modal__result-sub">Possible causes</p>
                            <ul className="diag-modal__causes">
                              {causes.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </>
                        )}

                        {steps.length > 0 && (
                          <>
                            <p className="diag-modal__result-sub">Recommended steps</p>
                            <ol className="diag-step-list">
                              {steps.map((step, i) => (
                                <li key={i}>
                                  <span className="diag-step-num">{i + 1}</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </>
                        )}

                        <div className="diag-modal__result-actions">
                          <button
                            className="diag-modal__res-btn diag-modal__res-btn--primary"
                            onClick={() => setAuthPrompt("/book")}
                          >
                            Book remote support →
                          </button>
                          <button
                            className="diag-modal__res-btn diag-modal__res-btn--primary"
                            onClick={() => setAuthPrompt("/shipment")}
                          >
                            Mail-in repair →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <h4 className="diag-modal__result-title">No exact match found</h4>
                  <p className="diag-modal__rec">
                    {diagnosis.message || "Our knowledge base couldn't confidently identify this issue."}
                  </p>
                  <div className="diag-modal__result-actions">
                    <button
                      className="diag-modal__res-btn diag-modal__res-btn--primary"
                      onClick={() => setAuthPrompt("/book")}
                    >
                      Book remote support →
                    </button>
                    <button
                      className="diag-modal__res-btn diag-modal__res-btn--primary"
                      onClick={() => setAuthPrompt("/shipment")}
                    >
                      Mail-in repair →
                    </button>
                  </div>
                </>
              )}

              <button className="diag-modal__res-btn diag-modal__res-btn--ghost" onClick={handleReset}>
                Start over
              </button>
            </div>
          )}
        </div>

        {/* Right column — form */}
        <div className="diag-modal__right">
          <p className="diag-modal__prompt">Describe your device and its symptoms to get a diagnosis</p>

          <div className="diag-modal__row">
            <div className="diag-modal__field">
              <label className="diag-modal__label">Device type</label>
              <div className="diag-modal__select-wrap">
                <button className="diag-modal__select" onClick={() => setDropdownOpen(v => !v)}>
                  <span className={deviceType ? "" : "placeholder"}>{deviceType || "Choose a device"}</span>
                  <svg className={`diag-modal__chevron ${dropdownOpen ? "open" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {dropdownOpen && (
                  <ul className="diag-modal__dropdown">
                    {DEVICE_TYPES.map((d) => (
                      <li key={d}
                        className={`diag-modal__dropdown-item ${deviceType === d ? "selected" : ""}`}
                        onClick={() => { setDeviceType(d); setDropdownOpen(false); }}>
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="diag-modal__field">
              <label className="diag-modal__label">Gadget brand/model</label>
              <input className="diag-modal__input" type="text" placeholder="e.g. iPhone 17 pro"
                value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
          </div>

          <div className="diag-modal__field diag-modal__field--full">
            <label className="diag-modal__label">Primary fault</label>
            <input className="diag-modal__input" type="text" placeholder="e.g. Water damage"
              value={primaryFault} onChange={(e) => setPrimaryFault(e.target.value)} />
          </div>

          <div className="diag-modal__field diag-modal__field--full">
            <label className="diag-modal__label">Additional symptoms</label>
            <div className="diag-modal__chips">
              {SYMPTOMS.map((s) => (
                <button key={s} type="button"
                  className={`diag-modal__chip ${selectedSymptoms.includes(s) ? "active" : ""}`}
                  onClick={() => toggleSymptom(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="diag-modal__field diag-modal__field--full">
            <label className="diag-modal__label">Describe the fault in your own words</label>
            <textarea className="diag-modal__textarea" rows={4}
              placeholder="e.g. My keyboard stopped working after I did a system reboot..."
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="diag-modal__actions">
            <button className="diag-modal__btn diag-modal__btn--skip" onClick={onClose}>Skip</button>
            <button className="diag-modal__btn diag-modal__btn--run" onClick={handleRun} disabled={loading}>
              {loading ? "Analyzing…" : "Run diagnostic"}
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 14.25L14.25 3.75M14.25 3.75H6.75M14.25 3.75V11.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>

    {/* Auth prompt — shown before booking/shipment routes. Rendered as a sibling
        of the modal (not nested inside it) with inline styles so it always
        displays on top, regardless of the modal panel's own CSS. */}
    {authPrompt && (
      <div
        onClick={(e) => e.target === e.currentTarget && setAuthPrompt(null)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "380px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          <button
            onClick={() => setAuthPrompt(null)}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              lineHeight: 0,
              color: "#666",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <h3 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 700 }}>
            Login required
          </h3>
          <p style={{ margin: "0 0 24px", color: "#555", fontSize: "14px", lineHeight: 1.5 }}>
            Please log in or create an account to continue with your{" "}
            {authPrompt === "/book" ? "remote support booking" : "mail-in repair request"}.
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Link
              to="/login"
              state={{ redirectTo: authPrompt }}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "8px",
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Log in
            </Link>
            <Link
              to="/register"
              state={{ redirectTo: authPrompt }}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                color: "#111",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default function Hero() {
  const [diagOpen, setDiagOpen] = useState(false);
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero">
      <div className="hero__inner">
        {/* Left */}
        <div className="hero__left">
          <h1 className="hero__title">
            Broken devices?{" "}
            <span className="hero__title-accent">fixer</span>{" "}
            got you <span className="hero__title-underline">covered</span>
          </h1>
          <p className="hero__sub">
            Access premium repair services, expert guidance and flexible solutions
            with fixer — <strong>your trusted partner in tech maintenance</strong>
          </p>
          <div className="hero__actions">
            <button className="hero__btn hero__btn--primary" onClick={() => setDiagOpen(true)}>
              Run diagnostic →
            </button>
            <button className="hero__btn hero__btn--secondary" onClick={() => scrollTo("#resources")}>
              Browse DIY Guides
            </button>
          </div>
          <div className="hero__stats">
            {STATS.map((s) => (
              <div className="hero__stat" key={s.label}>
                <span className="hero__stat-value">{s.value}</span>
                <span className="hero__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="hero__right">
          <div className="hero__img-main">
            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80" alt="Laptop repair" />
          </div>
          <div className="hero__img-badge">
            <span className="hero__img-badge-icon">🔧</span>
            <span>Expert technicians ready</span>
          </div>
        </div>
      </div>

      {/* Diagnosis modal */}
      {diagOpen && <DiagnosisModal onClose={() => setDiagOpen(false)} />}
    </section>
  );
}
