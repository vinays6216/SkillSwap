import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
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
        await Promise.all([fetchUser(), fetchUsers()]);
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
      const response = await API.get(`/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get("/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.log(error);
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
        <p>Syncing your matches...</p>
      </div>
    );
  }

  // Fallback profile images or placeholders
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
            <p>You have new potential skill-swap matches waiting in your area.</p>
          </div>
          <button className="banner-btn" onClick={() => navigate("/profile")}>
            Complete Profile
          </button>
        </div>

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
            <span className="stat-icon">🎥</span>
            <div className="stat-info">
              <h3>0</h3>
              <p>Lessons Completed</p>
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
              <h4>Teaching Emojis & Skills</h4>
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
                      <p className="user-card-title-sub">Verified Member</p>
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