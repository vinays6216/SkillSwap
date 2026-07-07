import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/VideoCall.css";

function VideoCall() {
  const [inCall, setInCall] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [callTime, setCallTime] = useState(0);

  const socketRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");
  const currentUserName = localStorage.getItem("userName") || "User";

  useEffect(() => {
    // Connect to Socket.io signaling server
    socketRef.current = io("http://localhost:5000");

    // Join room
    socketRef.current.emit("join_room", currentUserId);

    // Listen for incoming calls signaling
    socketRef.current.on("call_incoming", (data) => {
      console.log("☎ Incoming call from:", data.name);
      // Automatically answer call in prototype
      socketRef.current.emit("answer_call", { to: data.from, signal: "proto-answer-data" });
      setInCall(true);
    });

    socketRef.current.on("call_accepted", (signal) => {
      console.log("✅ Call accepted with WebRTC signaling payload:", signal);
      setInCall(true);
    });

    socketRef.current.on("ice_candidate_received", (candidate) => {
      console.log("❄ Relaying WebRTC ICE Candidate:", candidate);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval = null;
    if (inCall) {
      interval = setInterval(() => {
        setCallTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setCallTime(0);
    }
    return () => clearInterval(interval);
  }, [inCall]);

  const handleStartCall = () => {
    console.log("📞 Initiating call signaling to peer...");
    // Mock calling another tutor/swapper
    socketRef.current.emit("call_user", {
      userToCall: "mock-peer-id", 
      signalData: "proto-offer-data",
      from: currentUserId,
      name: currentUserName
    });
    setInCall(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setInCall(false);
    alert("Call session ended.");
  };

  return (
    <DashboardLayout pageTitle="Video Call">
      <div className="video-page-wrapper fade-in">
        {!inCall ? (
          /* Lobby Prep State */
          <div className="lobby-container-card">
            <div className="lobby-header">
              <h2>SkillSwap Virtual Classroom 🎥</h2>
              <p>Prepare your camera and microphone before starting your peer-to-peer lesson.</p>
            </div>
            
            <div className="lobby-preview-box">
              {camOff ? (
                <div className="lobby-avatar-place">📷 Camera is turned off</div>
              ) : (
                <div className="lobby-video-mock">
                  <span className="mock-user-emoji">👨‍💻</span>
                  <p>Local Video Preview (Active)</p>
                </div>
              )}
              <div className="lobby-preview-controls">
                <button 
                  onClick={() => setMicMuted(!micMuted)} 
                  className={`btn-lobby-toggle ${micMuted ? "disabled" : ""}`}
                >
                  {micMuted ? "🎤 Mic Muted" : "🎤 Mic Active"}
                </button>
                <button 
                  onClick={() => setCamOff(!camOff)} 
                  className={`btn-lobby-toggle ${camOff ? "disabled" : ""}`}
                >
                  {camOff ? "📹 Camera Off" : "📹 Camera On"}
                </button>
              </div>
            </div>

            <div className="lobby-actions">
              <button onClick={handleStartCall} className="btn-join-call glow-effect">
                Join Classroom Room
              </button>
            </div>
          </div>
        ) : (
          /* Active Call State */
          <div className="classroom-main">
            <div className="classroom-status-bar">
              <div className="status-left">
                <span className="live-dot"></span>
                <span>Active Session: <strong>Elena Rostova (UI/UX)</strong></span>
              </div>
              <div className="status-right">
                <span>Duration: <strong>{formatTime(callTime)}</strong></span>
              </div>
            </div>

            <div className="classroom-grids">
              {/* Remote stream */}
              <div className="video-grid-box remote">
                <div className="video-overlay">
                  <span className="partner-avatar-emoji">🎨</span>
                  <h4>Elena Rostova</h4>
                  <span className="status-label">Remote Partner</span>
                </div>
                <div className="video-feed-mock remote-feed">
                  <div className="audio-wave-pulsing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>

              {/* Local stream */}
              <div className="video-grid-box local">
                <div className="video-overlay">
                  <h4>You (React Developer)</h4>
                  <span className="status-label">Local Feed</span>
                </div>
                {camOff ? (
                  <div className="video-feed-placeholder">
                    <span>🚫</span>
                    <p>Camera Off</p>
                  </div>
                ) : (
                  <div className="video-feed-mock local-feed"></div>
                )}
                {micMuted && <span className="mic-muted-badge">🎤 Muted</span>}
              </div>
            </div>

            <div className="classroom-controls-dock">
              <button 
                onClick={() => setMicMuted(!micMuted)} 
                className={`control-dock-btn ${micMuted ? "active" : ""}`}
                title={micMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {micMuted ? "🔇" : "🎤"}
              </button>
              
              <button 
                onClick={() => setCamOff(!camOff)} 
                className={`control-dock-btn ${camOff ? "active" : ""}`}
                title={camOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {camOff ? "🚫📹" : "📹"}
              </button>

              <button 
                className="control-dock-btn"
                onClick={() => {
                  console.log("❄ Initiating WebRTC ICE Relay Candidate mock");
                  socketRef.current.emit("ice_candidate", { to: "mock-peer-id", candidate: "mock-ice-data" });
                  alert("ICE Candidate Signal Transmitted!");
                }}
                title="Transmit ICE Candidate Signal"
              >
                ❄
              </button>

              <button 
                onClick={handleEndCall} 
                className="control-dock-btn hangup"
                title="End Swap Session"
              >
                🛑
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default VideoCall;