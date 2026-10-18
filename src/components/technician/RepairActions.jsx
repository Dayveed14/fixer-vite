import { useState } from "react";
import { reportRepair } from "../../api/technician.api";

/**
 * A repair assigned to the technician: "Mark repaired" or "Can't
 * repair" (with a reason). No amount — the admin already quoted and the
 * customer already paid. The admin then moves it to quality check.
 */
export default function RepairActions({ repair, onChanged }) {
  const [mode, setMode] = useState(null); // "unrepairable"
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (repair.status !== "repair") return <span className="cell-sub">—</span>;

  if (repair.repair_outcome) {
    return (
      <span className="cell-sub">
        {repair.repair_outcome === "repaired" ? "Marked repaired" : "Marked can't repair"} — waiting on the admin
      </span>
    );
  }

  const submit = async (outcome) => {
    setBusy(true);
    setError(null);
    try {
      await reportRepair(repair.id, { outcome, note: note.trim() || undefined });
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tj-actions">
      {mode === "unrepairable" ? (
        <div className="tj-panel tj-panel--column">
          <label htmlFor={`why-${repair.id}`}>Why can't it be repaired?</label>
          <textarea
            id={`why-${repair.id}`}
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Motherboard is cracked; replacement part not available."
          />
          <div className="row-actions">
            <button className="tech-action-btn danger" disabled={busy || !note.trim()} onClick={() => submit("unrepairable")}>
              {busy ? "Sending…" : "Send to admin"}
            </button>
            <button className="tech-action-btn" disabled={busy} onClick={() => setMode(null)}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="row-actions">
          <button className="tech-action-btn primary" disabled={busy} onClick={() => submit("repaired")}>
            {busy ? "Saving…" : "Mark repaired"}
          </button>
          <button className="tech-action-btn danger" disabled={busy} onClick={() => setMode("unrepairable")}>
            Can't repair
          </button>
        </div>
      )}
      {error && <p className="manage-error">{error}</p>}
    </div>
  );
}
