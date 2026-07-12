import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/WatchCourse.css";

function WatchCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Review states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadCourseAndProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCourseAndProgress = async () => {
    try {
      const courseRes = await API.get(`/courses/${id}`);
      setCourse(courseRes.data);
      
      const progressRes = await API.get(`/courses/${id}/progress`);
      setProgress(progressRes.data.progress);
    } catch (error) {
      console.error("Error loading watch details:", error);
      alert("Please enroll in this course before watching.");
      navigate(`/courses/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonToggle = async (lessonId, currentCompleted) => {
    try {
      const response = await API.put(`/courses/${id}/progress`, {
        lessonId,
        completed: !currentCompleted
      });
      setProgress(response.data.progress);
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      alert("Failed to update lesson checkbox state.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await API.post(`/courses/${id}/rate`, {
        rating,
        review: reviewText
      });
      alert("Thank you for your rating!");
      setReviewText("");
      loadCourseAndProgress();
    } catch (error) {
      console.error("Error submitting course review:", error);
      alert("Failed to save review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !course || !progress) {
    return (
      <DashboardLayout pageTitle="Entering Classroom...">
        <div className="watch-loading">
          <div className="spinner"></div>
          <p>Setting up your workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  const activeLesson = course.lessons && course.lessons[activeLessonIdx];
  const progressPercent = progress.progressPercentage || 0;

  return (
    <DashboardLayout pageTitle="Classroom">
      <div className="watch-course-wrapper fade-in">
        
        {/* Header with Visual Progress Bar */}
        <div className="watch-header-section">
          <div className="header-meta-info">
            <h2>{course.title}</h2>
            <p>Taught by {course.teacher ? course.teacher.name : "Expert Swapper"}</p>
          </div>
          
          <div className="watch-progress-widget">
            <div className="progress-details-text">
              <span>Class Progress:</span>
              <strong>{progressPercent}% Completed</strong>
            </div>
            <div className="watch-progress-track">
              <div className="watch-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Workspace Columns */}
        <div className="watch-workspace-grid">
          
          {/* Left Side: Video & Rating form */}
          <div className="watch-video-column">
            <div className="video-player-viewport" style={{ background: "#000", position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden" }}>
              {activeLesson ? (
                <video
                  key={activeLesson._id || activeLessonIdx}
                  className="lesson-video-player"
                  src={activeLesson.videoUrl ? (activeLesson.videoUrl.startsWith("http") ? activeLesson.videoUrl : `http://localhost:5000${activeLesson.videoUrl}`) : "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4"}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onEnded={() => {
                    const lessonId = activeLesson._id || activeLessonIdx.toString();
                    const isCompleted = progress.completedLessons.includes(lessonId);
                    if (!isCompleted) {
                      handleLessonToggle(lessonId, false);
                    }
                  }}
                  onTimeUpdate={(e) => {
                    const video = e.target;
                    // If video reaches near the end (within 2 seconds of total duration)
                    if (video.duration && video.currentTime >= video.duration - 2) {
                      const lessonId = activeLesson._id || activeLessonIdx.toString();
                      const isCompleted = progress.completedLessons.includes(lessonId);
                      if (!isCompleted) {
                        handleLessonToggle(lessonId, false);
                      }
                    }
                  }}
                />
              ) : (
                <div className="no-lesson-preview">No active lessons selected.</div>
              )}
            </div>

            {/* Lesson details content */}
            {activeLesson && (
              <div className="watch-lesson-description-box">
                <h4>Lesson Summary</h4>
                <p>
                  {activeLesson.content || "In this lesson, we cover practical projects, code samples, and real-time execution steps to master the concept."}
                </p>
              </div>
            )}

            {/* Submit Course Rating Form */}
            <div className="watch-submit-review-card">
              <h4>Rate this Course</h4>
              <p>Your feedback helps the teacher improve and helps other swappers decide if this class is for them.</p>
              
              <form onSubmit={handleReviewSubmit} className="course-rate-form">
                <div className="stars-input-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-input-btn ${rating >= star ? "filled" : ""}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-rating-count">({rating} / 5 stars)</span>
                </div>
                
                <textarea
                  placeholder="Tell us what you liked or disliked about this class..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="3"
                  required
                />
                
                <button type="submit" className="btn-submit-review glow-effect" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Checkbox syllabus */}
          <div className="watch-syllabus-column">
            <div className="syllabus-list-card">
              <h3>Class Chapters</h3>
              <div className="syllabus-lessons-list">
                {course.lessons && course.lessons.map((lesson, idx) => {
                  const isCompleted = progress.completedLessons.includes(lesson._id || idx.toString());
                  return (
                    <div 
                      key={lesson._id || idx} 
                      className={`syllabus-lesson-item ${activeLessonIdx === idx ? "active" : ""}`}
                      onClick={() => setActiveLessonIdx(idx)}
                    >
                      <div className="syllabus-left-row">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={(e) => {
                            e.stopPropagation(); // Avoid switching active lesson on checkbox click
                            handleLessonToggle(lesson._id || idx.toString(), isCompleted);
                          }}
                          className="lesson-checkbox-input"
                        />
                        <div className="syllabus-lesson-title-meta">
                          <span className="lesson-chapter-idx">Chapter {idx + 1}</span>
                          <span className="lesson-title-span">{lesson.title}</span>
                        </div>
                      </div>
                      <span className="syllabus-duration">{lesson.duration || "5 mins"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default WatchCourse;
