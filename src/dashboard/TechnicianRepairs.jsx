// TechnicianRepairs.jsx — mail-in devices the admin assigned to this
// technician. Mark each one repaired (or can't repair); the admin then
// moves it to quality check and back to the customer.

import { useState } from "react";
import ShipmentTimeline from "../components/shipments/ShipmentTimeline";
import RepairActions from "../components/technician/RepairActions";
import useTechnicianJobs from "../components/technician/useTechnicianJobs";
import "../components/technician/technician.css";
import "./TechnicianShared.css";

export default function TechnicianRepairs() {
  const { repairs, loading, errors, reload } = useTechnicianJobs({ appointments: false, tickets: false });
  const [showDone, setShowDone] = useState(false);
  const [openId, setOpenId] = useState(null);

  const visible = repairs.filter((r) => showDone || (r.status === "repair" && !r.repair_outcome));

  return (
    <div className="tech-page">
      <div className="tech-page-header">
        <div>
          <h1>Repairs</h1>
          <p>Mail-in devices assigned to you. The customer has already approved and paid.</p>
        </div>
      </div>

      <div className="tj-filters">
        <button className="tj-chip" aria-pressed={showDone} onClick={() => setShowDone((v) => !v)}>
          Show finished repairs
        </button>
      </div>

      {errors.map((e) => (
        <p key={e} className="dashboard-error">
          {e}
        </p>
      ))}

      <div className="tech-panel">
        {loading ? (
          <p className="dashboard-loading">Loading your repairs…</p>
        ) : visible.length === 0 ? (
          <p className="dashboard-empty">No repairs waiting for you.</p>
        ) : (
          <table className="tj-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>What to fix</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="tj-kind tj-kind--repair">Repair</span>
                    <div className="cell-primary">
                      {r.brand} {r.device}
                    </div>
                    <div className="cell-sub">
                      {r.reference} · {r.name}
                    </div>
                    <button className="shp-link" onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                      {openId === r.id ? "Hide history" : "History"}
                    </button>
                    {openId === r.id && <ShipmentTimeline shipment={r} compact />}
                  </td>
                  <td>
                    <div className="tj-repair-meta">
                      <strong>Customer said:</strong> {r.fault}
                      {r.diagnosis_summary && (
                        <>
                          <br />
                          <strong>Diagnosis:</strong> {r.diagnosis_summary}
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`tj-status tj-status--${r.repair_outcome ? "done" : "active"}`}>
                      {r.repair_outcome === "repaired"
                        ? "repaired"
                        : r.repair_outcome === "unrepairable"
                          ? "can't repair"
                          : String(r.status).replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <RepairActions repair={r} onChanged={reload} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
