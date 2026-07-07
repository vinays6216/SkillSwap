const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

const {
  getProfile,
  getAllUsers,
  updateProfile,
  addSkillOffered,
  deleteSkillOffered,
  addSkillWanted,
  deleteSkillWanted,
  rateTeacher
} = require(
  "../controllers/profileController"
);

// Get all profiles
router.get(
  "/",
  authMiddleware,
  getAllUsers
);

// Get specific profile
router.get(
  "/:id",
  authMiddleware,
  getProfile
);

// Update profile details
router.put(
  "/:id",
  authMiddleware,
  upload.single("profileImage"),
  updateProfile
);

// Add teaching skill
router.put(
  "/:id/skills-offered",
  authMiddleware,
  addSkillOffered
);

// Remove teaching skill
router.delete(
  "/:id/skills-offered",
  authMiddleware,
  deleteSkillOffered
);

// Add learning interest
router.put(
  "/:id/skills-wanted",
  authMiddleware,
  addSkillWanted
);

// Remove learning interest
router.delete(
  "/:id/skills-wanted",
  authMiddleware,
  deleteSkillWanted
);

// Rate/review a teacher
router.post(
  "/:id/rate-teacher",
  authMiddleware,
  rateTeacher
);

module.exports = router;