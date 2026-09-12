import { useEffect, useState } from "react";
import {
  getAllTickets,
  getAgents
} from "../../services/adminService";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [agentId, setAgentId] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketData, agentData] =
        await Promise.all([
          getAllTickets(),
          getAgents()
        ]);

      setTickets(ticketData.tickets);
      setAgents(agentData.agents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const data = await getAllTickets({
        search,
        status,
        priority,
        agentId
      });

      setTickets(data.tickets);
    } catch (error) {
      console.error(error);
    }
  };

  const clearFilters = async () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setAgentId("");

    try {
      const data = await getAllTickets();
      setTickets(data.tickets);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>All Tickets</h1>
          <p>
            Search and monitor all customer support tickets.
          </p>
        </div>
      </div>

      <div className="search-card">
        <input
          type="text"
          placeholder="Search subject, customer name or email"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">
            In Progress
          </option>
          <option value="waiting_for_customer">
            Waiting for Customer
          </option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={agentId}
          onChange={(e) =>
            setAgentId(e.target.value)
          }
        >
          <option value="">All Agents</option>

          {agents.map((agent) => (
            <option
              value={agent.id}
              key={agent.id}
            >
              {agent.name}
            </option>
          ))}
        </select>

        <button
          className="primary-button"
          onClick={handleSearch}
        >
          Search
        </button>

        <button
          className="secondary-button"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <p>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          No tickets found.
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

export default Tickets;