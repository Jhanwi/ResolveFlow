import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAgentTickets } from "../../services/agentService";

const AssignedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await getAgentTickets();
      setTickets(data.tickets);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading tickets...</p>
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

      {tickets.length === 0 ? (
        <div className="empty-state">
          No tickets are currently assigned to you.
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