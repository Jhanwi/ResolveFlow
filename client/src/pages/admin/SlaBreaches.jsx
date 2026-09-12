import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getSlaBreaches } from "../../services/adminService";

const SlaBreaches = () => {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBreaches();
  }, []);

  const loadBreaches = async () => {
    try {
      const data = await getSlaBreaches();
      setBreaches(data.breaches);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>SLA Breaches</h1>
          <p>
            Tickets that have exceeded their resolution SLA.
          </p>
        </div>
      </div>

      {loading ? (
        <p>Loading SLA breaches...</p>
      ) : breaches.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={32} />
          <p>No SLA breaches found.</p>
        </div>
      ) : (
        <div className="tickets-table">
          <div className="table-header">
            <span>ID</span>
            <span>Subject</span>
            <span>Customer</span>
            <span>Agent</span>
            <span>Priority</span>
            <span>Status</span>
          </div>

          {breaches.map((ticket) => (
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
                {ticket.agent_name || "Unassigned"}
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
  );
};

export default SlaBreaches;