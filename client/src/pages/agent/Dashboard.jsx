import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAgentTickets } from "../../services/agentService";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import SlaTimer from "../../components/SlaTimer";

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

      const result = await getAgentTickets();
      setTickets(result.tickets);
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

  const pendingTickets = tickets.filter(
    (ticket) => ticket.status !== "resolved"
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  );

  const criticalTickets = tickets.filter(
    (ticket) =>
      ticket.priority === "critical" &&
      ticket.status !== "resolved"
  );

  const atRiskTickets = tickets.filter((ticket) => {
    if (ticket.status === "resolved") {
      return false;
    }

    return (
      new Date(ticket.resolution_due_at) <
      new Date(Date.now() + 2 * 60 * 60 * 1000)
    );
  });

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
            Here's an overview of your assigned support
            tickets.
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
          <span>Assigned Tickets</span>
          <strong>{tickets.length}</strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>
            {pendingTickets.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Resolved</span>
          <strong>
            {resolvedTickets.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Critical</span>
          <strong>
            {criticalTickets.length}
          </strong>
        </div>
      </div>

      <div className="section-header">
        <h2>SLA At Risk</h2>
      </div>

      {atRiskTickets.length === 0 ? (
        <div className="empty-card">
          <h3>No tickets at risk</h3>
          <p>
            Your current tickets are within their SLA.
          </p>
        </div>
      ) : (
        <div className="ticket-list">
          {atRiskTickets.map((ticket) => (
            <Link
              to={`/agent/tickets/${ticket.id}`}
              className="ticket-card"
              key={ticket.id}
            >
              <div>
                <span className="ticket-id">
                  Ticket #{ticket.id}
                </span>

                <h3>{ticket.subject}</h3>

                <p>
                  Customer: {ticket.customer_name}
                </p>
              </div>

              <div className="ticket-meta">
                <PriorityBadge
                  priority={ticket.priority}
                />

                <StatusBadge
                  status={ticket.status}
                />

                <SlaTimer
                  dueAt={ticket.resolution_due_at}
                  label="Resolution"
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="section-header">
        <h2>My Assigned Tickets</h2>

        <Link to="/agent/tickets">
          View all
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-card">
          <h3>No tickets assigned</h3>
          <p>
            New tickets assigned to you will appear here.
          </p>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.slice(0, 5).map((ticket) => (
            <Link
              to={`/agent/tickets/${ticket.id}`}
              className="ticket-card"
              key={ticket.id}
            >
              <div>
                <span className="ticket-id">
                  Ticket #{ticket.id}
                </span>

                <h3>{ticket.subject}</h3>

                <p>
                  {ticket.customer_name}
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