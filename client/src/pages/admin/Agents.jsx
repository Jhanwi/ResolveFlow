import { useEffect, useState } from "react";
import { getAgents } from "../../services/adminService";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAgents();
      setAgents(data.agents);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load agents"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Support Agents</h1>
          <p>
            View agent workload and resolution performance.
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
          Loading agents...
        </div>
      ) : agents.length === 0 ? (
        <div className="empty-state">
          <h3>No agents found</h3>
          <p>
            Support agents will appear here when they are
            available.
          </p>
        </div>
      ) : (
        <div className="admin-card-grid">
          {agents.map((agent) => (
            <div
              className="admin-info-card"
              key={agent.id}
            >
              <div className="admin-card-header">
                <div>
                  <h3>{agent.name}</h3>
                  <p>{agent.email}</p>
                </div>

                <span className="role-label">
                  Agent
                </span>
              </div>

              <div className="admin-card-stats">
                <div>
                  <span>Assigned</span>
                  <strong>
                    {agent.assigned_tickets}
                  </strong>
                </div>

                <div>
                  <span>Resolved</span>
                  <strong>
                    {agent.resolved_tickets}
                  </strong>
                </div>

                <div>
                  <span>Resolution Rate</span>
                  <strong>
                    {agent.resolution_rate}%
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;