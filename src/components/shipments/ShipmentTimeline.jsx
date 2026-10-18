import { buildTimeline } from "../../utils/shipmentStatus";
import "./shipments.css";

const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

/**
 * The repair journey as a line of dots. `compact` is a single row of
 * dots for tables (admin); the default is the full vertical history
 * with times and notes (customer).
 */
export default function ShipmentTimeline({ shipment, compact = false }) {
  const steps = buildTimeline(shipment);

  if (compact) {
    return (
      <ol className="shp-dots" aria-label="Shipment progress">
        {steps.map((step) => (
          <li
            key={step.value}
            className={`shp-dots__dot shp-dots__dot--${step.state}`}
            title={`${step.label}${step.reachedAt ? ` — ${formatWhen(step.reachedAt)}` : ""}`}>
            <span className="visually-hidden">
              {step.label}: {step.state}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="shp-timeline" aria-label="Shipment history">
      {steps.map((step) => (
        <li
          key={step.value}
          className={`shp-timeline__step shp-timeline__step--${step.state}`}
          aria-current={step.state === "current" ? "step" : undefined}>
          <span className="shp-timeline__marker" aria-hidden="true">
            {step.state === "done" && (
              <svg viewBox="0 0 16 16" width="12" height="12">
                <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <div className="shp-timeline__body">
            <span className="shp-timeline__label">
              {step.label}
              {step.state === "skipped" && <em> — skipped</em>}
            </span>
            <span className="shp-timeline__meta">
              {step.reachedAt ? formatWhen(step.reachedAt) : step.state === "current" ? step.hint : ""}
            </span>
            {step.notes.map((note, i) => (
              <span key={i} className="shp-timeline__note">
                {note}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
