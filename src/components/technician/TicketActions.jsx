import { useState } from "react";
import { setTicketStatus } from "../../api/technician.api";

const STATUSES = ["Open", "In Progress", "Pending", "Completed"];

/** Other tickets: update the status. No amount needed to complete. */
export default function TicketActions({ ticket, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (ticket.status === "Completed") return <span className="cell-sub">—</span>;

  const update = async (status) => {
    setBusy(true);
    setError(null);
    try {
      await setTicketStatus(ticket.id, status);
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tj-actions">
      <div className="row-actions">
        <select
          aria-label={`Status for ${ticket.ticket_code}`}
          value={ticket.status}
          disabled={busy}
          onChange={(e) => update(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="tech-action-btn primary" disabled={busy} onClick={() => update("Completed")}>
          Mark complete
        </button>
      </div>
      {error && <p className="manage-error">{error}</p>}
    </div>
  );
}
