const express = require("express");
const notificationController = require("../controllers/notificationController");
const router = express.Router();

const authController = require("../controllers/authController");
router.get(
  "/:userId",
  //authController.auth,
  notificationController.getNotificationsForUser
);
router.put('/read-all/:userId', notificationController.markNotificationsAsRead);
// router.put(
//   "/:userId/mark-as-read/:id",
//  // authController.auth,
//   notificationController.markNotificationsAsRead
// );

router.post("/create", async (req, res) => {
  const { senderId, receiverId, type, message } = req.body;

  try {
    await notificationController.createNotification(
      senderId,
      receiverId,
      type,
      message
    );
    res.status(200).json({ message: "Notification created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating notification", error: err.message });
  }
});

router.delete(
  "/:userId/:notificationId",
  //authController.auth,
  notificationController.deleteNotificationForUser
);
module.exports = router;
