import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Chat.css";

function Chat() {
  const [activeChat, setActiveChat] = useState(0);
  const [inputMsg, setInputMsg] = useState("");
  
  const [conversations, setConversations] = useState([
    {
      id: 0,
      name: "Elena Rostova",
      avatar: "🎨",
      status: "Online",
      skillWanted: "React",
      skillOffered: "UI/UX & Figma",
      messages: [
        { sender: "them", text: "Hey! I saw you wanted to learn UI/UX design. I can teach you Figma if you can help me with React!", time: "10:30 AM" },
        { sender: "me", text: "That sounds like a perfect swap! I have been building React apps for 2 years and would love to teach you.", time: "10:32 AM" },
        { sender: "them", text: "Awesome! Let's schedule a video call this week to review the basics. Does Thursday work?", time: "10:35 AM" }
      ]
    },
    {
      id: 1,
      name: "Alex Rivera",
      avatar: "👨‍💻",
      status: "Offline",
      skillWanted: "Spanish",
      skillOffered: "Node.js & Databases",
      messages: [
        { sender: "them", text: "Hi there, I can help you with backend databases if you can practice Spanish conversation with me.", time: "Yesterday" },
        { sender: "me", text: "Hola Alex! I would be glad to help. Let's connect soon.", time: "Yesterday" }
      ]
    },
    {
      id: 2,
      name: "Sophia Martinez",
      avatar: "🎸",
      status: "Online",
      skillWanted: "Photography",
      skillOffered: "Acoustic Guitar",
      messages: [
        { sender: "them", text: "Your photography portfolio looks stunning! Ready to trade guitar chords for shutter speed tips?", time: "3 days ago" }
      ]
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const updatedConvs = conversations.map((conv) => {
      if (conv.id === activeChat) {
        return {
          ...conv,
          messages: [
            ...conv.messages,
            {
              sender: "me",
              text: inputMsg,
              time: new Date().toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit"
              })
            }
          ]
        };
      }
      return conv;
    });

    setConversations(updatedConvs);
    setInputMsg("");

    // Simulate auto reply after a small timeout to make it feel alive!
    setTimeout(() => {
      const botReplies = [
        "That sounds great, let's do it! 🚀",
        "Let me check my calendar and get back to you! 📅",
        "Absolutely, I agree! Looking forward to our session.",
        "Perfect! I will prepare some notes for our session."
      ];
      const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];

      const repliedConvs = updatedConvs.map((conv) => {
        if (conv.id === activeChat) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              {
                sender: "them",
                text: randomReply,
                time: new Date().toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              }
            ]
          };
        }
        return conv;
      });
      setConversations(repliedConvs);
    }, 1500);
  };

  const currentChat = conversations.find((c) => c.id === activeChat);

  return (
    <DashboardLayout pageTitle="Chat Rooms">
      <div className="chat-container-card fade-in">
        {/* Left Side: Users List */}
        <div className="chat-sidebar-users">
          <div className="sidebar-search">
            <input type="text" placeholder="🔍 Search conversations..." />
          </div>

          <div className="chat-users-list">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`chat-user-item ${activeChat === conv.id ? "active" : ""}`}
                onClick={() => setActiveChat(conv.id)}
              >
                <div className="chat-user-avatar-wrapper">
                  <span className="user-avatar-emoji">{conv.avatar}</span>
                  <span className={`status-dot ${conv.status.toLowerCase()}`}></span>
                </div>
                <div className="chat-user-meta">
                  <div className="chat-user-row">
                    <h4>{conv.name}</h4>
                    <span className="chat-time-tag">
                      {conv.messages[conv.messages.length - 1]?.time || ""}
                    </span>
                  </div>
                  <p className="chat-preview-text">
                    {conv.messages[conv.messages.length - 1]?.text || "No messages yet."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Message Thread */}
        <div className="chat-thread-panel">
          {currentChat ? (
            <>
              {/* Thread Header */}
              <div className="thread-header">
                <div className="thread-header-avatar">
                  {currentChat.avatar}
                </div>
                <div className="thread-header-info">
                  <h4>{currentChat.name}</h4>
                  <p className="thread-match-info">
                    Offers: <span>{currentChat.skillOffered}</span> • Wants: <span>{currentChat.skillWanted}</span>
                  </p>
                </div>
                <div className="thread-header-actions">
                  <button className="btn-call-mock">📞 Audio</button>
                  <button className="btn-call-mock video">🎥 Video Call</button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="thread-messages-body">
                {currentChat.messages.map((msg, index) => (
                  <div key={index} className={`message-bubble-wrapper ${msg.sender}`}>
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Messages Input Box */}
              <form onSubmit={handleSendMessage} className="thread-input-form">
                <button type="button" className="btn-attach-mock">📎</button>
                <input
                  type="text"
                  placeholder={`Send message to ${currentChat.name}...`}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                />
                <button type="submit" className="btn-send-message-action glow-effect">
                  Send ✉
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty-thread">
              <span>💬</span>
              <p>Select a swap match to open details and start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Chat;