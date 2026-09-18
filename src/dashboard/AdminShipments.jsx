import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AdminArticles.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://fixer-backend-7mng.onrender.com";
const API = `${API_BASE_URL}/api/shipments`;

// Slugs match the stages shown on the customer-facing tracking timeline
// (Shipment.jsx). status is a free-form VARCHAR on the backend, so this is
// just the vocabulary we've agreed to use consistently.
const STATUS_OPTIONS = [
  { value: "pickup_scheduled", label: "Pickup Scheduled" },
  { value: "courier_assigned", label: "Courier Assigned" },
  { value: "device_collected", label: "Device Collected" },
  { value: "diagnosis", label: "Diagnosis" },
  { value: "waiting_approval", label: "Waiting for Approval" },
  { value: "repair", label: "Repair" },
  { value: "quality_check", label: "Quality Check" },
  { value: "ready_for_delivery", label: "Ready for Delivery" },
  { value: "delivered", label: "Delivered" },
];

export default function AdminShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(API);

      setShipments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      shipments.filter(
        (s) =>
          (status === "all" || s.status === status) &&
          (
            (s.reference || "").toLowerCase().includes(search.toLowerCase()) ||
            (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
            (s.device || "").toLowerCase().includes(search.toLowerCase())
          )
      ),
    [shipments, search, status]
  );

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);

      await axios.patch(`${API}/${id}/status`, { status: newStatus });

      setShipments((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error(err);
      alert("Unable to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-articles">
      <div className="admin-articles-header">
        <div>
          <h1>Shipments</h1>
          <p>Device pickup requests and their tracking status.</p>
        </div>
      </div>

      <div className="admin-articles-filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference, name, email, device"
          className="form-control"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="form-select"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Pickup</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((s) => (
                <Fragment key={s.id}>
                  <tr>
                    <td><span className="article-title">{s.reference}</span></td>

                    <td>
                      {s.name}
                      <br />
                      <small>{s.email}</small>
                    </td>

                    <td>
                      {s.brand} {s.device}
                    </td>

                    <td>
                      {s.pickup_date
                        ? new Date(s.pickup_date).toLocaleDateString()
                        : ""}
                      <br />
                      <small>{s.pickup_time}</small>
                    </td>

                    <td>₦{Number(s.fee_amount).toLocaleString()}</td>

                    <td>
                      <select
                        value={s.status}
                        onChange={(e) => updateStatus(s.id, e.target.value)}
                        disabled={updatingId === s.id}
                        className="form-select"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>{new Date(s.created_at).toLocaleDateString()}</td>

                    <td>
                      <div className="article-actions">
                        <button
                          className="article-view"
                          onClick={() =>
                            setExpandedId(expandedId === s.id ? null : s.id)
                          }
                        >
                          {expandedId === s.id ? "Hide" : "View"}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === s.id && (
                    <tr>
                      <td colSpan={8}>
                        <div style={{ padding: "12px 16px" }}>
                          <p>
                            <strong>Phone:</strong> {s.phone}
                          </p>
                          <p>
                            <strong>Fault:</strong> {s.fault}
                          </p>
                          <p>
                            <strong>Address:</strong> {s.address}, {s.city}
                          </p>
                          {s.notes && (
                            <p>
                              <strong>Notes:</strong> {s.notes}
                            </p>
                          )}
                          <p>
                            <strong>Payment Reference:</strong>{" "}
                            {s.payment_reference}
                          </p>
                          <p>
                            <strong>Payment Status:</strong> {s.payment_status}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <p style={{ padding: 16 }}>No shipments found.</p>}
        </div>
      )}
    </div>
  );
}
