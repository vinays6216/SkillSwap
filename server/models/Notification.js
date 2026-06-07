const mongoose = require("mongoose");

const notificationSchema =
new mongoose.Schema({

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  senderName: {
    type: String,
    required: true
  },

  skill: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports =
mongoose.model(
  "Notification",
  notificationSchema
);