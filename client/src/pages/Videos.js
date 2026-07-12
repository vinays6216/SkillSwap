import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Videos.css";

function Videos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form fields state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Development");
  const [selectedFile, setSelectedFile] = useState(null);
  const [enrolledCategories, setEnrolledCategories] = useState([]);

  const fileInputRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetchVideos();
    fetchEnrolledCategories();
  }, []);

  const fetchEnrolledCategories = async () => {
    try {
      const response = await API.get("/courses/progress/my");
      const categories = response.data
        .map((p) => p.course?.category)
        .filter(Boolean);
      setEnrolledCategories(categories);
    } catch (error) {
      console.error("Error fetching enrolled categories:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await API.get("/videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const isVideoUnlocked = (vid) => {
    const uploaderId = vid.uploader?._id || vid.uploader;
    return uploaderId === currentUserId || enrolledCategories.includes(vid.category);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMessage("");
    if (!file.type.startsWith("video/")) {
      setErrorMessage("Please select a valid video file (e.g. mp4, webm, quicktime).");
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setErrorMessage("Video file exceeds the 50MB limit. Please upload a smaller video.");
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFile) {
      setErrorMessage("Please select a video file to upload.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please enter a video title.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("video", selectedFile);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await API.post("/videos", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      alert(response.data.message || "Video uploaded successfully!");
      
      // Reset form states
      setTitle("");
      setDescription("");
      setCategory("Development");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setShowUploadForm(false);
      
      // Refresh video list
      fetchVideos();
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to upload video.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getProfileImage = (uploader) => {
    if (uploader && uploader.profileImage) {
      return uploader.profileImage.startsWith("http")
        ? uploader.profileImage
        : `http://localhost:5000${uploader.profileImage}`;
    }
    return null;
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <DashboardLayout pageTitle="Video Hub">
      <div className="videos-page-wrapper fade-in">
        {/* Banner Section */}
        <div className="videos-promo-banner">
          <div className="promo-text">
            <h2>Share Tutorials & Showcases 📺</h2>
            <p>Upload your video demonstrations, check out other users' projects, and swap feedback.</p>
          </div>
          {!showUploadForm && (
            <button className="promo-btn" onClick={() => setShowUploadForm(true)}>
              + Share a Video
            </button>
          )}
        </div>

        {/* Video Upload Form Card */}
        {showUploadForm && (
          <div className="video-upload-card">
            <h3 className="upload-form-title">Upload a Video (50MB Max)</h3>
            
            {errorMessage && (
              <div style={{ color: "var(--danger)", fontSize: "14px", fontWeight: "600" }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="upload-form">
              <div className="form-row-double">
                <div className="form-group">
                  <label>Video Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Setting up a grid system in Figma"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={uploading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Skill Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={uploading}
                    style={{
                      padding: "12px 16px",
                      background: "rgba(0, 0, 0, 0.25)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--border-radius-sm)",
                      color: "var(--text-main)",
                      fontSize: "14.5px"
                    }}
                  >
                    {["Development", "Design", "Music", "Languages", "Business", "Cooking"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description / Learning Outcomes</label>
                <textarea
                  placeholder="Briefly describe what this video covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  disabled={uploading}
                />
              </div>

              {/* Drag & Drop File Selector */}
              <div 
                className={`file-drop-zone ${dragActive ? "active" : ""}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept="video/*"
                  disabled={uploading}
                />
                
                {selectedFile ? (
                  <div className="selected-file-details">
                    <span className="file-info-text">
                      🎬 {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                    {!uploading && (
                      <button 
                        type="button" 
                        className="btn-remove-file" 
                        onClick={handleRemoveFile}
                        title="Remove file"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <span className="drop-icon">📤</span>
                    <p className="drop-text">Drag & drop your video file here, or click to browse</p>
                  </>
                )}
              </div>

              {/* Uploading progress indicator */}
              {uploading && (
                <div className="upload-progress-container">
                  <div className="progress-header">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="upload-actions">
                <button 
                  type="submit" 
                  className="btn-submit-upload" 
                  disabled={uploading || !selectedFile || !title.trim()}
                >
                  {uploading ? "Uploading..." : "Publish Video"}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel-upload" 
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedFile(null);
                    setTitle("");
                    setDescription("");
                    setCategory("Development");
                    setErrorMessage("");
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gallery Section */}
        <div className="gallery-section">
          <h3 className="gallery-section-title">Community Videos ({videos.length})</h3>
          
          {loading ? (
            <div className="videos-loading">
              <div className="spinner"></div>
              <p>Loading community videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="videos-empty-state">
              <span>📺</span>
              <p>No videos uploaded yet. Share yours to get the ball rolling!</p>
              {!showUploadForm && (
                <button className="promo-btn" onClick={() => setShowUploadForm(true)}>
                  Upload First Video
                </button>
              )}
            </div>
          ) : (
            <div className="grouped-categories-videos">
              {["Development", "Design", "Music", "Languages", "Business", "Cooking"].map((cat) => {
                const catVideos = videos.filter((v) => v.category === cat);
                if (catVideos.length === 0) return null;
                return (
                  <div key={cat} className="category-videos-group" style={{ marginBottom: "40px", borderBottom: "1px solid var(--border-color)", paddingBottom: "24px" }}>
                    <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {cat} Videos
                    </h4>
                    <div className="videos-grid-view">
                      {catVideos.map((vid) => {
                        const uploaderName = vid.uploader ? vid.uploader.name : "Anonymous Swapper";
                        const profileImg = getProfileImage(vid.uploader);
                        const isUnlocked = isVideoUnlocked(vid);

                        if (!isUnlocked) {
                          return (
                            <div key={vid._id} className="video-card-widget locked-card" style={{ height: "100%", minHeight: "260px", position: "relative" }}>
                              <div className="video-locked-overlay" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(11, 15, 23, 0.95)", backdropFilter: "blur(8px)", padding: "20px", borderRadius: "var(--border-radius-md)", textAlign: "center" }}>
                                <span className="lock-icon" style={{ fontSize: "32px", marginBottom: "8px" }}>🔒</span>
                                <span className="lock-text" style={{ fontSize: "16px", fontWeight: "700", color: "#fff", textTransform: "uppercase" }}>{vid.category} Tutorial</span>
                                <span className="lock-subtext" style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", marginBottom: "12px" }}>Enroll in a {vid.category} course to unlock this video</span>
                                <button 
                                  className="promo-btn" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/courses?category=${vid.category}`);
                                  }}
                                  style={{ padding: "6px 12px", fontSize: "11px" }}
                                >
                                  Browse {vid.category} Courses to Unlock
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={vid._id} className="video-card-widget">
                            <div className="card-video-player-wrapper">
                              <video 
                                className="card-video-player" 
                                src={`http://localhost:5000${vid.videoUrl}`}
                                controls
                                preload="metadata"
                              />
                            </div>
                            
                            <div className="video-card-details">
                              <h4 className="video-title-text" title={vid.title}>
                                {vid.title}
                              </h4>
                              {vid.description && (
                                <p className="video-description-text" title={vid.description}>
                                  {vid.description}
                                </p>
                              )}
                              
                              <div className="video-card-footer">
                                <div className="uploader-avatar-mini" title={uploaderName}>
                                  {profileImg ? (
                                    <img src={profileImg} alt={uploaderName} className="uploader-img-mini" />
                                  ) : (
                                    getInitials(uploaderName)
                                  )}
                                </div>
                                <div className="uploader-details-meta">
                                  <span className="uploader-name-meta">{uploaderName}</span>
                                  <span className="upload-date-meta">
                                    {new Date(vid.createdAt).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Videos;
