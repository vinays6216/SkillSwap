const Video = require("../models/Video");

/* Get All Videos */
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("uploader", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Create Video */
const createVideo = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please upload a video file" });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Please provide a video title" });
    }

    const validCategories = ["Development", "Design", "Music", "Languages", "Business", "Cooking"];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ message: "Please provide a valid category" });
    }

    const video = new Video({
      title,
      description: description || "",
      videoUrl: `/uploads/${file.filename}`,
      category,
      uploader: req.user.id
    });

    await video.save();

    // Populate uploader information before sending response
    const populatedVideo = await Video.findById(video._id).populate(
      "uploader",
      "name profileImage"
    );

    res.status(201).json({
      message: "Video uploaded successfully",
      video: populatedVideo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllVideos,
  createVideo
};
