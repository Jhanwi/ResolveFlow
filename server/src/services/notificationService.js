const pool = require("../config/db");

const createNotification = async (
  userId,
  message,
  ticketId = null
) => {
  if (!userId || !message) {
    return;
  }

  await pool.query(
    `INSERT INTO notifications
     (user_id, message, ticket_id)
     VALUES ($1, $2, $3)`,
    [userId, message, ticketId]
  );
};

const createNotifications = async (
  userIds,
  message,
  ticketId = null
) => {
  for (const userId of userIds) {
    await createNotification(
      userId,
      message,
      ticketId
    );
  }
};

module.exports = {
  createNotification,
  createNotifications
};