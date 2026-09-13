import { useEffect, useState } from "react";

import {
  getAllTickets,
  getAgents,
  assignTicket
} from "../../services/adminService";

import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";

const Tickets = () => {
  const [tickets, setTickets] =
    useState([]);

  const [agents, setAgents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const [agentId, setAgentId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [assigning, setAssigning] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        ticketData,
        agentData
      ] = await Promise.all([
        getAllTickets(),
        getAgents()
      ]);

      setTickets(
        ticketData.tickets
      );

      setAgents(
        agentData.agents
      );
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

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAllTickets({
          search,
          status,
          priority,
          agentId
        });

      setTickets(data.tickets);
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

  const handleAssign = async (
    ticketId,
    selectedAgentId
  ) => {
    if (!selectedAgentId) {
      return;
    }

    try {
      setAssigning(ticketId);
      setError("");

      await assignTicket(
        ticketId,
        Number(selectedAgentId)
      );

      await loadTickets();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to assign ticket"
      );
    } finally {
      setAssigning(null);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();

    loadTickets();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>All Tickets</h1>

          <p>
            View and assign support tickets.
          </p>
        </div>
      </div>

      <div className="filter-card">
        <form
          className="filters"
          onSubmit={handleSearch}
        >
          <div className="form-group">
            <label htmlFor="search">
              Search
            </label>

            <input
              id="search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search tickets..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
            >
              <option value="">
                All statuses
              </option>

              <option value="open">
                Open
              </option>

              <option value="assigned">
                Assigned
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="waiting_for_customer">
                Waiting for Customer
              </option>

              <option value="resolved">
                Resolved
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">
              Priority
            </label>

            <select
              id="priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value
                )
              }
            >
              <option value="">
                All priorities
              </option>

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>

              <option value="critical">
                Critical
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="agent">
              Agent
            </label>

            <select
              id="agent"
              value={agentId}
              onChange={(event) =>
                setAgentId(
                  event.target.value
                )
              }
            >
              <option value="">
                All agents
              </option>

              {agents.map((agent) => (
                <option
                  key={agent.id}
                  value={agent.id}
                >
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="primary-button"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <p>
              No tickets found.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      #{ticket.id}
                    </td>

                    <td>
                      <strong>
                        {ticket.subject}
                      </strong>

                      <small>
                        {ticket.category ||
                          "General"}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {ticket.customer_name}
                      </strong>

                      <small>
                        {ticket.customer_email}
                      </small>
                    </td>

                    <td>
                      <PriorityBadge
                        priority={
                          ticket.priority
                        }
                      />
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          ticket.status
                        }
                      />
                    </td>

                    <td>
                      <select
                        value={
                          ticket.agent_id ||
                          ""
                        }
                        onChange={(event) =>
                          handleAssign(
                            ticket.id,
                            event.target.value
                          )
                        }
                        disabled={
                          assigning ===
                          ticket.id
                        }
                      >
                        <option value="">
                          Unassigned
                        </option>

                        {agents.map(
                          (agent) => (
                            <option
                              key={
                                agent.id
                              }
                              value={
                                agent.id
                              }
                            >
                              {agent.name}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td>
                      {assigning ===
                      ticket.id
                        ? "Saving..."
                        : ticket.agent_id
                        ? "Assigned"
                        : "Assign"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;