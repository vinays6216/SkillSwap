import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Courses.css";
import "../styles/Videos.css";

function Courses() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [enrolledCategories, setEnrolledCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUserId = localStorage.getItem("userId");

  // Form state for creating a new course
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "Development",
    thumbnail: "",
    lessons: [{ title: "", duration: "5 mins", content: "" }]
  });

  const categories = ["All", "Development", "Design", "Music", "Languages", "Business", "Cooking"];

  // Refs for carousels
  const carouselRefs = useRef({});

  useEffect(() => {
    fetchCourses();
    fetchVideos();
    fetchEnrolledCategories();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryQuery = queryParams.get("category");
    if (categoryQuery && ["Development", "Design", "Music", "Languages", "Business", "Cooking"].includes(categoryQuery)) {
      setActiveCategory(categoryQuery);
    }
  }, [location.search]);

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

  const fetchCourses = async () => {
    try {
      const response = await API.get("/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await API.get("/videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const isVideoUnlocked = (vid) => {
    const uploaderId = vid.uploader?._id || vid.uploader;
    return uploaderId === currentUserId || enrolledCategories.includes(vid.category);
  };

  const handleScroll = (category, direction) => {
    const container = carouselRefs.current[category];
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleAddLessonField = () => {
    setNewCourse({
      ...newCourse,
      lessons: [...newCourse.lessons, { title: "", duration: "5 mins", content: "" }]
    });
  };

  const handleRemoveLessonField = (index) => {
    const updated = newCourse.lessons.filter((_, i) => i !== index);
    setNewCourse({ ...newCourse, lessons: updated });
  };

  const handleLessonChange = (index, field, value) => {
    const updated = newCourse.lessons.map((lesson, i) => {
      if (i === index) {
        return { ...lesson, [field]: value };
      }
      return lesson;
    });
    setNewCourse({ ...newCourse, lessons: updated });
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    if (newCourse.lessons.some(l => !l.title.trim())) {
      alert("Please fill in titles for all lessons.");
      return;
    }

    try {
      await API.post("/courses", newCourse);
      alert("Course created successfully!");
      setIsModalOpen(false);
      // Reset form
      setNewCourse({
        title: "",
        description: "",
        category: "Development",
        thumbnail: "",
        lessons: [{ title: "", duration: "5 mins", content: "" }]
      });
      fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      alert(error.response?.data?.message || "Failed to create course.");
    }
  };

  // Group courses by category
  const filteredCourses = activeCategory === "All" 
    ? courses 
    : courses.filter(c => c.category === activeCategory);

  const getCategorizedCourses = (cat) => {
    return courses.filter(c => c.category === cat);
  };

  return (
    <DashboardLayout pageTitle="Browse Classes">
      <div className="courses-page-wrapper fade-in">
        {/* Banner Section */}
        <div className="courses-promo-banner">
          <div className="promo-text">
            <h2>Learn From Creators Worldwide 🎓</h2>
            <p>Explore structured courses built by swappers, track your progress, and review your teachers.</p>
          </div>
          <button className="promo-btn" onClick={() => setIsModalOpen(true)}>
            + Share Your Skill (Create Class)
          </button>
        </div>

        {/* Categories Tab Selector */}
        <div className="categories-tab-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Showcases */}
        {loading ? (
          <div className="courses-loading">
            <div className="spinner"></div>
            <p>Loading course catalogue...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="courses-empty-state">
            <span>🎓</span>
            <p>No courses published yet. Be the first to share your skills!</p>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Publish a Class</button>
          </div>
        ) : activeCategory !== "All" ? (
          /* Single Category View */
          <div className="single-category-section">
            <h3>{activeCategory} Classes ({filteredCourses.length})</h3>
            {filteredCourses.length > 0 ? (
              <div className="courses-grid-view">
                {filteredCourses.map((course) => (
                  <CourseCard key={course._id} course={course} navigate={navigate} />
                ))}
              </div>
            ) : (
              <p className="no-courses-cat">No classes published under {activeCategory} yet.</p>
            )}

            {/* Video Hub Section for this Category */}
            <div className="category-videos-section" style={{ marginTop: "48px", borderTop: "1px solid var(--border-color)", paddingTop: "32px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px" }}>Community Tutorials & Demos ({videos.filter(v => v.category === activeCategory).length})</h3>
              {videos.filter(v => v.category === activeCategory).length > 0 ? (
                <div className="videos-grid-view">
                  {videos.filter(v => v.category === activeCategory).map((vid) => {
                    const uploaderName = vid.uploader ? vid.uploader.name : "Anonymous Swapper";
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
                          {vid.category && (
                            <span className="video-card-badge">{vid.category}</span>
                          )}
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
              ) : (
                <p className="no-courses-cat" style={{ marginTop: "15px" }}>No skill videos uploaded for {activeCategory} yet.</p>
              )}
            </div>
          </div>
        ) : (
          /* Multi Category Carousel Rows (referencing Skillshare main page) */
          <div className="all-categories-showcase">
            {categories.slice(1).map((cat) => {
              const catCourses = getCategorizedCourses(cat);
              const catVideos = videos.filter(v => v.category === cat);
              if (catCourses.length === 0 && catVideos.length === 0) return null;
              return (
                <div className="category-row-wrapper" key={cat} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "24px", marginBottom: "24px" }}>
                  <div className="category-row-header">
                    <h3>{cat}</h3>
                    {catCourses.length > 0 && (
                      <div className="carousel-control-arrows">
                        <button onClick={() => handleScroll(cat, "left")}>‹</button>
                        <button onClick={() => handleScroll(cat, "right")}>›</button>
                      </div>
                    )}
                  </div>
                  
                  {catCourses.length > 0 ? (
                    <div 
                      className="category-carousel-container"
                      ref={(el) => (carouselRefs.current[cat] = el)}
                    >
                      {catCourses.map((course) => (
                        <CourseCard key={course._id} course={course} navigate={navigate} isCarouselItem={true} />
                      ))}
                    </div>
                  ) : (
                    <p className="no-courses-cat" style={{ padding: "10px 0 20px 0" }}>No classes published under {cat} yet.</p>
                  )}

                  {/* Render category videos if any exist under the All tab row */}
                  {catVideos.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "12px" }}>Community Tutorials & Demos in {cat}:</h4>
                      <div className="videos-grid-view">
                        {catVideos.map((vid) => {
                          const uploaderName = vid.uploader ? vid.uploader.name : "Anonymous Swapper";
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
                                {vid.category && (
                                  <span className="video-card-badge">{vid.category}</span>
                                )}
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
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Publish Course Modal Popup */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-card">
              <div className="modal-header">
                <h3>Share Your Knowledge: Publish a Class</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <form onSubmit={handleCreateCourseSubmit} className="publish-form">
                <div className="form-row-double">
                  <div className="form-group">
                    <label>Class Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Master Figma & Design Systems"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Skill Category</label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Class Description</label>
                  <textarea
                    placeholder="Provide a description detailing what students will learn and do in this class."
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thumbnail Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://images.unsplash.com/... or blank for placeholder"
                    value={newCourse.thumbnail}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                  />
                </div>

                {/* Lesson Builder */}
                <div className="lesson-builder-section">
                  <div className="builder-header">
                    <h4>Class Lessons Syllabus</h4>
                    <button type="button" className="btn-add-lesson-field" onClick={handleAddLessonField}>
                      + Add Lesson / Chapter
                    </button>
                  </div>
                  
                  <div className="lesson-fields-list">
                    {newCourse.lessons.map((lesson, idx) => (
                      <div className="lesson-field-row" key={idx}>
                        <span className="lesson-index-tag">{idx + 1}</span>
                        <div className="lesson-inputs">
                          <input
                            type="text"
                            placeholder="Lesson Title (e.g. Setting up Grid Layouts)"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(idx, "title", e.target.value)}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 5 mins)"
                            value={lesson.duration}
                            onChange={(e) => handleLessonChange(idx, "duration", e.target.value)}
                            style={{ maxWidth: "120px" }}
                          />
                        </div>
                        {newCourse.lessons.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-lesson-row"
                            onClick={() => handleRemoveLessonField(idx)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-actions-footer">
                  <button type="submit" className="btn-submit-course glow-effect">
                    Publish Course
                  </button>
                  <button type="button" className="btn-cancel-modal" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* Inner Course Card Component */
function CourseCard({ course, navigate, isCarouselItem = false }) {
  const getThumbnail = (c) => {
    return c.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
  };

  return (
    <div 
      className={`course-card-widget ${isCarouselItem ? "carousel-item" : ""}`}
      onClick={() => navigate(`/courses/${course._id}`)}
    >
      <div className="card-thumb-wrapper">
        <img src={getThumbnail(course)} alt={course.title} className="card-thumb" />
        <span className="card-badge-category">{course.category}</span>
      </div>
      <div className="card-details-body">
        <h4 className="card-title-text" title={course.title}>{course.title}</h4>
        <p className="card-teacher-text">
          By {course.teacher ? course.teacher.name : "Unknown Swapper"}
        </p>
        <div className="card-rating-row">
          <span className="star-symbol">⭐</span>
          <span className="rating-score">
            {course.averageRating > 0 ? course.averageRating : "No ratings"}
          </span>
          <span className="enroll-count">• {course.enrollmentCount} students</span>
        </div>
        <p className="card-lesson-count">📖 {course.lessons ? course.lessons.length : 0} Lessons</p>
      </div>
    </div>
  );
}

export default Courses;
