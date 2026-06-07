import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Notifications.css";

function Notifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await API.get("/notifications");
      setRequests(response.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (id) => {
    try {
      await API.put(`/notifications/accept/${id}`);
      fetchNotifications();
    } catch (error) {
      console.log(error);
      alert("Failed to accept request.");
    }
  };

  const rejectRequest = async (id) => {
    try {
      await API.put(`/notifications/reject/${id}`);
      fetchNotifications();
    } catch (error) {
      console.log(error);
      alert("Failed to reject request.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "accepted": return "status-accepted";
      case "rejected": return "status-rejected";
      default: return "status-pending";
    }
  };

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="notifications-page-wrapper fade-in">
        <div className="notifications-intro">
          <h2>Exchange Invitations 🔔</h2>
          <p>Review requests from users who want to learn from you or teach you something in exchange.</p>
        </div>

        {loading ? (
          <div className="notifications-loading">
            <div className="spinner"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="notifications-list">
            {requests.map((request) => (
              <div
                className={`notification-card ${getStatusClass(request.status)}`}
                key={request._id}
              >
                <div className="notification-card-header">
                  <span className="notification-icon-indicator">✉</span>
                  <div className="notification-card-info">
                    <h3>{request.senderName}</h3>
                    <p className="notification-card-action-text">
                      Requested a skill swap to learn <strong>&quot;{request.skill}&quot;</strong> from you.
                    </p>
                  </div>
                  <span className={`status-pill-badge ${request.status}`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>

                {request.status === "pending" ? (
                  <div className="notification-buttons-panel">
                    <button
                      className="btn-notification-action accept"
                      onClick={() => acceptRequest(request._id)}
                    >
                      ✔ Accept Invitation
                    </button>
                    <button
                      className="btn-notification-action reject"
                      onClick={() => rejectRequest(request._id)}
                    >
                      ✖ Decline
                    </button>
                  </div>
                ) : (
                  <p className="notification-status-notice">
                    {request.status === "accepted" 
                      ? "You accepted this request! Open Chat to connect with them." 
                      : "You declined this swap request."}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="notifications-empty-state">
            <span className="empty-state-icon">🔔</span>
            <p>Your notifications stream is clear. Active swap requests will appear here!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;