import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [enrolledProgress, setEnrolledProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    
    const loadData = async () => {
      try {
        await Promise.all([
          fetchUser(),
          fetchUsers(),
          fetchEnrolledCourses()
        ]);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchUser = async () => {
    try {
      const response = await API.get(`/profile/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.log("Error fetching user:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get("/profile");
      setUsers(response.data);
    } catch (error) {
      console.log("Error fetching all users:", error);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await API.get("/courses/progress/my");
      setEnrolledProgress(response.data);
    } catch (error) {
      console.log("Error fetching enrolled progress:", error);
    }
  };

  const handleSendSwapRequest = async (targetUserName, skill) => {
    try {
      const userName = localStorage.getItem("userName") || "Someone";
      await API.post("/notifications/send", {
        sender: userId,
        senderName: userName,
        skill: skill
      });
      alert(`Request sent to ${targetUserName} to learn "${skill}"!`);
    } catch (error) {
      console.error(error);
      alert("Failed to send request. You might have already requested.");
    }
  };

  if (loading || !user) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Syncing your dashboard...</p>
      </div>
    );
  }

  const getAvatar = (item) => {
    if (item.profileImage && item.profileImage.startsWith("http")) {
      return item.profileImage;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`;
  };

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="dashboard-content-wrapper fade-in">
        
        {/* Welcome Section */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>Welcome Back, {user.name}! 👋</h2>
            <p>Ready to teach, learn, and exchange skills today?</p>
          </div>
          <button className="banner-btn" onClick={() => navigate("/courses")}>
            Browse Classes
          </button>
        </div>

        {/* Learning Progress Section (Skillshare-style Course Tracking) */}
        {enrolledProgress.length > 0 && (
          <section className="dashboard-enrolled-courses">
            <div className="dashboard-section-header">
              <h3>My Enrolled Classes</h3>
              <p>Track your chapters and finish tasks to complete your courses.</p>
            </div>
            
            <div className="enrolled-courses-grid">
              {enrolledProgress.map((item) => {
                if (!item.course) return null;
                return (
                  <div 
                    key={item._id} 
                    className="enrolled-track-card"
                    onClick={() => navigate(`/courses/${item.course._id}/watch`)}
                  >
                    <div className="track-thumb-wrapper">
                      <img 
                        src={item.course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60"} 
                        alt={item.course.title} 
                      />
                    </div>
                    <div className="track-details">
                      <h4>{item.course.title}</h4>
                      <p>Teacher: {item.course.teacher ? item.course.teacher.name : "Tutor"}</p>
                      
                      <div className="track-progress-info">
                        <div className="track-progress-bar-container">
                          <div 
                            className="track-progress-bar-fill" 
                            style={{ width: `${item.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="track-progress-text">{item.progressPercentage}% Complete</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <section className="dashboard-stats-grid">
          <div className="stat-widget">
            <span className="stat-icon">📚</span>
            <div className="stat-info">
              <h3>{user.skillsWanted ? user.skillsWanted.length : 0}</h3>
              <p>Skills to Learn</p>
            </div>
          </div>
          <div className="stat-widget">
            <span className="stat-icon">🎓</span>
            <div className="stat-info">
              <h3>{user.skillsOffered ? user.skillsOffered.length : 0}</h3>
              <p>Skills to Teach</p>
            </div>
          </div>
          <div className="stat-widget">
            <span className="stat-icon">🤝</span>
            <div className="stat-info">
              <h3>{user.connections ? user.connections.length : 0}</h3>
              <p>Connections</p>
            </div>
          </div>
          <div className="stat-widget">
            <span className="stat-icon">🎓</span>
            <div className="stat-info">
              <h3>{user.averageTeacherRating || "0.0"}</h3>
              <p>Teaching Score</p>
            </div>
          </div>
        </section>

        {/* User Mini Profile & Skill Summary */}
        <section className="profile-summary-section">
          <div className="summary-left-card">
            <div className="summary-avatar-wrapper">
              <img src={getAvatar(user)} alt="avatar" className="summary-avatar" />
              <span className="online-indicator"></span>
            </div>
            <div className="summary-user-details">
              <h3>{user.name}</h3>
              <p className="summary-bio">&quot;{user.bio || "No biography provided yet."}&quot;</p>
              <button onClick={() => navigate("/profile")} className="btn-edit-summary">
                Update Bio
              </button>
            </div>
          </div>

          <div className="summary-right-card">
            <div className="skills-block">
              <h4>Skills I Can Teach</h4>
              <div className="pill-container">
                {user.skillsOffered && user.skillsOffered.length > 0 ? (
                  user.skillsOffered.map((skill, i) => (
                    <span key={i} className="skill-badge offer">{skill}</span>
                  ))
                ) : (
                  <p className="empty-text">No teaching skills listed. Add some under Skills page!</p>
                )}
              </div>
            </div>

            <div className="skills-block">
              <h4>Learning Interests</h4>
              <div className="pill-container">
                {user.skillsWanted && user.skillsWanted.length > 0 ? (
                  user.skillsWanted.map((skill, i) => (
                    <span key={i} className="skill-badge want">{skill}</span>
                  ))
                ) : (
                  <p className="empty-text">No learning interests listed yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Discover Users Grid */}
        <section className="discover-section">
          <div className="section-title-wrapper">
            <h3>Discover Swap Partners</h3>
            <p>Connect with members offering skills you want or looking for what you teach.</p>
          </div>

          <div className="discover-cards-grid">
            {users
              .filter((item) => item._id !== userId)
              .map((item) => (
                <div className="discover-user-card" key={item._id}>
                  <div className="user-card-header">
                    <img src={getAvatar(item)} alt={item.name} className="user-card-avatar" />
                    <div className="user-card-title">
                      <h4>{item.name}</h4>
                      <p className="user-card-title-sub">
                        ⭐ {item.averageTeacherRating > 0 ? `${item.averageTeacherRating} Score` : "New Teacher"}
                      </p>
                    </div>
                  </div>
                  
                  <p className="user-card-bio">
                    {item.bio ? `${item.bio.substring(0, 100)}${item.bio.length > 100 ? "..." : ""}` : "Sharing skills, learning daily."}
                  </p>

                  <div className="user-card-skills-section">
                    <div className="card-skills-list">
                      <h5>Teaches:</h5>
                      <div className="card-skills-pills">
                        {item.skillsOffered && item.skillsOffered.map((skill, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => handleSendSwapRequest(item.name, skill)}
                            className="exchange-skill-pill"
                            title="Click to request swap"
                          >
                            {skill} ✉
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="card-skills-list">
                      <h5>Wants:</h5>
                      <div className="card-skills-pills">
                        {item.skillsWanted && item.skillsWanted.map((skill, idx) => (
                          <span key={idx} className="card-skill-badge want">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="user-card-footer">
                    <button 
                      onClick={() => navigate("/chat")}
                      className="btn-card-message"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ))}
            
            {users.filter((item) => item._id !== userId).length === 0 && (
              <div className="empty-discover">
                <p>No other members found on the network yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;