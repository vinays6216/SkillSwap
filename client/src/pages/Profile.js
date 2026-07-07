import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Profile.css";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Review states (when viewing other users' profiles)
  const [teacherRating, setTeacherRating] = useState(5);
  const [teacherComment, setTeacherComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loggedInUserId = localStorage.getItem("userId");
  const targetUserId = id || loggedInUserId;
  const isOwnProfile = targetUserId === loggedInUserId;

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/profile/${targetUserId}`);
      setUser(response.data);
    } catch (error) {
      console.log("Error loading profile:", error);
      alert("Failed to load profile.");
      navigate("/dashboard");
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const updateProfile = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("bio", user.bio || "");
      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      await API.put(`/profile/${loggedInUserId}`, formData);
      alert("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.log(error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateTeacherSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await API.post(`/profile/${targetUserId}/rate-teacher`, {
        rating: teacherRating,
        comment: teacherComment
      });
      alert(`Successfully rated ${user.name}!`);
      setTeacherComment("");
      fetchProfile();
    } catch (error) {
      console.error("Error rating teacher:", error);
      alert(error.response?.data?.message || "Failed to submit teacher review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout pageTitle="Loading Profile...">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Fetching profile details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const getAvatar = (item) => {
    if (item.profileImage) {
      return item.profileImage.startsWith("http")
        ? item.profileImage
        : `http://localhost:5000${item.profileImage}`;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`;
  };

  return (
    <DashboardLayout pageTitle={isOwnProfile ? "My Profile" : `${user.name}'s Profile`}>
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
                  <label htmlFor="profileImage">Upload Profile Picture</label>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {previewUrl && (
                    <div className="profile-preview-box">
                      <img src={previewUrl} alt="Profile preview" className="profile-preview-image" />
                      <span className="field-hint">Preview selected image before saving.</span>
                    </div>
                  )}
                  <span className="field-hint">Choose a profile image to personalize your account.</span>
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
                <div className="profile-rating-display-row">
                  <span className="profile-badge-tag">Community Tutor</span>
                  <span className="profile-teaching-score-tag">
                    ⭐ {user.averageTeacherRating > 0 ? `${user.averageTeacherRating} Teaching Rating` : "No ratings yet"}
                  </span>
                </div>
                <p className="profile-bio-text">
                  {user.bio || "Provide a biography to describe your learning/teaching goals to other users."}
                </p>
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-edit-profile-action"
                  >
                    ⚙ Edit Account Profile
                  </button>
                ) : (
                  <div className="profile-partner-actions">
                    <button
                      onClick={() => navigate("/chat")}
                      className="btn-edit-profile-action chat-btn"
                    >
                      💬 Open Chat Room
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel for rating teacher (if viewing someone else) */}
        {!isOwnProfile && (
          <div className="profile-submit-review-card">
            <h3>Rate {user.name} as a Teacher</h3>
            <p>Did you complete a video session or swap project with {user.name}? Share your feedback!</p>
            
            <form onSubmit={handleRateTeacherSubmit} className="teacher-review-form">
              <div className="stars-input-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-input-btn ${teacherRating >= star ? "filled" : ""}`}
                    onClick={() => setTeacherRating(star)}
                  >
                    ★
                  </button>
                ))}
                <span className="star-rating-count">({teacherRating} / 5 Rating)</span>
              </div>
              
              <textarea
                placeholder={`Leave a comment describing how ${user.name} helped you learn...`}
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                rows="3"
                required
              />
              
              <button type="submit" className="btn-submit-review glow-effect" disabled={submittingReview}>
                {submittingReview ? "Submitting..." : `Rate ${user.name}`}
              </button>
            </form>
          </div>
        )}

        {/* Connections & Skills Layout */}
        {isOwnProfile && user.connections && user.connections.length > 0 && (
          <div className="profile-connections-card">
            <div className="connections-header-row">
              <div>
                <h3>My Connections</h3>
                <p>People you have connected with on SkillSwap.</p>
              </div>
              <span className="connections-count">{user.connections.length} connections</span>
            </div>
            <div className="connections-list-grid">
              {user.connections.map((connection) => (
                <div key={connection._id} className="connection-item-card">
                  <img
                    src={getAvatar(connection)}
                    alt={connection.name}
                    className="connection-avatar"
                  />
                  <div className="connection-info">
                    <h4>{connection.name}</h4>
                    <span className="connection-meta">
                      ⭐ {connection.averageTeacherRating || "0.0"} rating
                    </span>
                    <p>{connection.bio || "No bio available."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  <p className="no-skills-msg">No teaching skills listed.</p>
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
                  <p className="no-skills-msg">No learning interests listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Reviews Section */}
        <div className="profile-reviews-list-section">
          <h3>Teaching Reviews ({user.reviews ? user.reviews.length : 0})</h3>
          
          {user.reviews && user.reviews.length > 0 ? (
            <div className="profile-reviews-grid">
              {user.reviews.map((rev, idx) => (
                <div className="profile-review-card" key={idx}>
                  <div className="review-card-header">
                    <span className="reviewer-avatar-tag">👤</span>
                    <div className="reviewer-name-meta">
                      <h5>Anonymous Student</h5>
                      <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="reviewer-stars">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                  </div>
                  <p className="reviewer-comment-text">&quot;{rev.comment}&quot;</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews-profile">No student reviews posted yet for this teacher.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;