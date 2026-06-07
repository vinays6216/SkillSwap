import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await API.post("/auth/login", formData);
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userName", response.data.name);

      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setErrorMsg(
        error.response?.data?.message || "Login Failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <Link to="/" className="back-home-link">
        ← Back to Home
      </Link>
      
      <div className="login-box">
        <div className="login-header">
          <span className="login-brand-icon">🚀</span>
          <h2>Welcome Back</h2>
          <p>Login to continue swapping skills with your matches.</p>
        </div>

        {errorMsg && <div className="error-alert">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn glow-effect" disabled={loading}>
            {loading ? "Logging in..." : "Login to Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account yet?
          <Link to="/register"> Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;