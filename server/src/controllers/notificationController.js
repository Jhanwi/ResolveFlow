const pool = require("../config/db");

const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        message,
        ticket_id,
        is_read,
        created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      notifications: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch notifications"
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM notifications
       WHERE user_id = $1
       AND is_read = FALSE`,
      [req.user.id]
    );

    res.json({
      count: Number(result.rows[0].count)
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch unread count"
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.json({
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update notification"
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1
       AND is_read = FALSE`,
      [req.user.id]
    );

    res.json({
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update notifications"
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};