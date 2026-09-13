import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getSlaBreaches } from "../../services/adminService";

const SlaBreaches = () => {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBreaches();
  }, []);

  const loadBreaches = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSlaBreaches();
      setBreaches(data.breaches);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load SLA breaches"
      );
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

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Loading SLA breaches...
        </div>
      ) : breaches.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={32} />

          <h3>No SLA breaches found</h3>

          <p>
            Tickets that exceed their resolution SLA will
            appear here.
          </p>
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