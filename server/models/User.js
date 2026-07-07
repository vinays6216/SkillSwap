const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ""
  },
  profileImage: {
    type: String,
    default: ""
  },
  skillsOffered: [
    {
      type: String
    }
  ],
  skillsWanted: [
    {
      type: String
    }
  ],
  connections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  reviews: [
    {
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        default: ""
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  averageTeacherRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);