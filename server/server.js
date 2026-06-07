const connectDB = require("./config/db");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes =
require(
  "./routes/notificationRoutes"
);
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

io.on("connection", (socket) => {

  console.log("User Connected");

  socket.on("send_message", (data) => {

   io.emit(
    "receive_message",
    data
  );
  });

  socket.on("disconnect", () => {

    console.log("User Disconnected");

  });

});

/* Middleware */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());
app.use(
  "/api/auth",
  authRoutes
);

app.use(helmet());
app.use(morgan("dev"));


/* Test Route */
app.get("/", (req, res) => {
  res.send("SkillSwap API Running...");
});
app.use("/api/profile",profileRoutes);
app.use(
  "/api/notifications",
  notificationRoutes
);
/* Socket.io */
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

/* Server */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});