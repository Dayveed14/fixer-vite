import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "./img/logo.png";
import {
  FaArrowLeft,
  FaGoogle,
  FaMicrosoft,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./css/Register.css";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
const navigate = useNavigate();

const [loading, setLoading] = useState(false);

const [formData, setFormData] = useState({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleRegister = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    const response = await axios.post(
      "https://fixer-backend-7mng.onrender.com/api/users/register",
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      }
    );

    alert(response.data.message);

    navigate("/login");
  } catch (err) {
    alert(
      err.response?.data?.message ||
        "Registration Failed"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="register-page">
      {/* LEFT PANEL */}
      <div className="register-left">
        <div className="overlay">
          <Link to="/" className="back-home">
            <FaArrowLeft /> Back Home
          </Link>

          <div className="brand">
            <h1>Join <img src={logo} alt="Fixer Logo" className="logo" /></h1>

            <p>
              Create an account to access remote computer support, schedule
              repairs, track your devices, and connect with certified
              technicians from anywhere.
            </p>

            <div className="features">
              <div className="feature-card">
                <span>🔒</span>
                <h4>Secure Account</h4>
                <p>Your data and support history are safely stored.</p>
              </div>

              <div className="feature-card">
                <span>💬</span>
                <h4>24/7 Support</h4>
                <p>Chat with experienced technicians whenever you need help.</p>
              </div>

              <div className="feature-card">
                <span>📈</span>
                <h4>Track Repairs</h4>
                <p>Monitor your repair progress in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="register-right">
        <div className="register-container">
          <h2>Create Account</h2>
          <p>Fill in your details to get started.</p>

          <form className="register-form" onSubmit={handleRegister}>

            <div className="row">
              <div className="input-group">
                <label>First Name</label>
                <input
  type="text"
  name="first_name"
  placeholder="John"
  value={formData.first_name}
  onChange={handleChange}
  required
/>
              </div>

              <div className="input-group">
                <label>Last Name</label>
                <input
  type="text"
  name="last_name"
  placeholder="Doe"
  value={formData.last_name}
  onChange={handleChange}
  required
/>
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
  type="email"
  name="email"
  placeholder="john@example.com"
  value={formData.email}
  onChange={handleChange}
  required
/>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
  type="tel"
  name="phone"
  placeholder="+234..."
  value={formData.phone}
  onChange={handleChange}
/>
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="password-input">
                <input
  type={showPassword ? "text" : "password"}
  name="password"
  placeholder="Create password"
  value={formData.password}
  onChange={handleChange}
  required
/>

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>

              <div className="password-input">
                <input
  type={showConfirm ? "text" : "password"}
  name="confirmPassword"
  placeholder="Confirm password"
  value={formData.confirmPassword}
  onChange={handleChange}
  required
/>

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                >
                  {showConfirm ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            <div className="terms">
              <label>
                <input type="checkbox" /> I agree to the
                <Link to="/terms"> Terms & Conditions </Link>
                and
                <Link to="/privacy"> Privacy Policy</Link>
              </label>
            </div>

           <button
  type="submit"
  className="register-btn"
  disabled={loading}
>
  {loading ? "Creating Account..." : "Create Account"}
</button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-register">
            <button className="google-btn">
              <FaGoogle />
              Continue with Google
            </button>

            <button className="microsoft-btn">
              <FaMicrosoft />
              Continue with Microsoft
            </button>
          </div>

          <div className="login-link">
            Already have an account?
            <Link to="/login"> Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;