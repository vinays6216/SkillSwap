const Notification = require("../models/Notification");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

/* Send Notification */
const sendNotification = async (req, res) => {
  try {
    const { sender, senderName, recipient, skill } = req.body;

    const notification = new Notification({
      sender,
      senderName,
      recipient,
      skill
    });

    await notification.save();

    res.status(201).json({
      message: "Notification Sent"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* Get All Notifications */
const getNotifications = async (req, res) => {
  try {
    // Only return notifications intended for the logged-in user
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* Accept */
const acceptNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.status = "accepted";
    await notification.save();

    // If this notification is linked to a course progress enrollment request:
    if (notification.course) {
      const progress = await CourseProgress.findOne({
        user: notification.sender,
        course: notification.course
      });

      if (progress && progress.status === "pending-approval") {
        progress.status = "in-progress";
        await progress.save();

        // Increment enrollment count on the Course
        const course = await Course.findById(notification.course);
        if (course) {
          course.enrollmentCount += 1;
          await course.save();
        }
      }
    }

    res.status(200).json({
      message: "Accepted"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* Reject */
const rejectNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.status = "rejected";
    await notification.save();

    // If this notification is linked to a course progress request:
    if (notification.course) {
      await CourseProgress.deleteOne({
        user: notification.sender,
        course: notification.course
      });
    }

    res.status(200).json({
      message: "Rejected"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  sendNotification,
  getNotifications,
  acceptNotification,
  rejectNotification
};