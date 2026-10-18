import AppointmentActions from "./AppointmentActions";
import RepairActions from "./RepairActions";
import TicketActions from "./TicketActions";
import "./technician.css";

const KIND_LABELS = { appointment: "Appointment", repair: "Repair", ticket: "Ticket" };

export default function JobTable({ jobs, onChanged, emptyText = "Nothing here yet." }) {
  if (!jobs.length) return <p className="dashboard-empty">{emptyText}</p>;

  return (
    <table className="tj-table">
      <thead>
        <tr>
          <th>Job</th>
          <th>Customer</th>
          <th>When</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.key} className={`tj-row tj-row--${job.state}`}>
            <td>
              <span className={`tj-kind tj-kind--${job.kind}`}>{KIND_LABELS[job.kind]}</span>
              <div className="cell-primary">{job.title}</div>
              <div className="cell-sub">
                {job.reference}
                {job.subtitle ? ` · ${job.subtitle}` : ""}
              </div>
            </td>
            <td>{job.customer || "—"}</td>
            <td>{job.when}</td>
            <td>
              <span className={`tj-status tj-status--${job.state}`}>{job.statusLabel}</span>
            </td>
            <td>
              {job.kind === "appointment" && <AppointmentActions booking={job.raw} onChanged={onChanged} />}
              {job.kind === "repair" && <RepairActions repair={job.raw} onChanged={onChanged} />}
              {job.kind === "ticket" && <TicketActions ticket={job.raw} onChanged={onChanged} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
