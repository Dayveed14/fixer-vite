import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Hero.css";
import { runDiagnosis } from "../../api/diagnosis.api";
import FixBotMascot from "../fixbot/FixBotMascot";
import { getSupportTypes } from "../../api/bookings.api";
import { getDispatchZones } from "../../api/shipments.api";
import "../css/HeroBench.css";
import { diagnosisKind, noMatchMessage, formatEstimatedRepair } from "../../utils/diagnosis";

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

function DiagnosisModal({ onClose, initialDevice = "", initialSymptom = "" }) {
  const [deviceType, setDeviceType] = useState(initialDevice);
  const [brand, setBrand] = useState("");
  const [primaryFault, setPrimaryFault] = useState("");
  const [selectedSymptoms, setSymptoms] = useState(initialSymptom ? [initialSymptom] : []);
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
      let data;
      try {
        data = await runDiagnosis({
          deviceType,
          brand,
          primaryFault,
          selectedSymptoms,
          description,
        });
      } catch (apiError) {
        // ApiError messages are already customer-friendly (validation,
        // rate limiting, timeouts, outages).
        setError(apiError.message);
        return;
      }

      // No confident knowledge-base match and no AI answer — still give
      // the customer a way forward.
      if (diagnosisKind(data) === "no_match") {
        setDiagnosis({
          source: "no_match",
          requestId: data.requestId,
          likelyProblem: "We need a technician's eyes on this",
          severity: "medium",
          estimatedRepair: "Assessment required",
          causes: [],
          steps: [noMatchMessage(data)],
          bookTechnician: true,
          mailInRepair: true,
        });
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
  // AI response
  setDiagnosis({
    ...data,
    estimatedRepair: formatEstimatedRepair(data.estimatedRepair),
  });
}
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
            <div className="fixbot-stage">
              <div className="fixbot-stage__spot">
                <FixBotMascot
                  mood={
                    loading
                      ? "thinking"
                      : error
                        ? "oops"
                        : diagnosis?.source === "no_match"
                          ? "puzzled"
                          : diagnosis
                            ? "happy"
                            : "idle"
                  }
                  size={150}
                />
              </div>

              {!diagnosis && !error && (
                <div className="fixbot-bubble" aria-live="polite">
                  <span className="fixbot-bubble__name">FixBot</span>
                  {loading
                    ? "Let me take a look… I'm checking your symptoms against our repair notes."
                    : "Hi! Tell me what's wrong with your computer and I'll suggest fixes in under two minutes."}
                </div>
              )}
            </div>

            {error && !loading && (
              <div className="diag-modal__result diag-modal__result--error" role="alert">
                <span className="fixbot-bubble__name">FixBot</span>
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
                <p className="diag-modal__result-sub">
                  <span className="fixbot-bubble__name">FixBot</span>
                  {diagnosis.source === "knowledge_base"
                    ? "Found it in our repair notes:"
                    : diagnosis.source === "no_match"
                      ? "I couldn't pin this one down."
                      : "Here's my best diagnosis:"}
                </p>

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

// ── The workbench hero ─────────────────────────────────────────────
// Tap a symptom: the bench console runs a short scan and shows the
// usual suspects, then FixBot opens already knowing what's wrong.

const BENCH_SYMPTOMS = [
  {
    label: "Won't charge",
    device: "Laptop",
    causes: ["Worn charging port or DC jack", "Faulty charger or cable", "Dead battery cells"],
  },
  {
    label: "Overheating",
    device: "Laptop",
    causes: ["Dust-blocked fan and vents", "Dried thermal paste", "Background apps maxing the CPU"],
  },
  {
    label: "Battery drains fast",
    device: "Laptop",
    causes: ["Battery past its cycle life", "Power-hungry startup apps", "Screen brightness and settings"],
  },
  {
    label: "Random restart",
    device: "Desktop PC",
    causes: ["Overheating protection kicking in", "Failing power supply", "Driver or update fault"],
  },
  {
    label: "Lagging",
    device: "Laptop",
    causes: ["Hard drive near full or failing", "Too little memory for the workload", "Malware or bloatware"],
  },
  {
    label: "Keyboard not working",
    device: "Laptop",
    causes: ["Liquid damage under the keys", "Loose keyboard ribbon cable", "Driver or BIOS setting"],
  },
];

const naira = (n) => `₦${Number(n).toLocaleString("en-NG")}`;

function useLivePrices() {
  const [prices, setPrices] = useState({ call: null, pickup: null, zones: null });
  useEffect(() => {
    let alive = true;
    Promise.allSettled([getSupportTypes(), getDispatchZones()]).then(([types, zones]) => {
      if (!alive) return;
      const amounts = types.status === "fulfilled" && Array.isArray(types.value)
        ? types.value.map((t) => Number(t.amount)).filter((n) => n > 0)
        : [];
      const zoneList = zones.status === "fulfilled" ? zones.value?.zones || [] : [];
      const fees = zoneList.map((z) => Number(z.fee)).filter((n) => n > 0);
      setPrices({
        call: amounts.length ? Math.min(...amounts) : null,
        pickup: fees.length ? Math.min(...fees) : null,
        zones: zoneList.length || null,
      });
    });
    return () => {
      alive = false;
    };
  }, []);
  return prices;
}

function BenchIllustration({ scanning }) {
  return (
    <svg className="bench-art" viewBox="0 0 560 420" aria-hidden="true" focusable="false">
      {/* traces running off the laptop into the blueprint */}
      <g className="bench-art__traces">
        <path d="M86 300H30V210H0" />
        <path d="M120 318V372H40V420" />
        <path d="M470 300H520V240H560" />
        <path d="M430 318V380H520V420" />
        <path d="M280 330V420" />
      </g>
      <g className="bench-art__signals">
        <path className={scanning ? "is-live" : ""} d="M86 300H30V210H0" />
        <path className={scanning ? "is-live is-late" : ""} d="M470 300H520V240H560" />
        <path className={scanning ? "is-live" : ""} d="M280 330V420" />
      </g>
      <g className="bench-art__pads">
        <circle cx="30" cy="210" r="4" />
        <circle cx="40" cy="372" r="4" />
        <circle cx="520" cy="240" r="4" />
        <circle cx="520" cy="380" r="4" />
      </g>

      {/* laptop: lid */}
      <rect className="bench-art__lid" x="110" y="60" width="340" height="220" rx="14" />
      <rect className="bench-art__screen" x="126" y="76" width="308" height="188" rx="6" />
      {/* screen content: a tiny board diagram */}
      <g className="bench-art__board">
        <rect x="160" y="104" width="86" height="58" rx="6" />
        <rect x="270" y="104" width="128" height="26" rx="5" />
        <rect x="270" y="140" width="56" height="22" rx="5" />
        <rect x="338" y="140" width="60" height="22" rx="5" />
        <path d="M246 133H270M203 162V200H300V162M368 162V214H190" />
        <circle cx="190" cy="214" r="5" />
        <circle cx="300" cy="200" r="4" />
      </g>
      <rect className={`bench-art__scanbar ${scanning ? "is-scanning" : ""}`} x="126" y="76" width="308" height="3" />

      {/* laptop: base */}
      <path className="bench-art__base" d="M70 284H490L470 320H90Z" />
      <rect className="bench-art__trackpad" x="246" y="294" width="68" height="12" rx="3" />
    </svg>
  );
}

export default function Hero() {
  const [diag, setDiag] = useState(null); // null | { device, symptom }
  const [picked, setPicked] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | scanning | done
  const prices = useLivePrices();

  const current = BENCH_SYMPTOMS.find((s) => s.label === picked);

  useEffect(() => {
    if (phase !== "scanning") return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => setPhase("done"), reduce ? 0 : 1400);
    return () => clearTimeout(id);
  }, [phase, picked]);

  const pick = (label) => {
    setPicked(label);
    setPhase("scanning");
  };

  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  const mood = phase === "scanning" ? "thinking" : phase === "done" ? "happy" : "idle";

  return (
    <section className="bench" aria-labelledby="bench-title">
      <div className="bench__grid" aria-hidden="true" />

      <div className="bench__stage">
        <div className="bench__copy">
          <h1 id="bench-title" className="bench__title">
            Broken device? Bring it to the bench.
          </h1>
          <p className="bench__lede">
            Tell FixBot what's wrong and get a likely cause in minutes. Then talk to a
            technician, or we'll collect it anywhere in Abuja, fix it at our Wuse workshop
            and bring it back.
          </p>

          <fieldset className="bench__symptoms">
            <legend>What's your device doing?</legend>
            <div className="bench__chips">
              {BENCH_SYMPTOMS.map((s) => (
                <button
                  type="button"
                  key={s.label}
                  className={`bench__chip ${picked === s.label ? "is-active" : ""}`}
                  aria-pressed={picked === s.label}
                  onClick={() => pick(s.label)}>
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="bench__actions">
            <button
              type="button"
              className="bench__btn bench__btn--primary"
              onClick={() => setDiag({ device: current?.device || "", symptom: current?.label || "" })}>
              {current ? `Diagnose "${current.label}" with FixBot` : "Run a free diagnosis"}
            </button>
            <Link className="bench__btn bench__btn--ghost" to="/book">
              Talk to a technician
            </Link>
          </div>
        </div>

        <div className="bench__workbench">
          <BenchIllustration scanning={phase === "scanning"} />
          <div className="bench__bot">
            <FixBotMascot mood={mood} size={128} />
          </div>

          <div className="bench__console" aria-live="polite">
            <div className="bench__console-bar">
              <span className={`bench__led bench__led--${phase}`} aria-hidden="true" />
              <span>FixBot bench</span>
            </div>
            {!current && (
              <p className="bench__console-idle">
                Pick a symptom and I'll check the usual suspects.
              </p>
            )}
            {current && phase === "scanning" && (
              <p className="bench__console-line">
                Scanning {current.device.toLowerCase()} for "{current.label.toLowerCase()}"
                <span className="bench__dots" aria-hidden="true" />
              </p>
            )}
            {current && phase === "done" && (
              <>
                <p className="bench__console-line">Usually one of these:</p>
                <ul className="bench__causes">
                  {current.causes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="bench__console-cta"
                  onClick={() => setDiag({ device: current.device, symptom: current.label })}>
                  Get a full diagnosis
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <nav className="bench__routes" aria-label="Ways to get your device fixed">
        <Link to="/book" className="bench__route">
          <strong>Talk to a technician</strong>
          <span>
            Voice, video or remote session, 8am to 10pm
            {prices.call ? ` · from ${naira(prices.call)}` : ""}
          </span>
        </Link>
        <Link to="/shipment" className="bench__route">
          <strong>Send it in for repair</strong>
          <span>
            {prices.zones ? `Pickup from ${prices.zones} areas in Abuja` : "Pickup across Abuja"}
            {prices.pickup ? ` · from ${naira(prices.pickup)}` : ""}
          </span>
        </Link>
        <button type="button" className="bench__route" onClick={() => scrollTo("#resources")}>
          <strong>Fix it yourself</strong>
          <span>Free step-by-step guides and videos</span>
        </button>
      </nav>

      {diag && (
        <DiagnosisModal
          initialDevice={diag.device}
          initialSymptom={diag.symptom}
          onClose={() => setDiag(null)}
        />
      )}
    </section>
  );
}
