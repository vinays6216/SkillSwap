const Message = require("../models/Message");

/* Fetch Chat History with a Peer User */
const getMessages = async (req, res) => {
  try {
    const peerId = req.params.peerId;
    const userId = req.user.id; // From authMiddleware

    // Find all messages between sender and recipient in either direction
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: peerId },
        { sender: peerId, recipient: userId }
      ]
    }).sort({ createdAt: 1 }); // Sort ascending by time

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Send and Persist Message */
const sendMessage = async (req, res) => {
  try {
    const { recipient, text } = req.body;
    const sender = req.user.id;

    if (!recipient || !text) {
      return res.status(400).json({ message: "Recipient and message text are required" });
    }

    const message = new Message({
      sender,
      recipient,
      text
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage
};
