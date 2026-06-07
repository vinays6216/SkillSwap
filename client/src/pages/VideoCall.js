import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/VideoCall.css";

function VideoCall() {
  const [inCall, setInCall] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [callTime, setCallTime] = useState(0);

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
          /* Lobby / Prep State */
          <div className="lobby-container-card">
            <div className="lobby-header">
              <h2>SkillSwap Virtual Classroom 🎥</h2>
              <p>Prepare your camera and microphone before starting your exchange session.</p>
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
              <button onClick={() => setInCall(true)} className="btn-join-call glow-effect">
                Join Classroom Room
              </button>
            </div>
          </div>
        ) : (
          /* Active Call State */
          <div className="classroom-main">
            {/* Header info */}
            <div className="classroom-status-bar">
              <div className="status-left">
                <span className="live-dot"></span>
                <span>Active Session: <strong>Elena Rostova (UI/UX)</strong></span>
              </div>
              <div className="status-right">
                <span>Duration: <strong>{formatTime(callTime)}</strong></span>
              </div>
            </div>

            {/* Video Streams Container */}
            <div className="classroom-grids">
              {/* Remote feed */}
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

              {/* Local feed */}
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

            {/* Controls Bar Panel */}
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
                onClick={() => alert("Screen sharing is mocked for this preview.")}
                title="Share Screen"
              >
                🖥
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