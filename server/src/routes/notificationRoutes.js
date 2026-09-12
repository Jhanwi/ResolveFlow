const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);

router.get(
  "/unread-count",
  getUnreadCount
);

router.patch(
  "/:id/read",
  markAsRead
);

router.patch(
  "/read-all",
  markAllAsRead
);

module.exports = router;