const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  getProfile,
  getAllUsers,
  updateProfile,
  addSkillOffered,
  deleteSkillOffered,
  addSkillWanted,
  deleteSkillWanted
} = require(
  "../controllers/profileController"
);

router.get(
  "/",
  authMiddleware,
  getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  getProfile
);

router.put(
  "/:id",
  authMiddleware,
  updateProfile
);

router.put(
  "/:id/skills-offered",
  authMiddleware,
  addSkillOffered
);

router.delete(
  "/:id/skills-offered",
  authMiddleware,
  deleteSkillOffered
);

router.put(
  "/:id/skills-wanted",
  authMiddleware,
  addSkillWanted
);

router.delete(
  "/:id/skills-wanted",
  authMiddleware,
  deleteSkillWanted
);

module.exports = router;