import "./css/Login.css";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import logo from "./img/logo.png";

import {
  FaGoogle,
  FaMicrosoft,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";

const Login = () => {
const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);

const [loading, setLoading] = useState(false);

const [loginData, setLoginData] = useState({
  email: "",
  password: "",
});

const handleChange = (e) => {
  setLoginData({
    ...loginData,
    [e.target.name]: e.target.value,
  });
};

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const response = await axios.post(
      "http://localhost:4000/api/users/login",
      loginData
    );

    const user = response.data;

    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "admin") {
      navigate("../admindashboard");
    } else if (user.role === "technician") {
      navigate("../techniciandashboard");
    } else {
      navigate("../dashboard");
    }
  } catch (err) {
    alert(
      err.response?.data?.message || "Login Failed"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-page">
      {/* Left Section */}
      <div className="login-left">
        <div className="overlay">
          <Link to="/" className="back-home">
            <FaArrowLeft /> Back Home
          </Link>

          <div className="brand">
            <img src={logo} alt="Fixer Logo" className="logo" />
            <p>
              Your trusted online computer support platform. Get remote
              assistance, schedule repairs, and connect with certified
              technicians anytime.
            </p>

            <div className="features">
              <div className="feature-card">
                <span>🛠</span>
                <h4>Remote Support</h4>
                <p>Instant assistance from verified technicians.</p>
              </div>

              <div className="feature-card">
                <span>📦</span>
                <h4>Mail-in Repairs</h4>
                <p>Track your repair process from start to finish.</p>
              </div>

              <div className="feature-card">
                <span>🤖</span>
                <h4>Smart Diagnosis</h4>
                <p>Identify common computer issues in minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="login-right">
        <div className="login-container">
          <h2>Welcome Back 👋</h2>
          <p>Login to continue to your dashboard.</p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={loginData.email}
                onChange={handleChange}
                required/>
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="password-input">
                <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleChange}
                required/>

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" />
                Remember Me
              </label>

              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button
    type="submit"
    className="login-btn"
    disabled={loading}
>
    {loading ? "Signing In..." : "Login"}
</button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button className="google-btn">
              <FaGoogle />
              Continue with Google
            </button>

            <button className="microsoft-btn">
              <FaMicrosoft />
              Continue with Microsoft
            </button>
          </div>

          <div className="signup-link">
            Don't have an account?
            <Link to="/register"> Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;