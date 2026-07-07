const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getAllCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  getUserProgress,
  getSingleCourseProgress,
  updateCourseProgress,
  rateCourse
} = require("../controllers/courseController");

// Get all courses (supports optional ?category= filter)
router.get("/", authMiddleware, getAllCourses);

// Get current user's enrolled course list and visual progress percentages
router.get("/progress/my", authMiddleware, getUserProgress);

// Get specific course progress details
router.get("/:id/progress", authMiddleware, getSingleCourseProgress);

// Update lesson progress within a course
router.put("/:id/progress", authMiddleware, updateCourseProgress);

// Enroll in a specific course
router.post("/:id/enroll", authMiddleware, enrollInCourse);

// Post a review rating for a specific course
router.post("/:id/rate", authMiddleware, rateCourse);

// Retrieve details for a single course
router.get("/:id", authMiddleware, getCourseById);

// Create a new course class syllabus
router.post("/", authMiddleware, createCourse);

module.exports = router;
