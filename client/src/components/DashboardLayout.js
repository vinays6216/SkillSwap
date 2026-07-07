import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/DashboardLayout.css";

function DashboardLayout({ children, pageTitle = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "User";

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Browse Courses", path: "/courses", icon: "🎓" },
    { name: "Profile", path: "/profile", icon: "👤" },
    { name: "Skills Exchange", path: "/skills", icon: "📚" },
    { name: "Chat Rooms", path: "/chat", icon: "💬" },
    { name: "Video Call", path: "/video-call", icon: "🎥" },
    { name: "Notifications", path: "/notifications", icon: "🔔" }
  ];

  if (!token) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="layout-container fade-in">
      {/* Sidebar Panel */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand" onClick={() => navigate("/dashboard")}>
          <span className="brand-logo">🚀</span>
          <h2>SkillSwap</h2>
        </div>

        <div className="sidebar-profile">
          <div className="profile-badge-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-badge-info">
            <h4>{userName}</h4>
            <p>Pro Swapper</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li
                  key={item.path}
                  className={isActive ? "active" : ""}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-name">{item.name}</span>
                  {isActive && <span className="active-indicator"></span>}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn-sidebar">
            <span className="logout-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="layout-main">
        {/* Top Header Navbar */}
        <header className="layout-header">
          <div className="header-left">
            <h1>{pageTitle}</h1>
            <p className="header-date">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="header-right">
            <div className="header-notification-pill" onClick={() => navigate("/notifications")}>
              🔔
              <span className="notification-dot"></span>
            </div>
            <div className="header-user-avatar" onClick={() => navigate("/profile")}>
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
