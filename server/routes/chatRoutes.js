const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getMessages,
  sendMessage
} = require("../controllers/chatController");

// Fetch direct message history with a peer
router.get("/history/:peerId", authMiddleware, getMessages);

// Send message to a peer
router.post("/message", authMiddleware, sendMessage);

module.exports = router;
