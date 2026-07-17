const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  sendNotification,
  getNotifications,
  acceptNotification,
  rejectNotification
} = require("../controllers/notificationController");

router.post("/send", authMiddleware, sendNotification);
router.get("/", authMiddleware, getNotifications);
router.put("/accept/:id", authMiddleware, acceptNotification);
router.put("/reject/:id", authMiddleware, rejectNotification);

module.exports = router;