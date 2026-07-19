import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminTickets.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const AdminTickets = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadTickets = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${API_BASE_URL}/api/tickets`
      );

      setTickets(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/tickets/${id}`);

      setTickets((prev) =>
        prev.filter((ticket) => ticket.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Unable to delete ticket.");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const keyword = search.toLowerCase();

      return (
        ticket.ticket_code?.toLowerCase().includes(keyword) ||
        ticket.customer_name?.toLowerCase().includes(keyword) ||
        ticket.issue?.toLowerCase().includes(keyword) ||
        ticket.status?.toLowerCase().includes(keyword)
      );
    });
  }, [tickets, search]);

  if (loading) {
    return <div className="admin-loading">Loading tickets...</div>;
  }

  return (
    <div className="admin-tickets">

      <div className="page-header">

        <div>
          <h1>Support Tickets</h1>
          <p>Manage customer support requests.</p>
        </div>

        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="table-wrapper">

        <table>

          <thead>

            <tr>
              <th>Ticket</th>
              <th>Customer</th>
              <th>Device</th>
              <th>Issue</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="8">
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>

                  <td>{ticket.ticket_code}</td>

                  <td>{ticket.customer_name}</td>

                  <td>{ticket.device_name || "-"}</td>

                  <td>{ticket.issue}</td>

                  <td>
                    {ticket.technician_name || "Unassigned"}
                  </td>

                  <td>
                    <span
                      className={`status ${ticket.status
                        .replace(/\s+/g, "")
                        .toLowerCase()}`}
                    >
                      {ticket.status}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      ticket.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>

                    <button
                      className="action-btn view"
                      onClick={() =>
                        navigate(`/admin/tickets/${ticket.id}`)
                      }
                    >
                      <FaEye /> View
                    </button>

                    <button
                      className="action-btn edit"
                      onClick={() =>
                        navigate(`/admin/tickets/edit/${ticket.id}`)
                      }
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      className="action-btn delete"
                      onClick={() =>
                        deleteTicket(ticket.id)
                      }
                    >
                      <FaTrash /> Delete
                    </button>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default AdminTickets;