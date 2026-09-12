import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTickets } from "../../services/ticketService";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const result = await getMyTickets();
        setTickets(result.tickets);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

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

      {loading ? (
        <p>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="empty-card">
          <h3>No tickets found</h3>
          <p>You haven't created any support tickets yet.</p>
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
                <strong>{ticket.subject}</strong>
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