// TechnicianJobs.jsx — Assigned jobs: everything assigned to this
// technician in one place — booked calls (appointments), mail-in repairs
// and any other tickets.

import { useMemo, useState } from "react";
import JobTable from "../components/technician/JobTable";
import useTechnicianJobs from "../components/technician/useTechnicianJobs";
import "./TechnicianShared.css";

const KINDS = [
  { key: "all", label: "All" },
  { key: "appointment", label: "Appointments" },
  { key: "repair", label: "Repairs" },
  { key: "ticket", label: "Other tickets" },
];

const STATES = [
  { key: "active", label: "To do" },
  { key: "done", label: "Done" },
  { key: "all", label: "Everything" },
];

export default function TechnicianJobs() {
  const { jobs, loading, errors, reload } = useTechnicianJobs();
  const [kind, setKind] = useState("all");
  const [state, setState] = useState("active");

  const counts = useMemo(() => {
    const c = { all: 0, appointment: 0, repair: 0, ticket: 0 };
    jobs.forEach((j) => {
      if (state === "all" || j.state === state || (state === "done" && j.state === "closed")) {
        c.all += 1;
        c[j.kind] += 1;
      }
    });
    return c;
  }, [jobs, state]);

  const visible = jobs.filter(
    (j) =>
      (kind === "all" || j.kind === kind) &&
      (state === "all" || j.state === state || (state === "done" && j.state === "closed")),
  );

  return (
    <div className="tech-page">
      <div className="tech-page-header">
        <div>
          <h1>Assigned jobs</h1>
          <p>Everything assigned to you: booked calls, mail-in repairs and other tickets.</p>
        </div>
      </div>

      <div className="tj-filters" role="group" aria-label="Show">
        {STATES.map((s) => (
          <button key={s.key} className="tj-chip" aria-pressed={state === s.key} onClick={() => setState(s.key)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="tj-filters" role="group" aria-label="Job type">
        {KINDS.map((k) => (
          <button key={k.key} className="tj-chip" aria-pressed={kind === k.key} onClick={() => setKind(k.key)}>
            {k.label}
            <span className="count">{counts[k.key]}</span>
          </button>
        ))}
      </div>

      {errors.map((e) => (
        <p key={e} className="dashboard-error">
          {e}
        </p>
      ))}

      <div className="tech-panel">
        {loading ? (
          <p className="dashboard-loading">Loading your jobs…</p>
        ) : (
          <JobTable jobs={visible} onChanged={reload} emptyText="No jobs here — you're all caught up." />
        )}
      </div>
    </div>
  );
}
