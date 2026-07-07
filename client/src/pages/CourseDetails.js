import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/CourseDetails.css";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollmentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await API.get(`/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error("Error fetching course details:", error);
      alert("Failed to load course details.");
      navigate("/courses");
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const response = await API.get(`/courses/${id}/progress`);
      if (response.data && response.data.enrolled) {
        setEnrolled(true);
      }
    } catch (error) {
      // 404 means not enrolled, which is normal
      if (error.response?.status !== 404) {
        console.error("Error checking enrollment:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentAction = async () => {
    setActionLoading(true);
    try {
      await API.post(`/courses/${id}/enroll`);
      setEnrolled(true);
      navigate(`/courses/${id}/watch`);
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Failed to enroll in this course.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !course) {
    return (
      <DashboardLayout pageTitle="Loading Class...">
        <div className="course-details-loading">
          <div className="spinner"></div>
          <p>Fetching syllabus...</p>
        </div>
      </DashboardLayout>
    );
  }

  const getThumbnail = (c) => {
    return c.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
  };

  const getTeacherAvatar = (teacherObj) => {
    if (teacherObj && teacherObj.profileImage && teacherObj.profileImage.startsWith("http")) {
      return teacherObj.profileImage;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${teacherObj ? teacherObj.name : "Teacher"}`;
  };

  return (
    <DashboardLayout pageTitle="Class Syllabus">
      <div className="course-details-wrapper fade-in">
        {/* Header Block */}
        <div className="details-header-card">
          <span className="details-category-badge">{course.category}</span>
          <h2>{course.title}</h2>
          <div className="details-meta-row">
            <span className="teacher-name-label">
              Taught by <strong>{course.teacher ? course.teacher.name : "Unknown"}</strong>
            </span>
            <span className="separator">•</span>
            <span className="details-stars">
              ⭐ {course.averageRating > 0 ? `${course.averageRating} Rating` : "No ratings"}
            </span>
            <span className="separator">•</span>
            <span className="details-students">{course.enrollmentCount} Swappers Enrolled</span>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="details-grid-layout">
          {/* Main Info */}
          <div className="details-main-column">
            <img src={getThumbnail(course)} alt={course.title} className="details-banner-image" />
            
            <div className="details-section">
              <h3>About This Class</h3>
              <p className="details-description-text">{course.description}</p>
            </div>

            {/* Syllabus */}
            <div className="details-section">
              <h3>Syllabus ({course.lessons ? course.lessons.length : 0} Lessons)</h3>
              <div className="details-lessons-list">
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson, idx) => (
                    <div className="details-lesson-row" key={lesson._id || idx}>
                      <span className="details-lesson-idx">{idx + 1}</span>
                      <div className="details-lesson-info">
                        <h4>{lesson.title}</h4>
                        <p>{lesson.duration || "5 mins"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-lessons-notice">No lessons published yet.</p>
                )}
              </div>
            </div>

            {/* Teacher info card */}
            {course.teacher && (
              <div className="details-section teacher-profile-card">
                <h3>Meet Your Teacher</h3>
                <div className="teacher-info-row">
                  <img src={getTeacherAvatar(course.teacher)} alt={course.teacher.name} className="teacher-card-avatar" />
                  <div className="teacher-card-details">
                    <h4>{course.teacher.name}</h4>
                    <p className="teacher-stars-label">⭐ {course.teacher.averageTeacherRating || "0"} Teacher Rating</p>
                    <p className="teacher-bio-snippet">{course.teacher.bio || "SkillSwap expert sharing knowledge."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="details-section">
              <h3>Student Reviews ({course.ratings ? course.ratings.length : 0})</h3>
              <div className="details-reviews-list">
                {course.ratings && course.ratings.length > 0 ? (
                  course.ratings.map((rate, idx) => (
                    <div className="details-review-card" key={idx}>
                      <div className="review-card-header">
                        <div className="reviewer-info">
                          <span className="reviewer-avatar">
                            {rate.user ? rate.user.name.charAt(0).toUpperCase() : "S"}
                          </span>
                          <h4>{rate.user ? rate.user.name : "Swapper"}</h4>
                        </div>
                        <span className="review-rating-stars">{"★".repeat(rate.rating)}{"☆".repeat(5 - rate.rating)}</span>
                      </div>
                      <p className="review-comment-text">{rate.review || "No review text provided."}</p>
                      <span className="review-date-tag">
                        {new Date(rate.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="empty-reviews-notice">No reviews submitted yet for this class.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar widget */}
          <div className="details-sidebar-column">
            <div className="action-sidebar-card">
              <h4>Start Learning Today</h4>
              <p className="sidebar-promo-desc">
                Gain instant access to all {course.lessons ? course.lessons.length : 0} chapters, complete checked tasks, and earn reviews.
              </p>
              
              <div className="sidebar-meta-list">
                <div className="sidebar-meta-item">
                  <span>📖 Lessons:</span>
                  <strong>{course.lessons ? course.lessons.length : 0} Chapters</strong>
                </div>
                <div className="sidebar-meta-item">
                  <span>🎓 Teacher Level:</span>
                  <strong>{course.teacher && course.teacher.averageTeacherRating >= 4 ? "Expert Taught" : "Intermediate"}</strong>
                </div>
                <div className="sidebar-meta-item">
                  <span>💰 Swap Fee:</span>
                  <strong className="free-tag-highlight">FREE Exchange</strong>
                </div>
              </div>

              <button
                className="btn-enroll-action glow-effect"
                onClick={handleEnrollmentAction}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : enrolled ? "Resume Learning (Watch)" : "Enroll In Class"}
              </button>
              
              <button className="btn-sidebar-secondary" onClick={() => navigate("/courses")}>
                Browse Other Classes
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CourseDetails;
