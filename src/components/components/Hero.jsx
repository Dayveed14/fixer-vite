import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import "../css/Hero.css";

const STATS = [
  { value: "X", label: "Articles" },
  { value: "X", label: "Repairs" },
  { value: "X", label: "Daily users" },
];

const DEVICE_TYPES = ["Laptop", "Desktop PC", "Other"];
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
  "Other",
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
  low: { label: "Low", color: "var(--sev-low)", bg: "var(--sev-low-bg)" },
  medium: {
    label: "Medium",
    color: "var(--sev-medium)",
    bg: "var(--sev-medium-bg)",
  },
  high: { label: "High", color: "var(--sev-high)", bg: "var(--sev-high-bg)" },
};
const getSeverity = (s) =>
  severityMap[(s || "").toLowerCase()] || severityMap.medium;

function DiagnosisModal({ onClose }) {
  const [deviceType, setDeviceType] = useState("");
  const [brand, setBrand] = useState("");
  const [primaryFault, setPrimaryFault] = useState("");
  const [selectedSymptoms, setSymptoms] = useState([]);
  const [description, setDescription] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [error, setError] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(null); // "/book" | "/shipment" | null

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggleSymptom = (s) =>
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleRun = async () => {
    if (!deviceType && !primaryFault && !description) return;

    setLoading(true);
    setDiagnosis(null);
    setError(null);

    try {
      const response = await fetch(
        "https://fixer-backend-7mng.onrender.com/api/diagnosis/run",
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
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const status = response.status;
        const upstreamMsg = data?.error?.message || data?.message;

        const friendly =
          status === 503
            ? "Our diagnostic AI is currently experiencing high demand. Please try again in a moment."
            : status === 429
              ? "We're receiving a lot of requests right now. Please wait a moment and try again."
              : upstreamMsg ||
                "Something went wrong while running the diagnosis. Please try again.";

        setError(friendly);
        return;
      }

      // Normalize the diagnosis response so the UI can handle
// both knowledge-base results and AI results.
if (data.source === "knowledge_base" && Array.isArray(data.results)) {
  const bestMatch = data.results[0];

  if (!bestMatch) {
    setError("No matching issue was found. Please try describing the problem differently.");
    return;
  }

  const causes = safeParse(bestMatch.possible_causes);
  const steps = safeParse(bestMatch.recommended_steps);

  setDiagnosis({
    source: "knowledge_base",
    requestId: data.requestId,

    likelyProblem: bestMatch.primary_fault || "Possible issue identified",

    severity: bestMatch.severity || "medium",

    confidence:
      bestMatch.confidence !== undefined
        ? bestMatch.confidence
        : undefined,

    estimatedRepair:
      bestMatch.estimated_repair ||
      bestMatch.estimatedRepair ||
      "Assessment required",

    causes,

    steps,

    bookTechnician:
      bestMatch.bookTechnician ?? true,

    mailInRepair:
      bestMatch.mailInRepair ?? true,

    // Keep the other KB matches available if needed later
    alternatives: data.results.slice(1),
  });
} else {
  // AI response — keep the existing structure
  setDiagnosis(data);
}

console.log("Diagnosis result:", data);
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while running the diagnosis. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDiagnosis(null);
    setError(null);
    setDeviceType("");
    setBrand("");
    setPrimaryFault("");
    setSymptoms([]);
    setDescription("");
  };

  const hasKbResults =
    diagnosis?.source === "knowledge_base" && diagnosis.results?.length > 0;

  return (
    <>
      <div
        className="diag-modal__overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="diag-modal__panel">
          {/* Close button */}
          <button
            className="diag-modal__close"
            onClick={onClose}
            aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 2l14 14M16 2L2 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Left column */}
          <div className="diag-modal__left">
            <h2 className="diag-modal__title">Meet FixBot 🤖</h2>
            <p className="diag-modal__body">
              Tell us what's wrong with your computer, and our AI will guide you
              through possible solutions in under two minutes.
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
                <button
                  className="diag-modal__res-btn diag-modal__res-btn--ghost"
                  onClick={handleReset}>
                  Try again
                </button>
              </div>
            )}

            {diagnosis && !loading && !error && (
              <div className="diag-modal__result">
                <p className="diag-modal__result-sub">AI diagnosis</p>

                <div className="diag-result">
                  {/* Diagnosis + severity */}
                  <div className="diag-result-title-row">
                    <h4 className="diag-modal__result-title">
                      {diagnosis.likelyProblem || "Possible issue identified"}
                    </h4>

                    <span
                      className="diag-sev-badge"
                      style={{
                        color: getSeverity(diagnosis.severity).color,
                        background: getSeverity(diagnosis.severity).bg,
                      }}>
                      {getSeverity(diagnosis.severity).label} severity
                    </span>
                  </div>

                  {/* Confidence */}
                  {diagnosis.confidence !== undefined && (
                    <div className="diag-stat-row">
                      <div className="diag-stat">
                        <span className="diag-stat-label">AI confidence</span>

                        <span className="diag-stat-value">
                          {diagnosis.confidence}%
                        </span>
                      </div>

                      <div className="diag-stat">
                        <span className="diag-stat-label">
                          Estimated repair
                        </span>

                        <span className="diag-stat-value">
                          {diagnosis.estimatedRepair || "Assessment required"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Possible causes */}
                  {Array.isArray(diagnosis.causes) &&
                    diagnosis.causes.length > 0 && (
                      <>
                        <p className="diag-modal__result-sub">
                          Possible causes
                        </p>

                        <ul className="diag-modal__causes">
                          {diagnosis.causes.map((cause, i) => (
                            <li key={i}>{cause}</li>
                          ))}
                        </ul>
                      </>
                    )}

                  {/* Recommended steps */}
                  {Array.isArray(diagnosis.steps) &&
                    diagnosis.steps.length > 0 && (
                      <>
                        <p className="diag-modal__result-sub">
                          Recommended steps
                        </p>

                        <ol className="diag-step-list">
                          {diagnosis.steps.map((step, i) => (
                            <li key={i}>
                              <span className="diag-step-num">{i + 1}</span>

                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </>
                    )}

                  {/* AI recommendation */}
                  {(diagnosis.bookTechnician || diagnosis.mailInRepair) && (
                    <>
                      <p className="diag-modal__result-sub">
                        Recommended next step
                      </p>

                      <div className="diag-modal__result-actions">
                        {diagnosis.bookTechnician && (
                          <button
                            className="diag-modal__res-btn diag-modal__res-btn--primary"
                            onClick={() => setAuthPrompt("/book")}>
                            Book remote support →
                          </button>
                        )}

                        {diagnosis.mailInRepair && (
                          <button
                            className="diag-modal__res-btn diag-modal__res-btn--primary"
                            onClick={() => setAuthPrompt("/shipment")}>
                            Mail-in repair →
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  className="diag-modal__res-btn diag-modal__res-btn--ghost"
                  onClick={handleReset}>
                  Start over
                </button>
              </div>
            )}
          </div>

          {/* Right column — form */}
          <div className="diag-modal__right">
            <p className="diag-modal__prompt">
              Describe your device and its symptoms to get a diagnosis
            </p>

            <div className="diag-modal__row">
              <div className="diag-modal__field">
                <label className="diag-modal__label">Device type</label>
                <div className="diag-modal__select-wrap">
                  <button
                    className="diag-modal__select"
                    onClick={() => setDropdownOpen((v) => !v)}>
                    <span className={deviceType ? "" : "placeholder"}>
                      {deviceType || "Choose a device"}
                    </span>
                    <svg
                      className={`diag-modal__chevron ${dropdownOpen ? "open" : ""}`}
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none">
                      <path
                        d="M3 5l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <ul className="diag-modal__dropdown">
                      {DEVICE_TYPES.map((d) => (
                        <li
                          key={d}
                          className={`diag-modal__dropdown-item ${deviceType === d ? "selected" : ""}`}
                          onClick={() => {
                            setDeviceType(d);
                            setDropdownOpen(false);
                          }}>
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="diag-modal__field">
                <label className="diag-modal__label">Gadget brand/model</label>
                <input
                  className="diag-modal__input"
                  type="text"
                  placeholder="e.g. iPhone 17 pro"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
            </div>

            <div className="diag-modal__field diag-modal__field--full">
              <label className="diag-modal__label">Primary fault</label>
              <input
                className="diag-modal__input"
                type="text"
                placeholder="e.g. Water damage"
                value={primaryFault}
                onChange={(e) => setPrimaryFault(e.target.value)}
              />
            </div>

            <div className="diag-modal__field diag-modal__field--full">
              <label className="diag-modal__label">Additional symptoms</label>
              <div className="diag-modal__chips">
                {SYMPTOMS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`diag-modal__chip ${selectedSymptoms.includes(s) ? "active" : ""}`}
                    onClick={() => toggleSymptom(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="diag-modal__field diag-modal__field--full">
              <label className="diag-modal__label">
                Describe the fault in your own words
              </label>
              <textarea
                className="diag-modal__textarea"
                rows={4}
                placeholder="e.g. My keyboard stopped working after I did a system reboot..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="diag-modal__actions">
              <button
                className="diag-modal__btn diag-modal__btn--skip"
                onClick={onClose}>
                Skip
              </button>
              <button
                className="diag-modal__btn diag-modal__btn--run"
                onClick={handleRun}
                disabled={loading}>
                {loading ? "Analyzing…" : "Run diagnostic"}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3.75 14.25L14.25 3.75M14.25 3.75H6.75M14.25 3.75V11.25"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
          }}>
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
            }}>
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
              }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2 2l14 14M16 2L2 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <h3
              style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 700 }}>
              Login required
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                color: "#555",
                fontSize: "14px",
                lineHeight: 1.5,
              }}>
              Please log in or create an account to continue with your{" "}
              {authPrompt === "/book"
                ? "remote support booking"
                : "mail-in repair request"}
              .
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}>
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
                }}>
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
                }}>
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Slide 2 visual — FixBot "scanning" animation ──
function FixBotVisual() {
  const tags = [
    "Overheating",
    "Battery drains fast",
    "Won't charge",
    "Random restart",
  ];
  return (
    <div className="fixbot-visual">
      <div className="fixbot-visual__ring">
        <span className="fixbot-visual__core">🤖</span>
      </div>
      <div className="fixbot-visual__scanbox">
        <div className="fixbot-visual__scanline" />
        <div className="fixbot-visual__tags">
          {tags.map((t, i) => (
            <span
              key={t}
              className="fixbot-visual__tag"
              style={{ animationDelay: `${i * 0.55}s` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="fixbot-visual__result">
          <span className="fixbot-visual__check">✓</span> Issue detected
        </div>
      </div>
    </div>
  );
}

// ── Slide 3 visual — repair pipeline timeline ──
function RepairVisual() {
  const steps = [
    { icon: "🔍", label: "Diagnose" },
    { icon: "🛠️", label: "Repair" },
    { icon: "📦", label: "Deliver" },
  ];
  return (
    <div className="repair-visual">
      {steps.map((s, i) => (
        <Fragment key={s.label}>
          <div
            className="repair-visual__step"
            style={{ animationDelay: `${i * 0.9}s` }}>
            <span className="repair-visual__icon">{s.icon}</span>
            <span className="repair-visual__label">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="repair-visual__connector"
              style={{ animationDelay: `${i * 0.9 + 0.2}s` }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

const SLIDE_COUNT = 3;
const AUTOPLAY_MS = 6000;

export default function Hero() {
  const [diagOpen, setDiagOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollTo = (id) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  const goTo = (i) => setSlide(i);
  const prev = () => setSlide((s) => (s - 1 + SLIDE_COUNT) % SLIDE_COUNT);
  const next = () => setSlide((s) => (s + 1) % SLIDE_COUNT);

  // Autoplay — pauses on hover and while the diagnosis modal is open
  useEffect(() => {
    if (paused || diagOpen) return;
    const id = setInterval(
      () => setSlide((s) => (s + 1) % SLIDE_COUNT),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, [paused, diagOpen]);

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className="hero__slideshow">
        <div
          className="hero__track"
          style={{ transform: `translateX(-${slide * 100}%)` }}>
          {/* Slide 1 — original hero */}
          <div className="hero__slide">
            <div className="hero__inner">
              <div className="hero__left">
                <h1 className="hero__title">
                  Broken devices?{" "}
                  <span className="hero__title-accent">fixer</span> got you{" "}
                  <span className="hero__title-underline">covered</span>
                </h1>
                <p className="hero__sub">
                  Access premium repair services, expert guidance and flexible
                  solutions with fixer —{" "}
                  <strong>your trusted partner in tech maintenance</strong>
                </p>
                <div className="hero__actions">
                  <button
                    className="hero__btn hero__btn--primary"
                    onClick={() => setDiagOpen(true)}>
                    Run diagnostic →
                  </button>
                  <button
                    className="hero__btn hero__btn--secondary"
                    onClick={() => scrollTo("#resources")}>
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

              <div className="hero__right">
                <div className="hero__img-main">
                  <img
                    src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80"
                    alt="Laptop repair"
                  />
                </div>
                <div className="hero__img-badge">
                  <span className="hero__img-badge-icon">🔧</span>
                  <span>Expert technicians ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 — meet FixBot */}
          <div className="hero__slide">
            <div className="hero__inner">
              <div className="hero__left">
                <h1 className="hero__title">
                  Meet <span className="hero__title-accent">FixBot</span>{" "}
                  <span className="hero__title-underline">🤖</span>
                </h1>
                <p className="hero__sub">
                  Describe your symptoms and our AI pinpoints the issue,
                  estimates cost and repair time —{" "}
                  <strong>diagnosis in under two minutes</strong>
                </p>
                <div className="hero__actions">
                  <button
                    className="hero__btn hero__btn--primary"
                    onClick={() => setDiagOpen(true)}>
                    Try FixBot →
                  </button>
                  <button
                    className="hero__btn hero__btn--secondary"
                    onClick={() => scrollTo("#resources")}>
                    Browse DIY Guides
                  </button>
                </div>
                <div className="hero__stats">
                  <div className="hero__stat">
                    <span className="hero__stat-value">2 min</span>
                    <span className="hero__stat-label">Avg. diagnosis</span>
                  </div>
                  <div className="hero__stat">
                    <span className="hero__stat-value">AI</span>
                    <span className="hero__stat-label">Powered</span>
                  </div>
                  <div className="hero__stat">
                    <span className="hero__stat-value">24/7</span>
                    <span className="hero__stat-label">Available</span>
                  </div>
                </div>
              </div>

              <div className="hero__right">
                <FixBotVisual />
              </div>
            </div>
          </div>

          {/* Slide 3 — we fix it */}
          <div className="hero__slide">
            <div className="hero__inner">
              <div className="hero__left">
                <h1 className="hero__title">
                  We don't just diagnose{" "}
                  <span className="hero__title-accent">we fix it</span>
                </h1>
                <p className="hero__sub">
                  Book a remote session or mail in your device — our expert
                  technicians handle everything from{" "}
                  <strong>diagnosis to delivery</strong>
                </p>
                <div className="hero__actions">
                  <button
                    className="hero__btn hero__btn--primary"
                    onClick={() => setDiagOpen(true)}>
                    Get started →
                  </button>
                  <button
                    className="hero__btn hero__btn--secondary"
                    onClick={() => scrollTo("#resources")}>
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

              <div className="hero__right">
                <RepairVisual />
              </div>
            </div>
          </div>
        </div>

        <button
          className="hero__arrow hero__arrow--prev"
          onClick={prev}
          aria-label="Previous slide">
          ‹
        </button>
        <button
          className="hero__arrow hero__arrow--next"
          onClick={next}
          aria-label="Next slide">
          ›
        </button>
      </div>

      <div className="hero__dots">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            className={`hero__dot ${slide === i ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Diagnosis modal */}
      {diagOpen && <DiagnosisModal onClose={() => setDiagOpen(false)} />}
    </section>
  );
}
