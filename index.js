const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIO = require("socket.io");

// Import routes and controllers
const userRoutes = require("./routes/userRoutes");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const bookRoutes = require("./routes/bookRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const authorRoutes = require("./routes/authorRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const Notification = require("./models/notificationModel");
const notificationController = require('./controllers/notificationController');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: "http://localhost:5173", methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' }));

notificationController.initializeSocket(io);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  socket.on("join", (userId) => {
    console.log(`User ${socket.id} joining room: ${userId}`);
    socket.join(userId);
  });
  socket.on("leave", (userId) => {
    console.log(`User ${socket.id} leaving room: ${userId}`);
    socket.leave(userId);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.post("/send-notification", async (req, res) => {
  const { userId, message, details } = req.body;
  const notification = new Notification({ user: userId, message, details });
  try {
    await notification.save();
    notificationController.createNotification(null, userId, 'info', message);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to save notification" });
  }
});

mongoose.connect(process.env.CONNECTION_DB)
  .then(() => console.log("Connected to DB 😃"))
  .catch((err) => console.error("Failed to connect to DB", err));

app.use("/users", userRoutes);
app.use("/posts", postRoute);
app.use("/comments", commentRoute);
app.use("/books", bookRoutes);
app.use("/ratings", ratingRoutes);
app.use("/authors", authorRoutes);
app.use("/notifications", notificationRoutes);
app.use("/image", express.static("bookImage"));
app.use("/userImages", express.static("userImages"));
app.use("/postcard", express.static("postImages"));

server.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`));
