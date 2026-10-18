import { useState } from "react";
import {
  createMeetingLink,
  setAppointmentStatus,
  startRemoteSession,
} from "../../api/technician.api";
import { whatsappNumber } from "./jobs";

const MESHCENTRAL_WEB_URL = import.meta.env.VITE_MESHCENTRAL_WEB_URL || "";

/**
 * The right "start" for each kind of call:
 *  - remote support → MeshCentral invite (emailed to the customer)
 *  - voice          → the technician calls the customer (phone / WhatsApp)
 *  - video          → open the booking's meeting link and wait for the customer
 * Plus "Mark completed" / "Mark missed" — no amount needed.
 */
export default function AppointmentActions({ booking, onChanged }) {
  const [panel, setPanel] = useState(null); // "call" | "remote" | null
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState(booking.meeting_url || null);

  if (booking.status !== "confirmed") return <span className="cell-sub">—</span>;

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startRemote = () =>
    run(async () => {
      await startRemoteSession(booking.id);
      setPanel("remote");
    });

  const joinVideo = () =>
    run(async () => {
      let url = meetingUrl;
      if (!url) {
        url = (await createMeetingLink(booking.id)).meeting_url;
        setMeetingUrl(url);
      }
      window.open(url, "_blank", "noopener,noreferrer");
    });

  const finish = (status) =>
    run(async () => {
      await setAppointmentStatus(booking.id, status);
      onChanged?.();
    });

  const wa = whatsappNumber(booking.customer_phone);

  return (
    <div className="tj-actions">
      <div className="row-actions">
        {booking.support_type === "remote_desktop" && (
          <button className="tech-action-btn primary" disabled={busy} onClick={startRemote}>
            {busy && !panel ? "Starting…" : "Start remote session"}
          </button>
        )}
        {booking.support_type === "voice" && (
          <button
            className="tech-action-btn primary"
            onClick={() => setPanel(panel === "call" ? null : "call")}>
            Call customer
          </button>
        )}
        {booking.support_type === "video" && (
          <button className="tech-action-btn primary" disabled={busy} onClick={joinVideo}>
            {meetingUrl ? "Join video call" : "Create & join video call"}
          </button>
        )}
        <button className="tech-action-btn" disabled={busy} onClick={() => finish("completed")}>
          Mark completed
        </button>
        <button className="tech-action-btn danger" disabled={busy} onClick={() => finish("missed")}>
          Mark missed
        </button>
      </div>

      {panel === "call" && (
        <div className="tj-panel" role="region" aria-label="Call the customer">
          {booking.customer_phone ? (
            <>
              <span className="tj-phone">{booking.customer_phone}</span>
              <a className="tech-action-btn primary" href={`tel:${booking.customer_phone.replace(/\s+/g, "")}`}>
                Call now
              </a>
              {wa && (
                <a className="tech-action-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              )}
            </>
          ) : (
            <span>No phone number on file. Ask the admin for the customer's contact.</span>
          )}
        </div>
      )}

      {panel === "remote" && (
        <div className="tj-panel" role="status">
          <span>Invite sent — the customer has the link by email.</span>
          {MESHCENTRAL_WEB_URL && (
            <a href={MESHCENTRAL_WEB_URL} target="_blank" rel="noreferrer" className="tech-action-btn primary">
              Open MeshCentral
            </a>
          )}
        </div>
      )}

      {meetingUrl && booking.support_type === "video" && (
        <span className="cell-sub tj-link">{meetingUrl}</span>
      )}

      {error && <p className="manage-error">{error}</p>}
    </div>
  );
}
