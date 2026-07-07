const connectDB = require("./config/db");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const courseRoutes = require("./routes/courseRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Message = require("./models/Message");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* Consolidated Socket.io Event Handling */
io.on("connection", (socket) => {
  console.log("✅ User Connected to Socket:", socket.id);

  // User joins a private channel matching their MongoDB user ID
  socket.on("join_room", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room ${socket.id}`);
    }
  });

  // Direct Message listener (saves to Mongo, then emits to rooms of sender & receiver)
  socket.on("send_message", async (data) => {
    try {
      const { sender, recipient, text } = data;
      if (!sender || !recipient || !text) return;

      const messageObj = new Message({
        sender,
        recipient,
        text
      });

      await messageObj.save();

      // Emit message payload to the recipient and sender rooms
      io.to(recipient).emit("receive_message", messageObj);
      io.to(sender).emit("receive_message", messageObj);
    } catch (error) {
      console.error("❌ Socket message save error:", error.message);
    }
  });

  // Real-time Notification triggers
  socket.on("send_notification", (data) => {
    if (data.recipient) {
      io.to(data.recipient).emit("receive_notification", data);
    }
  });

  // WebRTC Video Call Signaling Handlers
  socket.on("call_user", (data) => {
    // data: { userToCall, signalData, from, name }
    io.to(data.userToCall).emit("call_incoming", {
      signal: data.signalData,
      from: data.from,
      name: data.name
    });
  });

  socket.on("answer_call", (data) => {
    // data: { to, signal }
    io.to(data.to).emit("call_accepted", data.signal);
  });

  socket.on("ice_candidate", (data) => {
    // data: { to, candidate }
    io.to(data.to).emit("ice_candidate_received", data.candidate);
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected from Socket:", socket.id);
  });
});

/* Middleware */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: false // Disabling to avoid styling blockages in development
}));
app.use(morgan("dev"));

/* API Route Registers */
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/chat", chatRoutes);

/* Test / Staging Route */
app.get("/", (req, res) => {
  res.send("SkillSwap API Running...");
});

/* Server Launch */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});