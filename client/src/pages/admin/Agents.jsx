import { useEffect, useState } from "react";
import { getAgents } from "../../services/adminService";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await getAgents();
      setAgents(data.agents);
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
          <h1>Support Agents</h1>
          <p>
            View agent workload and resolution performance.
          </p>
        </div>
      </div>

      {loading ? (
        <p>Loading agents...</p>
      ) : agents.length === 0 ? (
        <div className="empty-state">
          No agents found.
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