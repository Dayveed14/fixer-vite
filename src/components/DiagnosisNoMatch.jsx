import { noMatchMessage } from "../utils/diagnosis";

/**
 * FixBot's third answer type: no confident knowledge-base match and no
 * AI answer (AI unavailable, timed out, malformed, or daily limit hit).
 * Always offers a way forward.
 */
export default function DiagnosisNoMatch({ diagnosis, onBook, onMailIn }) {
  const suggestions = Array.isArray(diagnosis?.suggestions)
    ? diagnosis.suggestions.filter((s) => s && s.primary_fault)
    : [];

  return (
    <div className="diag-ai-result" data-testid="diagnosis-no-match">
      <div className="diag-modal-header">
        <div>
          <h2>We need a technician's eyes on this</h2>
        </div>
      </div>

      <div className="diag-result">
        <p className="diag-followup">{noMatchMessage(diagnosis)}</p>

        {suggestions.length > 0 && (
          <div className="diag-section">
            <h4>Issues that might be related</h4>
            <ul className="diag-cause-list">
              {suggestions.map((s) => (
                <li key={s.id || s.primary_fault}>{s.primary_fault}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="diag-modal-actions">
          <button
            className="diag-action-btn diag-action-btn--primary"
            onClick={onBook}>
            Book Remote Support
          </button>
          <button
            className="diag-action-btn diag-action-btn--secondary"
            onClick={onMailIn}>
            Mail-in Repair
          </button>
        </div>
      </div>
    </div>
  );
}
