import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg("");
    setFieldErrors({
      ...fieldErrors,
      [e.target.name]: ""
    });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = {
      name: "",
      email: "",
      password: ""
    };
    let hasError = false;

    if (!formData.name.trim()) {
      errors.name = "Enter your full name.";
      hasError = true;
    }

    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = "Enter a valid email address.";
      hasError = true;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
      hasError = true;
    }

    setFieldErrors(errors);

    if (hasError) {
      setErrorMsg("Please fix the highlighted fields before continuing.");
    }

    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", formData);
      setSuccessMsg(response.data.message || "Registration successful! Redirecting...");
      
      // Clear fields
      setFormData({ name: "", email: "", password: "" });
      
      // Auto redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.log(error);
      setErrorMsg(
        error.response?.data?.message || "Registration Failed. Please check your info."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container fade-in">
      <Link to="/" className="back-home-link">
        ← Back to Home
      </Link>
      
      <div className="register-box">
        <div className="register-header">
          <span className="register-brand-icon">🚀</span>
          <h2>Create Account</h2>
          <p>Join SkillSwap to share your talents and learn from matches.</p>
        </div>

        {errorMsg && <div className="error-alert">{errorMsg}</div>}
        {successMsg && <div className="success-alert">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>

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
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
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
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="register-btn glow-effect" disabled={loading}>
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?
          <Link to="/login"> Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;