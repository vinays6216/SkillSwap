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
    default: "https://i.pravatar.cc/150"
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

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "User",
  userSchema
);