const express =
require("express");

const router =
express.Router();

const {
  sendNotification,
  getNotifications,
  acceptNotification,
  rejectNotification
} = require(
"../controllers/notificationController"
);

router.post(
  "/send",
  sendNotification
);

router.get(
  "/",
  getNotifications
);

router.put(
  "/accept/:id",
  acceptNotification
);

router.put(
  "/reject/:id",
  rejectNotification
);

module.exports =
router;