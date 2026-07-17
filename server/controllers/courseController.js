const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Notification = require("../models/Notification");
const User = require("../models/User");

/* Get All Courses */
const getAllCourses = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    
    const courses = await Course.find(query)
      .populate("teacher", "name profileImage averageTeacherRating")
      .sort({ createdAt: -1 });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get Course By ID */
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher", "name bio profileImage averageTeacherRating reviews")
      .populate("ratings.user", "name profileImage");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Create Course */
const createCourse = async (req, res) => {
  try {
    const { title, description, category, thumbnail, lessons } = req.body;
    const teacherId = req.user.id; // From authMiddleware

    const course = new Course({
      title,
      description,
      category,
      thumbnail,
      teacher: teacherId,
      lessons: lessons || []
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Enroll In Course */
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const studentUser = await User.findById(userId);
    if (!studentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already enrolled
    let progress = await CourseProgress.findOne({ user: userId, course: courseId });
    
    if (!progress) {
      progress = new CourseProgress({
        user: userId,
        course: courseId,
        completedLessons: [],
        progressPercentage: 0,
        status: "pending-approval"
      });

      await progress.save();

      // Create notification request for the course teacher
      const notification = new Notification({
        sender: userId,
        senderName: studentUser.name,
        recipient: course.teacher,
        course: courseId,
        skill: course.title,
        status: "pending"
      });

      await notification.save();
    }

    res.status(200).json({ message: "Enrollment request created successfully", progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get Active User's Enrolled Course Progress List */
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progressList = await CourseProgress.find({ user: userId, status: { $ne: "pending-approval" } })
      .populate({
        path: "course",
        populate: {
          path: "teacher",
          select: "name profileImage"
        }
      })
      .sort({ lastAccessed: -1 });

    res.status(200).json(progressList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Get Progress for a Single Course */
const getSingleCourseProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const progress = await CourseProgress.findOne({ user: userId, course: courseId });
    if (!progress) {
      return res.status(404).json({ message: "No enrollment found for this course", enrolled: false });
    }

    res.status(200).json({ progress, enrolled: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Update Course Progress (Complete / Uncomplete Lesson) */
const updateCourseProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    const { lessonId, completed } = req.body; // lessonId (string index or ID), completed (boolean)

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let progress = await CourseProgress.findOne({ user: userId, course: courseId });
    if (!progress) {
      return res.status(404).json({ message: "User is not enrolled in this course" });
    }

    if (completed) {
      // Add lesson to completed if not already there
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
    } else {
      // Remove lesson
      progress.completedLessons = progress.completedLessons.filter(id => id !== lessonId);
    }

    // Recalculate percentage
    const totalLessons = course.lessons.length;
    if (totalLessons > 0) {
      progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
    } else {
      progress.progressPercentage = 100;
    }

    progress.status = progress.progressPercentage === 100 ? "completed" : "in-progress";
    progress.lastAccessed = Date.now();

    await progress.save();

    res.status(200).json({ message: "Progress updated", progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Rate / Review Course */
const rateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    const { rating, review } = req.body; // rating (1-5), review text

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please provide a rating between 1 and 5" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user already reviewed
    const existingIndex = course.ratings.findIndex(r => r.user.toString() === userId);
    
    if (existingIndex > -1) {
      // Update existing review
      course.ratings[existingIndex].rating = rating;
      course.ratings[existingIndex].review = review || "";
      course.ratings[existingIndex].createdAt = Date.now();
    } else {
      // Create new review
      course.ratings.push({
        user: userId,
        rating,
        review: review || ""
      });
    }

    // Recalculate average rating
    const totalRatings = course.ratings.length;
    if (totalRatings > 0) {
      const sum = course.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      course.averageRating = parseFloat((sum / totalRatings).toFixed(1));
    } else {
      course.averageRating = 0;
    }

    await course.save();

    res.status(200).json({ message: "Review submitted successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  getUserProgress,
  getSingleCourseProgress,
  updateCourseProgress,
  rateCourse
};
