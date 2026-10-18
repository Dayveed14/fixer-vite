// TechnicianAppointments.jsx — booked calls assigned to this technician:
// voice calls, video calls and remote support.

import { useState } from "react";
import JobTable from "../components/technician/JobTable";
import useTechnicianJobs from "../components/technician/useTechnicianJobs";
import { appointmentToJob, CALL_TYPES } from "../components/technician/jobs";
import "./TechnicianShared.css";

const TYPES = [{ key: "all", label: "All calls" }, ...Object.entries(CALL_TYPES).map(([key, t]) => ({ key, label: t.label }))];

export default function TechnicianAppointments() {
  const { appointments, loading, errors, reload } = useTechnicianJobs({ repairs: false, tickets: false });
  const [type, setType] = useState("all");
  const [showDone, setShowDone] = useState(false);

  const jobs = appointments
    .map(appointmentToJob)
    .filter((j) => (type === "all" || j.raw.support_type === type) && (showDone || j.state === "active"));

  const count = (key) =>
    appointments.filter((b) => (key === "all" || b.support_type === key) && (showDone || b.status !== "completed")).length;

  return (
    <div className="tech-page">
      <div className="tech-page-header">
        <div>
          <h1>Appointments</h1>
          <p>
            Calls customers booked and the admin assigned to you. Remote support opens MeshCentral,
            voice calls show the customer's number, video calls open the meeting link.
          </p>
        </div>
      </div>

      <div className="tj-filters" role="group" aria-label="Call type">
        {TYPES.map((t) => (
          <button key={t.key} className="tj-chip" aria-pressed={type === t.key} onClick={() => setType(t.key)}>
            {t.label}
            <span className="count">{count(t.key)}</span>
          </button>
        ))}
        <button className="tj-chip" aria-pressed={showDone} onClick={() => setShowDone((v) => !v)}>
          Show finished
        </button>
      </div>

      {errors.map((e) => (
        <p key={e} className="dashboard-error">
          {e}
        </p>
      ))}

      <div className="tech-panel">
        {loading ? (
          <p className="dashboard-loading">Loading your appointments…</p>
        ) : (
          <JobTable jobs={jobs} onChanged={reload} emptyText="No appointments here." />
        )}
      </div>
    </div>
  );
}
