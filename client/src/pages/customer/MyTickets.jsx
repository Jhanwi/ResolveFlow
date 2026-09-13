import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTickets } from "../../services/ticketService";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";

const MyTickets = () => {
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
          "Unable to load tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Tickets</h1>
          <p>
            View and track all your support requests.
          </p>
        </div>

        <Link
          to="/tickets/create"
          className="primary-button"
        >
          Create Ticket
        </Link>
      </div>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Loading tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-card">
          <h3>No tickets found</h3>

          <p>
            You haven't created any support tickets yet.
          </p>

          <Link
            to="/tickets/create"
            className="primary-button"
          >
            Create Ticket
          </Link>
        </div>
      ) : (
        <div className="tickets-table">
          <div className="table-header">
            <span>ID</span>
            <span>Subject</span>
            <span>Priority</span>
            <span>Status</span>
            <span></span>
          </div>

          {tickets.map((ticket) => (
            <div
              className="table-row"
              key={ticket.id}
            >
              <span>#{ticket.id}</span>

              <span>
                <strong>
                  {ticket.subject}
                </strong>

                <small>
                  {ticket.category || "General"}
                </small>
              </span>

              <PriorityBadge
                priority={ticket.priority}
              />

              <StatusBadge
                status={ticket.status}
              />

              <Link
                to={`/tickets/${ticket.id}`}
                className="view-link"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;