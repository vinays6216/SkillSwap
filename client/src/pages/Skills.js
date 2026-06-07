import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Skills.css";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await API.get(`/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(response.data.skillsOffered || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    setAdding(true);

    try {
      await API.put(
        `/profile/${userId}/skills-offered`,
        { skill: newSkill },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNewSkill("");
      fetchSkills();
    } catch (error) {
      console.log(error);
      alert("Failed to add skill. It might already be in your list.");
    } finally {
      setAdding(false);
    }
  };

  const deleteSkill = async (skill) => {
    if (!window.confirm(`Are you sure you want to remove "${skill}"?`)) return;
    
    try {
      await API.delete(`/profile/${userId}/skills-offered`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { skill }
      });
      fetchSkills();
    } catch (error) {
      console.log(error);
      alert("Failed to delete skill.");
    }
  };

  const sendRequest = async (skill) => {
    try {
      await API.post("/notifications/send", {
        sender: userId,
        senderName: userName,
        skill
      });
      alert(`Demo Exchange Request Sent for "${skill}"! Check Notifications.`);
    } catch (error) {
      console.log(error);
      alert("Failed to send request.");
    }
  };

  return (
    <DashboardLayout pageTitle="Skills Exchange">
      <div className="skills-page-wrapper fade-in">
        {/* Intro Card */}
        <div className="skills-intro-card">
          <div className="intro-text">
            <h2>Manage What You Teach 🎓</h2>
            <p>
              Add skills you are proficient in. Other community members will discover these and send you exchange invitations!
            </p>
          </div>
        </div>

        {/* Add Skill Form */}
        <div className="skill-input-section">
          <h3>Add a New Skill</h3>
          <div className="skill-form-bar">
            <input
              type="text"
              placeholder="e.g. JavaScript, Guitar, French, UI/UX Design..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <button onClick={addSkill} className="btn-add-skill glow-effect" disabled={adding}>
              {adding ? "Adding..." : "+ Add Skill"}
            </button>
          </div>
        </div>

        {/* Skills List Grid */}
        <div className="skills-display-section">
          <h3>Your Currently Shared Skills ({skills.length})</h3>
          
          {loading ? (
            <div className="skills-loading">
              <div className="spinner"></div>
            </div>
          ) : skills.length > 0 ? (
            <div className="skills-custom-grid">
              {skills.map((skill, index) => (
                <div className="skill-custom-card" key={index}>
                  <div className="skill-card-badge">TEACHING</div>
                  <h4>{skill}</h4>
                  <div className="skill-card-actions">
                    <button
                      onClick={() => sendRequest(skill)}
                      className="btn-skill-action-test"
                      title="Send a test request to see how notifications work"
                    >
                      ✉ Test Invite
                    </button>
                    <button
                      onClick={() => deleteSkill(skill)}
                      className="btn-skill-action-delete"
                    >
                      🗑 Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="skills-empty-state">
              <span className="empty-state-icon">💡</span>
              <p>You haven&apos;t listed any skills yet. Start by entering one in the field above!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Skills;