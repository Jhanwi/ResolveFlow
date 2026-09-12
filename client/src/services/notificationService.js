import axios from "axios";
import { getToken } from "./authService";

const API_URL =
  "http://localhost:5000/api/notifications";

const getHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`
  };
};

const getNotifications = async () => {
  const response = await axios.get(
    API_URL,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getUnreadCount = async () => {
  const response = await axios.get(
    `${API_URL}/unread-count`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const markAsRead = async (id) => {
  const response = await axios.patch(
    `${API_URL}/${id}/read`,
    {},
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const markAllAsRead = async () => {
  const response = await axios.patch(
    `${API_URL}/read-all`,
    {},
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};