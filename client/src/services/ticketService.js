import axios from "axios";
import { getToken } from "./authService";

const API_URL =
  "http://localhost:5000/api/customer";

const getHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`
  };
};

const createTicket = async (ticketData) => {
  const response = await axios.post(
    `${API_URL}/tickets`,
    ticketData,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
};

const getMyTickets = async () => {
  const response = await axios.get(
    `${API_URL}/tickets`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getTicketDetails = async (id) => {
  const response = await axios.get(
    `${API_URL}/tickets/${id}`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const addMessage = async (
  id,
  messageData
) => {
  const response = await axios.post(
    `${API_URL}/tickets/${id}/messages`,
    messageData,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
};

export {
  createTicket,
  getMyTickets,
  getTicketDetails,
  addMessage
};