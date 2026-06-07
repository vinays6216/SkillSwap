const Notification =
require("../models/Notification");

/* Send Notification */

const sendNotification =
async (req, res) => {

  try {

    const {
      sender,
      senderName,
      skill
    } = req.body;

    const notification =
    new Notification({
      sender,
      senderName,
      skill
    });

    await notification.save();

    res.status(201).json({
      message:
      "Notification Sent"
    });

  } catch (error) {

    res.status(500).json({
      message:
      error.message
    });

  }

};

/* Get All Notifications */

const getNotifications =
async (req, res) => {

  try {

    const notifications =
    await Notification.find()
    .sort({
      createdAt: -1
    });

    res.status(200).json(
      notifications
    );

  } catch (error) {

    res.status(500).json({
      message:
      error.message
    });

  }

};

/* Accept */

const acceptNotification =
async (req, res) => {

  try {

    const notification =
    await Notification.findById(
      req.params.id
    );

    notification.status =
    "accepted";

    await notification.save();

    res.status(200).json({
      message:
      "Accepted"
    });

  } catch (error) {

    res.status(500).json({
      message:
      error.message
    });

  }

};

/* Reject */

const rejectNotification =
async (req, res) => {

  try {

    const notification =
    await Notification.findById(
      req.params.id
    );

    notification.status =
    "rejected";

    await notification.save();

    res.status(200).json({
      message:
      "Rejected"
    });

  } catch (error) {

    res.status(500).json({
      message:
      error.message
    });

  }

};

module.exports = {
  sendNotification,
  getNotifications,
  acceptNotification,
  rejectNotification
};