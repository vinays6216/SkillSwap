const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  videoUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Development", "Design", "Music", "Languages", "Business", "Cooking"]
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Video", videoSchema);
