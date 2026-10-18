import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getShipment,
  listShipments,
  sendQuote,
  updateShipmentStatus,
} from "../api/shipments.api";
import api from "../api/client";
import ShipmentTimeline from "../components/shipments/ShipmentTimeline";
import { SHIPMENT_STEPS, naira, statusLabel } from "../utils/shipmentStatus";
import "./AdminArticles.css";
import "../components/shipments/shipments.css";

// Button text for moving to each status.
const ACTION_LABELS = {
  courier_assigned: "Courier assigned",
  device_collected: "Device collected",
  diagnosis: "Start diagnosis",
  repair: "Assign technician & start repair",
  quality_check: "Quality check",
  ready_for_delivery: "Ready for delivery",
  delivered: "Mark delivered",
  cancelled: "Cancel pickup",
};

/* ---------- Diagnosis + quote form ---------- */
function QuoteModal({ shipment, onClose, onSent }) {
  const [diagnosis, setDiagnosis] = useState(shipment.diagnosis_summary || "");
  const [cost, setCost] = useState(shipment.repair_cost ? String(Math.round(shipment.repair_cost)) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const repairCost = Number(cost);
  const valid = diagnosis.trim().length > 0 && Number.isInteger(repairCost) && repairCost > 0;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await sendQuote(shipment.id, { diagnosis: diagnosis.trim(), repair_cost: repairCost });
      onSent();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="shp-modal-backdrop" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form className="shp-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title" onSubmit={submit}>
        <h2 id="quote-title">Diagnosis and quote — {shipment.reference}</h2>
        <p>
          {shipment.name} will see this, get an email, and be asked to approve and pay or decline.
          Return delivery for their area is added to the total automatically.
        </p>

        <div className="shp-field">
          <label htmlFor="quote-diagnosis">What's wrong with the device</label>
          <textarea
            id="quote-diagnosis"
            rows={5}
            maxLength={2000}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. The charging IC is damaged. We'll replace it and test charging under load."
            autoFocus
          />
          <small>{diagnosis.length}/2000</small>
        </div>

        <div className="shp-field">
          <label htmlFor="quote-cost">Repair cost (₦)</label>
          <input
            id="quote-cost"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="25000"
          />
          <small>Parts and labour. Whole naira.</small>
        </div>

        {error && (
          <p className="shp-error" role="alert">
            {error}
          </p>
        )}

        <div className="shp-actions">
          <button type="submit" className="shp-btn" disabled={!valid || busy}>
            {busy ? "Sending…" : shipment.status === "waiting_approval" ? "Send revised quote" : "Send quote to customer"}
          </button>
          <button type="button" className="shp-btn shp-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Start repair: choose the technician ---------- */
function AssignTechnicianModal({ shipment, technicians, onClose, onAssigned }) {
  const [technicianId, setTechnicianId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!technicianId) return;
    setBusy(true);
    setError(null);
    try {
      await updateShipmentStatus(shipment.id, "repair", { technician_id: Number(technicianId) });
      onAssigned();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="shp-modal-backdrop" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form className="shp-modal" role="dialog" aria-modal="true" aria-labelledby="assign-title" onSubmit={submit}>
        <h2 id="assign-title">Start repair — {shipment.reference}</h2>
        <p>
          The technician gets it in their Repairs list and marks it repaired when done. You can then
          move it to quality check.
        </p>
        <div className="shp-field">
          <label htmlFor="assign-tech">Technician</label>
          <select
            id="assign-tech"
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
            autoFocus>
            <option value="">Choose a technician</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.first_name} {t.last_name}
              </option>
            ))}
          </select>
          {technicians.length === 0 && <small>No technicians found. Add one under Technicians.</small>}
        </div>
        {error && (
          <p className="shp-error" role="alert">
            {error}
          </p>
        )}
        <div className="shp-actions">
          <button type="submit" className="shp-btn" disabled={!technicianId || busy}>
            {busy ? "Assigning…" : "Assign and start repair"}
          </button>
          <button type="button" className="shp-btn shp-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function StatusActions({ shipment, busy, onMove, onQuote }) {
  const actions = shipment.next_actions || { statuses: [] };

  return (
    <div className="shp-actions" style={{ marginTop: 8 }}>
      {actions.can_quote && (
        <button className="article-view" onClick={onQuote} disabled={busy}>
          {shipment.status === "waiting_approval" ? "Revise quote" : "Send diagnosis & quote"}
        </button>
      )}
      {actions.statuses.map((status) => (
        <button
          key={status}
          className={status === "cancelled" ? "article-delete" : "article-view"}
          disabled={busy}
          onClick={() => onMove(status)}>
          {ACTION_LABELS[status] || statusLabel(status)}
        </button>
      ))}
      {actions.awaiting_customer && <small>Waiting for the customer to answer the quote.</small>}
      {actions.awaiting_technician && <small>Waiting for the technician to mark it repaired.</small>}
      {shipment.status === "repair" && shipment.repair_outcome === "unrepairable" && (
        <small>The technician couldn't repair it — send it back.</small>
      )}
    </div>
  );
}

export default function AdminShipments() {
  const [searchParams] = useSearchParams();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(() => Number(searchParams.get("open")) || null);
  const [details, setDetails] = useState({}); // id -> shipment with events
  const [busyId, setBusyId] = useState(null);
  const [quoteFor, setQuoteFor] = useState(null);
  const [assignFor, setAssignFor] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      setShipments(await listShipments());
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetails = useCallback(async (id) => {
    try {
      const data = await getShipment(id);
      setDetails((prev) => ({ ...prev, [id]: data }));
    } catch {
      /* the row still shows; timeline just won't have times */
    }
  }, []);

  useEffect(() => {
    load();
    api
      .get("/api/users/technicians")
      .then(({ data }) => setTechnicians(Array.isArray(data) ? data : []))
      .catch(() => setTechnicians([]));
  }, [load]);

  const technicianName = (id) => {
    const t = technicians.find((x) => Number(x.id) === Number(id));
    return t ? `${t.first_name} ${t.last_name}` : id ? `#${id}` : "—";
  };

  useEffect(() => {
    const fromLink = Number(searchParams.get("open"));
    if (fromLink) setExpandedId(fromLink);
  }, [searchParams]);

  useEffect(() => {
    if (expandedId) loadDetails(expandedId);
  }, [expandedId, loadDetails]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return shipments.filter(
      (s) =>
        (status === "all" || s.status === status) &&
        [s.reference, s.name, s.email, s.device].some((v) => (v || "").toLowerCase().includes(q)),
    );
  }, [shipments, search, status]);

  const refresh = async (id) => {
    await load();
    if (id && expandedId === id) await loadDetails(id);
  };

  const move = async (shipment, next) => {
    if (next === "repair") {
      setAssignFor(shipment);
      return;
    }
    if (next === "cancelled" && !window.confirm(`Cancel pickup ${shipment.reference}?`)) return;
    setBusyId(shipment.id);
    setActionError(null);
    try {
      await updateShipmentStatus(shipment.id, next);
      await refresh(shipment.id);
    } catch (err) {
      setActionError(`${shipment.reference}: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-articles">
      <div className="admin-articles-header">
        <div>
          <h1>Shipments</h1>
          <p>Move each device through pickup, diagnosis, repair and delivery.</p>
        </div>
      </div>

      <div className="admin-articles-filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference, name, email, device"
          className="form-control"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
          <option value="all">All statuses</option>
          {[...SHIPMENT_STEPS, { value: "cancelled", label: "Cancelled" }].map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <p className="shp-error" role="alert">
          {actionError}
        </p>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : loadError ? (
        <p className="shp-error" role="alert">
          {loadError}
        </p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Pickup</th>
                <th>Progress</th>
                <th>Next step</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const full = details[s.id] ? { ...s, ...details[s.id] } : s;
                return (
                  <Fragment key={s.id}>
                    <tr>
                      <td>
                        <span className="article-title">{s.reference}</span>
                        <br />
                        <button
                          className="shp-link"
                          aria-expanded={expandedId === s.id}
                          onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                          {expandedId === s.id ? "Hide details" : "Details"}
                        </button>
                      </td>
                      <td>
                        {s.name}
                        <br />
                        <small>{s.email}</small>
                      </td>
                      <td>
                        {s.brand} {s.device}
                      </td>
                      <td>
                        {s.pickup_date ? new Date(s.pickup_date).toLocaleDateString("en-NG") : ""}
                        <br />
                        <small>
                          {s.pickup_time?.slice(0, 5)} · {naira(s.fee_amount)}
                        </small>
                      </td>
                      <td>
                        <strong>{statusLabel(s.status)}</strong>
                        {s.status === "waiting_approval" && s.approval_status !== "pending" && (
                          <small> ({s.approval_status})</small>
                        )}
                        <ShipmentTimeline shipment={full} compact />
                      </td>
                      <td>
                        <StatusActions
                          shipment={s}
                          busy={busyId === s.id}
                          onMove={(next) => move(s, next)}
                          onQuote={() => setQuoteFor(s)}
                        />
                      </td>
                    </tr>

                    {expandedId === s.id && (
                      <tr>
                        <td colSpan={6}>
                          <div className="shp-card__body" style={{ borderTop: 0 }}>
                            <ShipmentTimeline shipment={full} />
                            <div className="shp-details">
                              <dl>
                                <dt>Phone</dt>
                                <dd>{s.phone}</dd>
                                <dt>Fault</dt>
                                <dd>{s.fault}</dd>
                                <dt>Address</dt>
                                <dd>
                                  {s.address}, {s.city}
                                </dd>
                                {s.notes && (
                                  <>
                                    <dt>Notes</dt>
                                    <dd>{s.notes}</dd>
                                  </>
                                )}
                                <dt>Pickup payment</dt>
                                <dd>{s.payment_reference}</dd>
                                {s.quote_total && (
                                  <>
                                    <dt>Diagnosis</dt>
                                    <dd style={{ whiteSpace: "pre-line" }}>{s.diagnosis_summary}</dd>
                                    <dt>Quote</dt>
                                    <dd>
                                      {naira(s.repair_cost)} + {naira(s.return_fee)} return = {naira(s.quote_total)}
                                    </dd>
                                    <dt>Customer answer</dt>
                                    <dd>
                                      {s.approval_status || "—"}
                                      {s.approval_amount_paid > 0 && ` · paid ${naira(s.approval_amount_paid)}`}
                                    </dd>
                                  </>
                                )}
                                {s.technician_id && (
                                  <>
                                    <dt>Technician</dt>
                                    <dd>
                                      {technicianName(s.technician_id)}
                                      {s.repair_outcome &&
                                        ` · ${s.repair_outcome === "repaired" ? "marked repaired" : "couldn't repair"}`}
                                      {s.repair_note && ` — ${s.repair_note}`}
                                    </dd>
                                  </>
                                )}
                                {s.delivery_confirm_by && s.status === "ready_for_delivery" && (
                                  <>
                                    <dt>Auto-confirms</dt>
                                    <dd>{new Date(s.delivery_confirm_by).toLocaleString("en-NG")}</dd>
                                  </>
                                )}
                                {s.delivered_at && (
                                  <>
                                    <dt>Delivered</dt>
                                    <dd>
                                      {new Date(s.delivered_at).toLocaleString("en-NG")} ({s.delivery_confirmed_by})
                                    </dd>
                                  </>
                                )}
                              </dl>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ padding: 16 }}>No shipments found.</p>}
        </div>
      )}

      {assignFor && (
        <AssignTechnicianModal
          shipment={assignFor}
          technicians={technicians}
          onClose={() => setAssignFor(null)}
          onAssigned={async () => {
            const id = assignFor.id;
            setAssignFor(null);
            await refresh(id);
          }}
        />
      )}

      {quoteFor && (
        <QuoteModal
          shipment={quoteFor}
          onClose={() => setQuoteFor(null)}
          onSent={async () => {
            const id = quoteFor.id;
            setQuoteFor(null);
            await refresh(id);
          }}
        />
      )}
    </div>
  );
}
