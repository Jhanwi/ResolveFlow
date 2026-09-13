import axios from "axios";
import { getToken } from "./authService";

const API_URL =
  "http://localhost:5000/api/admin";

const getHeaders = () => {
  return {
    Authorization: `Bearer ${getToken()}`
  };
};

const getDashboard = async () => {
  const response = await axios.get(
    `${API_URL}/dashboard`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getAllTickets = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.append(
      "search",
      filters.search
    );
  }

  if (filters.status) {
    params.append(
      "status",
      filters.status
    );
  }

  if (filters.priority) {
    params.append(
      "priority",
      filters.priority
    );
  }

  if (filters.agentId) {
    params.append(
      "agentId",
      filters.agentId
    );
  }

  const response = await axios.get(
    `${API_URL}/tickets?${params.toString()}`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getAgents = async () => {
  const response = await axios.get(
    `${API_URL}/agents`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getCustomers = async () => {
  const response = await axios.get(
    `${API_URL}/customers`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const assignTicket = async (
  ticketId,
  agentId
) => {
  const response = await axios.patch(
    `${API_URL}/tickets/${ticketId}/assign`,
    {
      agentId
    },
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getSlaBreaches = async () => {
  const response = await axios.get(
    `${API_URL}/sla/breaches`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const getSlaPolicies = async () => {
  const response = await axios.get(
    `${API_URL}/sla`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const createSlaPolicy = async (
  policyData
) => {
  const response = await axios.post(
    `${API_URL}/sla`,
    policyData,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

const updateSlaPolicy = async (
  id,
  policyData
) => {
  const response = await axios.patch(
    `${API_URL}/sla/${id}`,
    policyData,
    {
      headers: getHeaders()
    }
  );

  return response.data;
};

export {
  getDashboard,
  getAllTickets,
  getAgents,
  getCustomers,
  assignTicket,
  getSlaBreaches,
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy
};