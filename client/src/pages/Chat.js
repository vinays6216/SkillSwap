import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Chat.css";

function Chat() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Video attachment states
  const [myVideos, setMyVideos] = useState([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedVideoAttachment, setSelectedVideoAttachment] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchContacts();
    fetchMyVideos();

    // Initialize Socket.io Connection
    socketRef.current = io("http://localhost:5000");

    // Join user's personal private room
    socketRef.current.emit("join_room", currentUserId);

    // Listen for incoming messages
    socketRef.current.on("receive_message", (msg) => {
      // If the message belongs to the active conversation, append it
      setMessages((prev) => {
        const isFromActiveUser = msg.sender === activeChatUser?._id || msg.recipient === activeChatUser?._id;
        if (isFromActiveUser) {
          // Check if message already exists to avoid duplicates
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        }
        return prev;
      });

      // Update contacts last message preview
      fetchContacts();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatUser]);

  useEffect(() => {
    // Scroll to bottom whenever messages list changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const response = await API.get("/profile");
      // Filter out self
      const list = response.data.filter(u => u._id !== currentUserId);
      setContacts(list);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVideos = async () => {
    try {
      const response = await API.get("/videos");
      const list = response.data.filter(v => {
        const uploaderId = v.uploader?._id || v.uploader;
        return uploaderId === currentUserId;
      });
      setMyVideos(list);
    } catch (error) {
      console.error("Error fetching my videos:", error);
    }
  };

  const handleSelectContact = async (contact) => {
    setActiveChatUser(contact);
    setMessages([]);
    try {
      const response = await API.get(`/chat/history/${contact._id}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!inputMsg.trim() && !selectedVideoAttachment) || !activeChatUser) return;

    const messageData = {
      sender: currentUserId,
      recipient: activeChatUser._id,
      text: inputMsg,
      video: selectedVideoAttachment ? selectedVideoAttachment._id : null
    };

    // Emit via WebSocket (Server handles saving to DB and broadcasting to both sender & receiver rooms)
    socketRef.current.emit("send_message", messageData);
    
    setInputMsg("");
    setSelectedVideoAttachment(null);
  };

  const getAvatar = (item) => {
    if (item.profileImage && item.profileImage.startsWith("http")) {
      return item.profileImage;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`;
  };

  return (
    <DashboardLayout pageTitle="Chat Rooms">
      <div className="chat-container-card fade-in">
        {/* Left Side: Contacts List */}
        <div className="chat-sidebar-users">
          <div className="sidebar-search">
            <input type="text" placeholder="🔍 Search contacts..." />
          </div>

          {loading ? (
            <div className="contacts-loading-indicator">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="chat-users-list">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`chat-user-item ${activeChatUser?._id === contact._id ? "active" : ""}`}
                  onClick={() => handleSelectContact(contact)}
                >
                  <div className="chat-user-avatar-wrapper">
                    <img src={getAvatar(contact)} alt={contact.name} className="chat-contact-avatar-img" />
                    <span className="status-dot online"></span>
                  </div>
                  <div className="chat-user-meta">
                    <div className="chat-user-row">
                      <h4>{contact.name}</h4>
                      <span className="chat-rating-badge-inline">⭐ {contact.averageTeacherRating || "0"}</span>
                    </div>
                    <p className="chat-preview-text">
                      {contact.bio || "Click to open chat conversation."}
                    </p>
                  </div>
                </div>
              ))}
              
              {contacts.length === 0 && (
                <p className="no-contacts-msg">No other swappers registered yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Message Thread */}
        <div className="chat-thread-panel">
          {activeChatUser ? (
            <>
              {/* Thread Header */}
              <div className="thread-header">
                <div className="thread-header-avatar-container">
                  <img src={getAvatar(activeChatUser)} alt={activeChatUser.name} className="thread-header-avatar-img" />
                </div>
                <div className="thread-header-info">
                  <h4>{activeChatUser.name}</h4>
                  <p className="thread-match-info">
                    Teaches: <span>{activeChatUser.skillsOffered?.join(", ") || "General"}</span>
                  </p>
                </div>
                <div className="thread-header-actions">
                  <button className="btn-call-mock" onClick={() => navigate("/video-call")}>📞 Call</button>
                  <button className="btn-call-mock video" onClick={() => navigate("/video-call")}>🎥 Video Classroom</button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="thread-messages-body">
                {messages.map((msg, index) => {
                  const isMe = msg.sender === currentUserId;
                  const hasVideo = msg.video;
                  return (
                    <div key={msg._id || index} className={`message-bubble-wrapper ${isMe ? "me" : "them"}`}>
                      <div className="message-bubble">
                        {hasVideo && (
                          <div className="chat-bubble-video-wrapper" style={{ marginBottom: "8px", maxWidth: "260px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#000" }}>
                            <video 
                              src={`http://localhost:5000${msg.video.videoUrl}`} 
                              controls 
                              style={{ width: "100%", display: "block" }} 
                              preload="metadata"
                            />
                            <div style={{ padding: "6px 10px", fontSize: "12px", background: "rgba(0,0,0,0.6)", color: "#fff", borderTop: "1px solid rgba(255,255,255,0.05)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={msg.video.title}>
                              🎬 {msg.video.title}
                            </div>
                          </div>
                        )}
                        {msg.text && <p>{msg.text}</p>}
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Messages Input Box */}
              {selectedVideoAttachment && (
                <div className="attached-video-preview" style={{ padding: "8px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
                  <span style={{ color: "#34d399", fontSize: "13px", fontWeight: "600" }}>
                    Attached video: 🎬 {selectedVideoAttachment.title}
                  </span>
                  <button type="button" onClick={() => setSelectedVideoAttachment(null)} style={{ background: "transparent", border: "none", color: "var(--danger)", fontSize: "16px", cursor: "pointer" }}>
                    ×
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="thread-input-form">
                <div style={{ position: "relative" }}>
                  <button 
                    type="button" 
                    className="btn-attach-mock" 
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    style={{ background: showAttachmentMenu ? "rgba(99, 102, 241, 0.15)" : "transparent" }}
                  >
                    📎
                  </button>
                  
                  {showAttachmentMenu && (
                    <div className="chat-video-attachment-menu" style={{ position: "absolute", bottom: "45px", left: "0", background: "var(--bg-dark-accent)", border: "1px solid var(--border-color)", borderRadius: "8px", width: "250px", maxHeight: "200px", overflowY: "auto", zIndex: "50", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                      <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color)", fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Share your video:</div>
                      {myVideos.length > 0 ? (
                        myVideos.map((vid) => (
                          <div 
                            key={vid._id} 
                            onClick={() => {
                              setSelectedVideoAttachment(vid);
                              setShowAttachmentMenu(false);
                            }}
                            style={{ padding: "8px 12px", fontSize: "13px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.02)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                            onMouseEnter={(e) => e.target.style.background = "rgba(99, 102, 241, 0.1)"}
                            onMouseLeave={(e) => e.target.style.background = "transparent"}
                            title={vid.title}
                          >
                            🎬 {vid.title}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)" }}>No videos uploaded yet. Upload in Video Hub first!</div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={selectedVideoAttachment ? `Add text description (optional)...` : `Send message to ${activeChatUser.name}...`}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  required={!selectedVideoAttachment}
                />
                <button type="submit" className="btn-send-message-action glow-effect">
                  Send ✉
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty-thread">
              <span>💬</span>
              <p>Select a contact from the list to load history and start chat swapping.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Chat;