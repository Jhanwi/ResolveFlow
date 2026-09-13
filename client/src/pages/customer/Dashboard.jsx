import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyTickets } from "../../services/ticketService";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";

const Dashboard = () => {
  const { user } = useAuth();

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

      const result = await getMyTickets();
      setTickets(result.tickets);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load your tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  const openTickets = tickets.filter(
    (ticket) => ticket.status !== "resolved"
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  );

  const recentTickets = tickets.slice(0, 5);

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
          <h1>Welcome, {user?.name}</h1>
          <p>
            Here's an overview of your support tickets.
          </p>
        </div>

        <Link
          to="/tickets/create"
          className="primary-button"
        >
          Create New Ticket
        </Link>
      </div>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Tickets</span>
          <strong>{tickets.length}</strong>
        </div>

        <div className="stat-card">
          <span>Open Tickets</span>
          <strong>
            {openTickets.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Resolved</span>
          <strong>
            {resolvedTickets.length}
          </strong>
        </div>
      </div>

      <div className="section-header">
        <h2>Recent Tickets</h2>

        <Link to="/tickets">
          View all
        </Link>
      </div>

      {recentTickets.length === 0 ? (
        <div className="empty-card">
          <h3>No tickets yet</h3>
          <p>
            Create your first support ticket.
          </p>

          <Link
            to="/tickets/create"
            className="primary-button"
          >
            Create Ticket
          </Link>
        </div>
      ) : (
        <div className="ticket-list">
          {recentTickets.map((ticket) => (
            <Link
              to={`/tickets/${ticket.id}`}
              className="ticket-card"
              key={ticket.id}
            >
              <div>
                <span className="ticket-id">
                  Ticket #{ticket.id}
                </span>

                <h3>{ticket.subject}</h3>

                <p>
                  {ticket.category ||
                    "General Support"}
                </p>
              </div>

              <div className="ticket-meta">
                <PriorityBadge
                  priority={ticket.priority}
                />

                <StatusBadge
                  status={ticket.status}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;