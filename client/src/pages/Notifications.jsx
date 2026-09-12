import { useEffect, useState } from "react";
import {
  Check,
  Bell
} from "lucide-react";

import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../services/notificationService";

const Notifications = () => {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();

      setNotifications(
        data.notifications
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await markAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true
              }
            : notification
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            Stay updated with your support activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="secondary-button"
            onClick={handleReadAll}
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={32} />

          <p>
            You don't have any notifications yet.
          </p>
        </div>
      ) : (
        <div className="notifications-page-list">
          {notifications.map(
            (notification) => (
              <div
                key={notification.id}
                className={`notification-page-item ${
                  notification.is_read
                    ? "read"
                    : "unread"
                }`}
              >
                <div className="notification-icon">
                  <Bell size={20} />
                </div>

                <div className="notification-content">
                  <p>
                    {notification.message}
                  </p>

                  <small>
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </small>
                </div>

                {!notification.is_read && (
                  <button
                    className="secondary-button"
                    onClick={() =>
                      handleRead(
                        notification.id
                      )
                    }
                  >
                    <Check size={16} />
                    Mark read
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;