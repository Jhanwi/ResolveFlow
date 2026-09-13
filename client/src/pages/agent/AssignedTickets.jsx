import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAgentTickets } from "../../services/agentService";

const AssignedTickets = () => {
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

      const data = await getAgentTickets();
      setTickets(data.tickets);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load assigned tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          Loading tickets...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Assigned Tickets</h1>
          <p>
            Tickets currently assigned to you.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="empty-state">
          <h3>No tickets assigned</h3>
          <p>
            Tickets assigned to you will appear here.
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
            <span>Action</span>
          </div>

          {tickets.map((ticket) => (
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

              <span>
                <Link
                  to={`/agent/tickets/${ticket.id}`}
                  className="secondary-button"
                >
                  Open
                </Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedTickets;