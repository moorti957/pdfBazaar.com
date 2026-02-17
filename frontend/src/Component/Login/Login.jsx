import React, { useState, useContext } from "react";
import "./Login.css";
import { UserContext } from "../../context/UserContext";
import { FaUser, FaEnvelope, FaPhone, FaHome, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    address: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useContext(UserContext);

  // 🎯 POPUP STATE
  const [popup, setPopup] = useState({
    show: false,
    type: "success", // success | error
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setPopup({
        show: true,
        type: "error",
        message: "Passwords do not match"
      });
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      const apiData = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user._id || data.user.id);

      setUser(data.user);

      setPopup({
        show: true,
        type: "success",
        message: isLogin ? "Login successful!" : "Signup successful!"
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (err) {
      setPopup({
        show: true,
        type: "error",
        message: err.message || "Server error, please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glass">
        <div className="auth-header">
          <h2>Welcome {isLogin ? "Back" : ""}</h2>
          <p>{isLogin ? "Login to continue" : "Create your account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-group_1">
                <FaUser className="input-icon_1" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group_1">
                <FaPhone className="input-icon_1" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength="10"
                />
              </div>

              <div className="input-group_1">
                <FaHome className="input-icon_1" />
                <textarea
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                />
              </div>
            </>
          )}

          <div className="input-group_1">
            <FaEnvelope className="input-icon_1" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group_1">
            <FaLock className="input-icon_1" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {!isLogin && (
            <div className="input-group_1">
              <FaLock className="input-icon_1" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>

      {/* 🎯 POPUP MODAL */}
      {popup.show && (
        <div className="popup-overlay">
          <div className={`popup-box ${popup.type}`}>
            <div className="popup-icon">
              {popup.type === "success" ? "✅" : "❌"}
            </div>
            <h3>{popup.type === "success" ? "Success" : "Error"}</h3>
            <p>{popup.message}</p>
            <button
              className="popup-btn"
              onClick={() => setPopup({ ...popup, show: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
