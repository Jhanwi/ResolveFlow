import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import { getAllTickets } from "../../services/adminService";

const Analytics = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllTickets();
      setTickets(data.tickets);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  const priorityData = [
    {
      name: "Critical",
      value: tickets.filter(
        (ticket) => ticket.priority === "critical"
      ).length
    },
    {
      name: "High",
      value: tickets.filter(
        (ticket) => ticket.priority === "high"
      ).length
    },
    {
      name: "Medium",
      value: tickets.filter(
        (ticket) => ticket.priority === "medium"
      ).length
    },
    {
      name: "Low",
      value: tickets.filter(
        (ticket) => ticket.priority === "low"
      ).length
    }
  ];

  const statusData = [
    {
      name: "Open",
      value: tickets.filter(
        (ticket) => ticket.status === "open"
      ).length
    },
    {
      name: "Assigned",
      value: tickets.filter(
        (ticket) => ticket.status === "assigned"
      ).length
    },
    {
      name: "In Progress",
      value: tickets.filter(
        (ticket) => ticket.status === "in_progress"
      ).length
    },
    {
      name: "Waiting",
      value: tickets.filter(
        (ticket) =>
          ticket.status === "waiting_for_customer"
      ).length
    },
    {
      name: "Resolved",
      value: tickets.filter(
        (ticket) => ticket.status === "resolved"
      ).length
    }
  ];

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>
            Overview of ticket priority and status.
          </p>
        </div>
      </div>

      {error ? (
        <div className="form-message error">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <h3>No ticket data available</h3>
          <p>
            Analytics will appear here after support tickets
            are created.
          </p>
        </div>
      ) : (
        <div className="analytics-grid">
          <div className="chart-card">
            <h2>Tickets by Priority</h2>

            <PieChart width={420} height={320}>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              />

              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="chart-card">
            <h2>Tickets by Status</h2>

            <BarChart
              width={500}
              height={320}
              data={statusData}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar dataKey="value" />
            </BarChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;