import { useState } from "react";
import axios from "axios";
import "./AddUsers.css"; 

const AddUsers = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "https://fixer-backend-7mng.onrender.com/api/users/create",
        formData
      );

      setMessage(res.data.message || "User created successfully!");

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
      });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to create user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
  <div className="add-user-card">
    <div className="add-user-header">
      <h2>Add User</h2>
    </div>

        <div className="add-user-body">
          {message && (
            <div className="alert alert-info">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-row">
              <div className=" form-group">
                <label>First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className=" form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                className="form-select"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="technician">Technician</option>
                <option value="user">User</option>
              </select>
            </div>

            <button
                type="submit"
                className="submit-btn"
                disabled={loading}
                >
                {loading ? "Creating..." : "Create User"}
                </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUsers;