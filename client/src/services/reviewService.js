import axios from "axios";
import { getToken } from "./authService";

const API_URL =
  "http://localhost:5000/api/customer";

const getHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`
  };
};

const createReview = async (
  ticketId,
  reviewData
) => {
  const response = await axios.post(
    `${API_URL}/tickets/${ticketId}/review`,
    reviewData,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getTicketReview = async (
  ticketId
) => {
  const response = await axios.get(
    `${API_URL}/tickets/${ticketId}/review`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

export {
  createReview,
  getTicketReview
};