import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await API.get(`/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = async () => {
    setSubmitting(true);
    try {
      await API.put(
        `/profile/${userId}`,
        {
          name: user.name,
          bio: user.bio,
          profileImage: user.profileImage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update locally stored username if changed
      localStorage.setItem("userName", user.name);
      
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.log(error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout pageTitle="Profile">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Fetching profile details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const getAvatar = (item) => {
    if (item.profileImage && item.profileImage.startsWith("http")) {
      return item.profileImage;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`;
  };

  return (
    <DashboardLayout pageTitle="My Profile">
      <div className="profile-page-wrapper fade-in">
        {/* Profile Card Main */}
        <div className="profile-hero-card">
          <div className="hero-card-cover"></div>
          <div className="hero-card-content">
            <div className="hero-avatar-container">
              <img
                src={getAvatar(user)}
                alt="profile"
                className="hero-profile-image"
              />
            </div>

            {isEditing ? (
              <div className="profile-edit-form">
                <div className="form-input-group">
                  <label htmlFor="name">Display Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="bio">Biography / Tagline</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    value={user.bio || ""}
                    onChange={handleChange}
                    placeholder="Tell other swappers about your experience, what you teach, and what you love learning."
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="profileImage">Profile Image URL</label>
                  <input
                    type="text"
                    id="profileImage"
                    name="profileImage"
                    value={user.profileImage || ""}
                    onChange={handleChange}
                    placeholder="Paste an avatar or image link"
                  />
                </div>

                <div className="form-actions">
                  <button
                    onClick={updateProfile}
                    className="btn-save-profile"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      fetchProfile();
                      setIsEditing(false);
                    }}
                    className="btn-cancel-profile"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-details-display">
                <h2>{user.name}</h2>
                <p className="profile-badge-tag">Community Member</p>
                <p className="profile-bio-text">
                  {user.bio || "Provide a biography to describe your learning/teaching goals to other users."}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-edit-profile-action"
                >
                  ⚙ Edit Account Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Skills Lists Layout */}
        <div className="profile-skills-grid">
          <div className="profile-skills-panel">
            <div className="panel-header teach">
              <span className="panel-icon">🎓</span>
              <h3>Skills I Can Teach</h3>
            </div>
            <div className="panel-body">
              <div className="skills-badge-list">
                {user.skillsOffered && user.skillsOffered.length > 0 ? (
                  user.skillsOffered.map((skill, index) => (
                    <span key={index} className="teach-skill-pill">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="no-skills-msg">You have not listed any teaching skills yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-skills-panel">
            <div className="panel-header learn">
              <span className="panel-icon">📚</span>
              <h3>Skills I Want To Learn</h3>
            </div>
            <div className="panel-body">
              <div className="skills-badge-list">
                {user.skillsWanted && user.skillsWanted.length > 0 ? (
                  user.skillsWanted.map((skill, index) => (
                    <span key={index} className="learn-skill-pill">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="no-skills-msg">You have not listed any learning interests yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;