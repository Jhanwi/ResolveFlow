import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:5000/api/agent";

const getHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`
  };
};

const getAgentTickets = async () => {
  const response = await axios.get(
    `${API_URL}/tickets`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getAgentTicketDetails = async (id) => {
  const response = await axios.get(
    `${API_URL}/tickets/${id}`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const replyToTicket = async (id, messageData) => {
  const response = await axios.post(
    `${API_URL}/tickets/${id}/reply`,
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

const addInternalNote = async (id, message) => {
  const response = await axios.post(
    `${API_URL}/tickets/${id}/note`,
    {
      message
    },
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const updateTicketStatus = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/tickets/${id}/status`,
    {
      status
    },
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const updateTicketPriority = async (id, priority) => {
  const response = await axios.patch(
    `${API_URL}/tickets/${id}/priority`,
    {
      priority
    },
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const escalateTicket = async (id) => {
  const response = await axios.post(
    `${API_URL}/tickets/${id}/escalate`,
    {},
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

export {
  getAgentTickets,
  getAgentTicketDetails,
  replyToTicket,
  addInternalNote,
  updateTicketStatus,
  updateTicketPriority,
  escalateTicket
};