import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  Users,
  UserRound,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

import {
  getDashboard,
  getAllTickets
} from "../../services/adminService";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, ticketData] =
        await Promise.all([
          getDashboard(),
          getAllTickets()
        ]);

      setStats(dashboardData.stats);

      setRecentTickets(
        ticketData.tickets.slice(0, 5)
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Monitor support activity and SLA performance.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <Ticket size={24} />

          <div>
            <span>Total Tickets</span>
            <strong>
              {stats?.totalTickets || 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <Clock size={24} />

          <div>
            <span>Open Tickets</span>
            <strong>
              {stats?.openTickets || 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <CheckCircle size={24} />

          <div>
            <span>Resolved</span>
            <strong>
              {stats?.resolvedTickets || 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <Users size={24} />

          <div>
            <span>Agents</span>
            <strong>
              {stats?.agents || 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <UserRound size={24} />

          <div>
            <span>Customers</span>
            <strong>
              {stats?.customers || 0}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <AlertTriangle size={24} />

          <div>
            <span>SLA Compliance</span>
            <strong>
              {stats?.slaCompliance || 0}%
            </strong>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="section-header">
          <h2>Recent Tickets</h2>

          <Link
            to="/admin/tickets"
            className="secondary-button"
          >
            View All
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="empty-state">
            <h3>No tickets available</h3>
            <p>
              Recent tickets will appear here when customers
              create support requests.
            </p>
          </div>
        ) : (
          <div className="tickets-table">
            <div className="table-header">
              <span>ID</span>
              <span>Subject</span>
              <span>Customer</span>
              <span>Priority</span>
              <span>Status</span>
            </div>

            {recentTickets.map((ticket) => (
              <div
                className="table-row"
                key={ticket.id}
              >
                <span>#{ticket.id}</span>

                <span>{ticket.subject}</span>

                <span>
                  {ticket.customer_name}
                </span>

                <span>
                  <span
                    className={`badge priority-${ticket.priority}`}
                  >
                    {ticket.priority}
                  </span>
                </span>

                <span>
                  <span
                    className={`badge status-${ticket.status}`}
                  >
                    {ticket.status.replaceAll("_", " ")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;