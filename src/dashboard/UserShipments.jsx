import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { usePaystackPayment } from "react-paystack";
import { getStoredUser } from "../api/client";
import { initializePayment } from "../api/payments.api";
import {
  confirmDelivery,
  listUserShipments,
  respondToQuote,
} from "../api/shipments.api";
import ShipmentTimeline from "../components/shipments/ShipmentTimeline";
import { naira, statusLabel, timeLeft } from "../utils/shipmentStatus";
import "../components/shipments/shipments.css";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const needsCustomer = (s) =>
  (s.status === "waiting_approval" && s.approval_status === "pending") ||
  s.status === "ready_for_delivery";

function chipClass(s) {
  if (needsCustomer(s)) return "shp-chip shp-chip--attention";
  if (s.status === "delivered") return "shp-chip shp-chip--done";
  if (s.status === "cancelled") return "shp-chip shp-chip--cancelled";
  return "shp-chip";
}

function chipText(s) {
  if (s.status === "waiting_approval" && s.approval_status === "pending") return "Your approval needed";
  if (s.status === "waiting_approval" && s.approval_status === "approved") return "Approved — repair next";
  if (s.status === "waiting_approval" && s.approval_status === "declined") return "Declined — returning";
  if (s.status === "ready_for_delivery") return "Confirm when received";
  return statusLabel(s.status);
}

/* ---------- Quote: approve & pay / decline ---------- */
function QuotePanel({ shipment, onDone }) {
  const openPaystack = usePaystackPayment({ publicKey: PAYSTACK_PUBLIC_KEY });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingDecline, setConfirmingDecline] = useState(false);
  const [paid, setPaid] = useState(null); // { decision, reference } after Paystack success

  const total = Number(shipment.quote_total);
  const declineFee = Number(shipment.decline_fee) || 0;

  const submit = async (decision, reference) => {
    setBusy(true);
    setError(null);
    try {
      await respondToQuote(shipment.id, { decision, payment_reference: reference });
      onDone();
    } catch (err) {
      setError(
        reference
          ? `${err.message} Your payment reference is ${reference} — you can retry without paying again.`
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  };

  const payThen = async (decision) => {
    setBusy(true);
    setError(null);
    let intent;
    try {
      intent = await initializePayment({
        purpose: decision === "approve" ? "repair" : "return",
        shipment_id: shipment.id,
      });
    } catch (err) {
      setBusy(false);
      setError(err.message);
      return;
    }

    openPaystack({
      config: {
        email: intent.email,
        amount: intent.amount_kobo,
        currency: intent.currency,
        reference: intent.reference,
        metadata: { shipment: shipment.reference, decision },
      },
      onSuccess: (response) => {
        const reference = response.reference || intent.reference;
        setPaid({ decision, reference });
        submit(decision, reference);
      },
      onClose: () => setBusy(false),
    });
  };

  const decline = () => (declineFee > 0 ? payThen("decline") : submit("decline"));

  return (
    <section className="shp-panel" aria-labelledby={`quote-${shipment.id}`}>
      <h3 id={`quote-${shipment.id}`}>Your repair quote</h3>
      <p>{shipment.diagnosis_summary}</p>

      <dl className="shp-quote">
        <dt>Repair</dt>
        <dd>{naira(shipment.repair_cost)}</dd>
        <dt>Return delivery to you</dt>
        <dd>{naira(shipment.return_fee)}</dd>
        <dt className="shp-quote__total">Total</dt>
        <dd className="shp-quote__total">{naira(total)}</dd>
      </dl>

      {paid ? (
        <div className="shp-actions">
          <button className="shp-btn" disabled={busy} onClick={() => submit(paid.decision, paid.reference)}>
            {busy ? "Confirming…" : "Retry confirmation"}
          </button>
        </div>
      ) : confirmingDecline ? (
        <>
          <p>
            {declineFee > 0
              ? `If you decline, we won't repair it and we'll send your device back. You'll only pay return delivery: ${naira(declineFee)}.`
              : "If you decline, we won't repair it and we'll send your device back."}
          </p>
          <div className="shp-actions">
            <button className="shp-btn" disabled={busy} onClick={decline}>
              {busy ? "Processing…" : declineFee > 0 ? `Pay ${naira(declineFee)} and decline` : "Decline repair"}
            </button>
            <button className="shp-btn shp-btn--ghost" disabled={busy} onClick={() => setConfirmingDecline(false)}>
              Back
            </button>
          </div>
        </>
      ) : (
        <div className="shp-actions">
          <button className="shp-btn" disabled={busy} onClick={() => payThen("approve")}>
            {busy ? "Processing…" : `Approve and pay ${naira(total)}`}
          </button>
          <button className="shp-btn shp-btn--ghost" disabled={busy} onClick={() => setConfirmingDecline(true)}>
            Decline
          </button>
        </div>
      )}

      {error && (
        <p className="shp-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

/* ---------- Ready for delivery: confirm receipt ---------- */
function DeliveryPanel({ shipment, onDone }) {
  const [now, setNow] = useState(() => new Date());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  const left = timeLeft(shipment.delivery_confirm_by, now);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await confirmDelivery(shipment.id);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="shp-panel" aria-labelledby={`deliver-${shipment.id}`}>
      <h3 id={`deliver-${shipment.id}`}>Your device is on its way back</h3>
      <p>
        Please confirm as soon as it's in your hands.{" "}
        {left ? (
          <>
            If you don't, we'll mark it delivered automatically in{" "}
            <span className="shp-countdown">{left}</span>.
          </>
        ) : (
          "The confirmation window has ended — it will be marked delivered automatically."
        )}
      </p>
      <div className="shp-actions">
        <button className="shp-btn shp-btn--success" disabled={busy} onClick={confirm}>
          {busy ? "Confirming…" : "I've received my device"}
        </button>
      </div>
      {error && (
        <p className="shp-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function ShipmentCard({ shipment, open, onToggle, onChanged }) {
  const pending = shipment.status === "waiting_approval" && shipment.approval_status === "pending";

  return (
    <article className={`shp-card ${needsCustomer(shipment) ? "shp-card--attention" : ""}`} id={`shipment-${shipment.id}`}>
      <button className="shp-card__summary" aria-expanded={open} onClick={onToggle}>
        <span className="shp-card__title">
          {shipment.brand} {shipment.device}
        </span>
        <span className={chipClass(shipment)}>{chipText(shipment)}</span>
        <span className="shp-card__sub">
          {shipment.reference} · booked {new Date(shipment.created_at).toLocaleDateString("en-NG")}
        </span>
      </button>

      {open && (
        <div className="shp-card__body">
          <ShipmentTimeline shipment={shipment} />

          <div>
            {pending && <QuotePanel shipment={shipment} onDone={onChanged} />}
            {shipment.status === "ready_for_delivery" && <DeliveryPanel shipment={shipment} onDone={onChanged} />}
            {shipment.status === "delivered" && shipment.delivered_at && (
              <section className="shp-panel shp-panel--calm">
                <h3>Delivered</h3>
                <p>
                  {new Date(shipment.delivered_at).toLocaleString("en-NG")}
                  {shipment.delivery_confirmed_by === "auto" ? " (confirmed automatically)" : ""}
                </p>
              </section>
            )}

            <div className="shp-details">
              <dl>
                <dt>Fault</dt>
                <dd>{shipment.fault}</dd>
                <dt>Pickup</dt>
                <dd>
                  {shipment.pickup_date ? new Date(shipment.pickup_date).toLocaleDateString("en-NG") : ""}{" "}
                  {shipment.pickup_time?.slice(0, 5)}
                </dd>
                <dt>Address</dt>
                <dd>
                  {shipment.address}, {shipment.city}
                </dd>
                <dt>Pickup fee</dt>
                <dd>{naira(shipment.fee_amount)}</dd>
                {shipment.approval_amount_paid > 0 && (
                  <>
                    <dt>{shipment.approval_status === "approved" ? "Repair paid" : "Return paid"}</dt>
                    <dd>{naira(shipment.approval_amount_paid)}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function UserShipments() {
  const [searchParams] = useSearchParams();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(() => Number(searchParams.get("open")) || null);

  const load = useCallback(async () => {
    const user = getStoredUser();
    if (!user?.email) {
      setShipments([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await listUserShipments(user.email);
      setShipments(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 404) setShipments([]);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Open the shipment a notification pointed to; otherwise the first
  // one that needs the customer.
  const autoOpened = useRef(false);
  useEffect(() => {
    const fromLink = Number(searchParams.get("open"));
    if (fromLink) {
      setOpenId(fromLink);
      autoOpened.current = true;
      return;
    }
    if (!autoOpened.current && shipments.length) {
      autoOpened.current = true;
      setOpenId((shipments.find(needsCustomer) || shipments[0]).id);
    }
  }, [searchParams, shipments]);

  return (
    <div className="shp-page">
      <header className="shp-page__head">
        <h1>My shipments</h1>
        <p>Follow your device from pickup to delivery.</p>
      </header>

      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="shp-error" role="alert">
          {error}
        </p>
      ) : shipments.length === 0 ? (
        <div className="shp-empty">
          <p>You haven't sent a device in yet.</p>
          <Link to="/mailin" className="shp-btn">
            Book a pickup
          </Link>
        </div>
      ) : (
        shipments.map((s) => (
          <ShipmentCard
            key={s.id}
            shipment={s}
            open={openId === s.id}
            onToggle={() => setOpenId(openId === s.id ? null : s.id)}
            onChanged={load}
          />
        ))
      )}
    </div>
  );
}
