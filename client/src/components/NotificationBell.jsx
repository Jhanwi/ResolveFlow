import { useEffect, useState } from "react";
import {
  Bell,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getNotifications,
  getUnreadCount,
  markAsRead
} from "../services/notificationService";

const NotificationBell = () => {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();

      setUnreadCount(data.count);
    } catch (error) {
      console.error(error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();

      setNotifications(
        data.notifications.slice(0, 5)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = () => {
    const nextState = !open;

    setOpen(nextState);

    if (nextState) {
      loadNotifications();
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

      setUnreadCount((count) =>
        count > 0 ? count - 1 : 0
      );
    } catch (error) {
      console.error(error);
    }
  };

  const getTicketPath = (ticketId) => {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (user?.role === "customer") {
      return `/tickets/${ticketId}`;
    }

    return `/agent/tickets/${ticketId}`;
  };

  return (
    <div className="notification-wrapper">
      <button
        className="notification-button"
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <strong>Notifications</strong>

            <span>
              {unreadCount} unread
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              No notifications
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      notification.is_read
                        ? "read"
                        : "unread"
                    }`}
                  >
                    {notification.ticket_id ? (
                      <Link
                        to={getTicketPath(
                          notification.ticket_id
                        )}
                        className="notification-link"
                        onClick={() => {
                          if (!notification.is_read) {
                            handleRead(
                              notification.id
                            );
                          }

                          setOpen(false);
                        }}
                      >
                        <p>
                          {notification.message}
                        </p>

                        <small>
                          {new Date(
                            notification.created_at
                          ).toLocaleString()}
                        </small>
                      </Link>
                    ) : (
                      <div>
                        <p>
                          {notification.message}
                        </p>

                        <small>
                          {new Date(
                            notification.created_at
                          ).toLocaleString()}
                        </small>
                      </div>
                    )}

                    {!notification.is_read && (
                      <button
                        onClick={() =>
                          handleRead(
                            notification.id
                          )
                        }
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          <Link
            to="/notifications"
            className="notification-view-all"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;