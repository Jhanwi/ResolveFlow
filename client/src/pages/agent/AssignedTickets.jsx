import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAgentTickets } from "../../services/agentService";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";

const AssignedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const result = await getAgentTickets();
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
          <h1>Assigned Tickets</h1>
          <p>Tickets currently assigned to you.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="empty-card">
          <h3>No assigned tickets</h3>
          <p>You currently don't have any assigned tickets.</p>
        </div>
      ) : (
        <div className="tickets-table">
          <div className="table-header agent-table-header">
            <span>ID</span>
            <span>Subject</span>
            <span>Customer</span>
            <span>Priority</span>
            <span>Status</span>
            <span></span>
          </div>

          {tickets.map((ticket) => (
            <div
              className="table-row agent-table-row"
              key={ticket.id}
            >
              <span>#{ticket.id}</span>

              <span>
                <strong>{ticket.subject}</strong>

                <small>
                  {ticket.category || "General"}
                </small>
              </span>

              <span>
                {ticket.customer_name}
              </span>

              <PriorityBadge
                priority={ticket.priority}
              />

              <StatusBadge
                status={ticket.status}
              />

              <Link
                to={`/agent/tickets/${ticket.id}`}
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

export default AssignedTickets;