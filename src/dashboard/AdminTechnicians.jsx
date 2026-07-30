import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminTechnicians.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const AdminTechnicians = () => {
  const navigate = useNavigate();

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        `${API_BASE_URL}/api/users/technicians`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTechnicians(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load technicians.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const deleteTechnician = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this technician?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTechnicians((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Unable to delete technician.");
    }
  };

  return (
    <div className="admin-page">

      <div className="page-header">
        <div>
          <h2>Technicians</h2>
          <p>Manage all registered technicians.</p>
        </div>

        <button
          className="add-btn"
          onClick={() => navigate("/admin/users/new")}
        >
          <FaPlus />
          Add Technician
        </button>
      </div>

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Date Joined</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : technicians.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No technicians found.
                </td>
              </tr>
            ) : (
              technicians.map((tech) => (
                <tr key={tech.id}>
                  <td>
                    {tech.first_name} {tech.last_name}
                  </td>

                  <td>{tech.email}</td>

                  <td>{tech.phone}</td>

                  <td>
                    <span className="role-badge">
                      {tech.role}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      tech.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>

                    <button
                      className="edit-btn"
                      onClick={() =>
                        navigate(
                          `/admin/technicians/edit/${tech.id}`
                        )
                      }
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteTechnician(tech.id)
                      }
                    >
                      <FaTrash />
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

export default AdminTechnicians;