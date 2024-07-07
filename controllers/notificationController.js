const Notification = require("../models/notificationModel");
const User = require("../models/userModel");


let io;

const initializeSocket = (socketIO) => {
  io = socketIO;
};

// const getNotificationsForUser = async (req, res) => {
//   try {
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = parseInt(req.query.skip) || 0;
//     const notifications = await Notification.find({
//       receiver: req.params.userId,
//     })
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .skip(skip);
//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const getNotificationsForUser = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const notifications = await Notification.find({ receiver: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.params.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const markNotificationsAsRead = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const read=await Notification.findByIdAndUpdate(id, { isRead: true },{new:true});
//     res.status(200).json(read);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const createNotification = async (senderId, receiverId, type, message) => {
  try {
    // Create a new notification
    const notification = new Notification({
      sender: senderId,
      receiver: receiverId,
      type,
      message,
    });

    await notification.save();

    if (io) {
      console.log(notification,'sent')
      io.to(receiverId).emit("newNotification", notification);
    }

    await User.findByIdAndUpdate(receiverId, {
      $push: { notifications: notification._id },
    });

    console.log("Notification created successfully");
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

const deleteNotificationForUser = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const userId = req.params.userId;

    // Remove the notification from the user's notifications array
    await User.findByIdAndUpdate(userId, {
      $pull: { notifications: notificationId },
    });

    // Delete the notification
    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = {
  initializeSocket,
  getNotificationsForUser,
  markNotificationsAsRead,
  createNotification,
  deleteNotificationForUser
};
