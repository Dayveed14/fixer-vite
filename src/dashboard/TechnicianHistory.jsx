// TechnicianHistory.jsx
// History — completed jobs, for reference (amount charged, customer rating/comment).

import { useEffect, useState } from "react";
import axios from "axios";
import "./TechnicianShared.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";

const TechnicianHistory = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setError("You need to be logged in to view your history.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/tickets`, {
          params: { technician_id: user.id },
        });

        if (!cancelled) {
          setTickets(res.data.filter((t) => t.status === "Completed"));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load your history. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="tech-page">
        <p className="dashboard-loading">Loading your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tech-page">
        <p className="dashboard-error">{error}</p>
      </div>
    );
  }

  const totalEarned = tickets.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="tech-page">

      <div className="tech-page-header">
        <div>
          <h1>History</h1>
          <p>Completed jobs — {tickets.length} total, ${totalEarned.toFixed(2)} earned.</p>
        </div>
      </div>

      <div className="tech-panel">

        {tickets.length === 0 ? (
          <p className="dashboard-empty">No completed jobs yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Device / Issue</th>
                <th>Completed</th>
                <th>Amount</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((job) => (
                <tr key={job.id}>
                  <td className="cell-primary">{job.ticket_code}</td>
                  <td>{job.customer_name}</td>
                  <td>
                    {job.device || "—"}
                    {job.issue && <div className="cell-sub">{job.issue}</div>}
                  </td>
                  <td>{new Date(job.updated_at).toLocaleDateString()}</td>
                  <td>{job.amount ? `$${Number(job.amount).toFixed(2)}` : "—"}</td>
                  <td>
                    {job.existing_rating ? (
                      <span className="rating-stars">{"★".repeat(job.existing_rating)}{"☆".repeat(5 - job.existing_rating)}</span>
                    ) : (
                      "Not rated"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
};

export default TechnicianHistory;
