import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLaptop } from "react-icons/fa";
import axios from "axios";
import "./RegisterDevice.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const RegisterDevice = () => {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [form, setForm] = useState({
    device_name: "",
    brand: "",
    os: "",
    serial_number: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setError("You need to be logged in to register a device.");
      return;
    }

    if (!form.device_name.trim()) {
      setError("Device name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/api/devices`, {
        customer_id: user.id,
        device_name: form.device_name.trim(),
        brand: form.brand.trim() || null,
        os: form.os.trim() || null,
        serial_number: form.serial_number.trim() || null,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to register device. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-device">

      <section className="register-device-header">
        <FaLaptop className="register-device-icon" />
        <div>
          <h1>Register Device</h1>
          <p>Add a device so we can track repairs and service history for it.</p>
        </div>
      </section>

      <form className="register-device-form" onSubmit={handleSubmit}>

        <label htmlFor="device_name">Device Name</label>
        <input
          id="device_name"
          name="device_name"
          type="text"
          placeholder="e.g. Dell Latitude 5420"
          value={form.device_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="brand">Brand</label>
        <input
          id="brand"
          name="brand"
          type="text"
          placeholder="e.g. Dell"
          value={form.brand}
          onChange={handleChange}
        />

        <label htmlFor="os">Operating System</label>
        <input
          id="os"
          name="os"
          type="text"
          placeholder="e.g. Windows 11 Pro"
          value={form.os}
          onChange={handleChange}
        />

        <label htmlFor="serial_number">Serial Number</label>
        <input
          id="serial_number"
          name="serial_number"
          type="text"
          placeholder="Optional"
          value={form.serial_number}
          onChange={handleChange}
        />

        {error && <p className="register-device-error">{error}</p>}

        <div className="register-device-actions">
          <button
            type="button"
            className="register-device-cancel"
            onClick={() => navigate("/dashboard")}
            disabled={submitting}
          >
            Cancel
          </button>

          <button type="submit" className="register-device-submit" disabled={submitting}>
            {submitting ? "Registering..." : "Register Device"}
          </button>
        </div>

      </form>

    </div>
  );
};

export default RegisterDevice;
