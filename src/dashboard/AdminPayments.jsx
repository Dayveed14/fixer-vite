import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import { listPayments } from "../api/payments.api";
import "./AdminPayments.css";

const FILTERS = [
  { id: "all", label: "All", params: {} },
  { id: "unused", label: "Paid, not used", params: { status: "success", unfulfilled: "true" } },
  { id: "success", label: "Paid", params: { status: "success" } },
  { id: "pending", label: "Pending", params: { status: "pending" } },
  { id: "failed", label: "Failed", params: { status: "failed" } },
  { id: "mismatch", label: "Amount mismatch", params: { status: "mismatch" } },
];

const PURPOSES = {
  booking: "Support call",
  shipment: "Pickup fee",
  repair: "Repair + return",
  return: "Return delivery",
};

const naira = (kobo) => `₦${(Number(kobo) / 100).toLocaleString("en-NG")}`;
const when = (d) =>
  d ? new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—";

function HealthPanel() {
  const [metrics, setMetrics] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get("/api/health/metrics")
      .then((r) => setMetrics(r.data))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p className="pay-note">System health isn't available right now.</p>;
  if (!metrics) return <p className="pay-note">Checking system health…</p>;

  const unused = metrics.payments?.unfulfilled ?? 0;
  const failedHour = metrics.payments?.failed_last_hour ?? 0;
  const channels = metrics.alert_channels || {};

  return (
    <section className="pay-health" aria-label="System health">
      <div className={`pay-health__item ${unused ? "is-warn" : ""}`}>
        <strong>{unused}</strong>
        <span>paid but unused for 15+ min</span>
      </div>
      <div className={`pay-health__item ${failedHour >= 5 ? "is-warn" : ""}`}>
        <strong>{failedHour}</strong>
        <span>failed payments in the last hour</span>
      </div>
      <div className={`pay-health__item ${metrics.server_errors_last_5_min ? "is-warn" : ""}`}>
        <strong>{metrics.server_errors_last_5_min}</strong>
        <span>server errors in the last 5 min</span>
      </div>
      <div className="pay-health__item">
        <strong>{metrics.alerts_sent}</strong>
        <span>
          alerts sent since restart (email {channels.email ? "on" : "off"}, chat webhook{" "}
          {channels.webhook ? "on" : "off"})
        </span>
      </div>
      {metrics.recent_alerts?.length > 0 && (
        <ul className="pay-alerts">
          {metrics.recent_alerts.slice(0, 5).map((a) => (
            <li key={`${a.key}-${a.at}`}>
              <span>{when(a.at)}</span> {a.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminPayments() {
  const [filter, setFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null); // reference
  const [events, setEvents] = useState([]);

  const load = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const params = FILTERS.find((f) => f.id === id)?.params || {};
      setRows(await listPayments(params));
    } catch (err) {
      setError(err.message || "Couldn't load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const toggle = async (reference) => {
    if (open === reference) {
      setOpen(null);
      return;
    }
    setOpen(reference);
    setEvents([]);
    try {
      const { data } = await api.get(`/api/payments/${encodeURIComponent(reference)}/events`);
      setEvents(data);
    } catch {
      setEvents(null);
    }
  };

  return (
    <div className="pay-page">
      <header className="pay-header">
        <div>
          <h1>Payments</h1>
          <p>
            Every Paystack payment and what it paid for. "Paid, not used" means a customer
            paid but no booking or repair was created: follow up or refund.
          </p>
        </div>
      </header>

      <HealthPanel />

      <div className="pay-filters" role="tablist" aria-label="Filter payments">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={filter === f.id ? "is-active" : ""}
            onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="pay-error" role="alert">{error}</p>}

      <div className="table-wrapper pay-table">
        {loading ? (
          <p className="pay-note">Loading payments…</p>
        ) : rows.length === 0 ? (
          <p className="pay-note">No payments match this filter.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>For</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Used for</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <PaymentRow
                  key={p.reference}
                  p={p}
                  open={open === p.reference}
                  events={open === p.reference ? events : []}
                  onToggle={() => toggle(p.reference)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PaymentRow({ p, open, events, onToggle }) {
  return (
    <>
      <tr
        className="row-link"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}>
        <td className="pay-ref">{p.reference}</td>
        <td>{PURPOSES[p.purpose] || p.purpose}</td>
        <td>{p.email}</td>
        <td>{naira(p.amount_kobo)}</td>
        <td>
          <span className={`pay-status pay-status--${p.status}`}>{p.status}</span>
        </td>
        <td>{when(p.created_at)}</td>
        <td>{p.entity_type ? `${p.entity_type.replace("_", " ")} #${p.entity_id}` : "—"}</td>
      </tr>
      {open && (
        <tr className="pay-events-row">
          <td colSpan={7}>
            {events === null ? (
              <p className="pay-note">Couldn't load the history for this payment.</p>
            ) : events.length === 0 ? (
              <p className="pay-note">Loading history…</p>
            ) : (
              <ol className="pay-events">
                {events.map((e) => (
                  <li key={e.id}>
                    <span>{when(e.created_at)}</span>
                    <strong>{e.event.replace("_", " ")}</strong>
                    {e.from_status && e.to_status && e.from_status !== e.to_status
                      ? ` ${e.from_status} → ${e.to_status}`
                      : ""}
                    {` via ${e.source}`}
                    {e.detail ? ` (${e.detail})` : ""}
                  </li>
                ))}
              </ol>
            )}
            {p.failure_reason && <p className="pay-note">Reason: {p.failure_reason}</p>}
          </td>
        </tr>
      )}
    </>
  );
}
