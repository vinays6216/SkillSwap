const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  completedLessons: [
    {
      type: String // We will store completed lesson IDs or indexes here
    }
  ],
  progressPercentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["pending-approval", "in-progress", "completed"],
    default: "pending-approval"
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only have one progress document per course
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
