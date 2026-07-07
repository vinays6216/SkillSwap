const User = require("../models/User");

/* Get User Profile */
const getProfile = async (req, res) => {
  try {

    const user = await User.findById(
      req.params.id
    )
      .select("-password")
      .populate("connections", "name bio profileImage averageTeacherRating");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/* Update User Profile */
const updateProfile = async (req, res) => {
  try {

    const {
      name,
      bio
    } = req.body;
    const file = req.file;

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;

    if (file) {
      user.profileImage = `/uploads/${file.filename}`;
    }

    await user.save();

    res.status(200).json({
      message: "Profile Updated",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/* Add Skill Offered */
const addSkillOffered = async (
  req,
  res
) => {
  try {

    const { skill } = req.body;

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.skillsOffered.push(skill);

    await user.save();

    res.status(200).json({
      message: "Skill Added",
      skillsOffered:
        user.skillsOffered
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/* Delete Skill Offered */
const deleteSkillOffered = async (
  req,
  res
) => {
  try {

    const { skill } = req.body;

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.skillsOffered =
      user.skillsOffered.filter(
        (item) => item !== skill
      );

    await user.save();

    res.status(200).json({
      message: "Skill Removed",
      skillsOffered:
        user.skillsOffered
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/* Add Skill Wanted */
const addSkillWanted = async (
  req,
  res
) => {
  try {

    const { skill } = req.body;

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.skillsWanted.push(skill);

    await user.save();

    res.status(200).json({
      message: "Skill Added",
      skillsWanted:
        user.skillsWanted
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

/* Delete Skill Wanted */
const deleteSkillWanted = async (
  req,
  res
) => {
  try {

    const { skill } = req.body;

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.skillsWanted =
      user.skillsWanted.filter(
        (item) => item !== skill
      );

    await user.save();

    res.status(200).json({
      message: "Skill Removed",
      skillsWanted:
        user.skillsWanted
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
const getAllUsers = async (req, res) => {

  try {

    const users = await User.find()
      .select("-password");

    res.status(200).json(users);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
const rateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const reviewerId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please provide a rating between 1 and 5" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "User not found" });
    }

    if (teacherId === reviewerId) {
      return res.status(400).json({ message: "You cannot rate your own teaching profile" });
    }

    const existingIndex = teacher.reviews.findIndex(r => r.reviewer.toString() === reviewerId);

    if (existingIndex > -1) {
      teacher.reviews[existingIndex].rating = rating;
      teacher.reviews[existingIndex].comment = comment || "";
      teacher.reviews[existingIndex].createdAt = Date.now();
    } else {
      teacher.reviews.push({
        reviewer: reviewerId,
        rating,
        comment: comment || ""
      });
    }

    const totalReviews = teacher.reviews.length;
    if (totalReviews > 0) {
      const sum = teacher.reviews.reduce((acc, curr) => acc + curr.rating, 0);
      teacher.averageTeacherRating = parseFloat((sum / totalReviews).toFixed(1));
    } else {
      teacher.averageTeacherRating = 0;
    }

    await teacher.save();
    res.status(200).json({ message: "Teacher rated successfully", teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  getAllUsers,
  updateProfile,
  addSkillOffered,
  deleteSkillOffered,
  addSkillWanted,
  deleteSkillWanted,
  rateTeacher
};