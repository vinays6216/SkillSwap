const User = require("../models/User");

/* Get User Profile */
const getProfile = async (req, res) => {
  try {

    const user = await User.findById(
      req.params.id
    ).select("-password");

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
      bio,
      profileImage
    } = req.body;

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
    user.profileImage =
      profileImage || user.profileImage;

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
module.exports = {
  getProfile,
  getAllUsers,
  updateProfile,
  addSkillOffered,
  deleteSkillOffered,
  addSkillWanted,
  deleteSkillWanted
};