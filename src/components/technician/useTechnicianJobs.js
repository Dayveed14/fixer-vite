import { useCallback, useEffect, useState } from "react";
import { listMyAppointments, listMyRepairs, listMyTickets } from "../../api/technician.api";
import { buildJobs } from "./jobs";

/**
 * Loads the technician's appointments, repairs and tickets. Each list
 * loads independently, so one failing (e.g. repairs before the
 * migration) doesn't hide the others.
 */
export default function useTechnicianJobs({ appointments = true, repairs = true, tickets = true } = {}) {
  const [data, setData] = useState({ appointments: [], repairs: [], tickets: [] });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const load = useCallback(async () => {
    const wanted = [
      appointments && ["appointments", listMyAppointments, "appointments"],
      repairs && ["repairs", listMyRepairs, "repairs"],
      tickets && ["tickets", listMyTickets, "tickets"],
    ].filter(Boolean);

    const results = await Promise.allSettled(wanted.map(([, fn]) => fn()));
    const next = { appointments: [], repairs: [], tickets: [] };
    const failed = [];
    results.forEach((result, i) => {
      const [key, , label] = wanted[i];
      if (result.status === "fulfilled" && Array.isArray(result.value)) next[key] = result.value;
      else if (result.status === "rejected") failed.push(`Couldn't load ${label}: ${result.reason?.message || "error"}`);
    });
    setData(next);
    setErrors(failed);
    setLoading(false);
  }, [appointments, repairs, tickets]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, jobs: buildJobs(data), loading, errors, reload: load };
}
