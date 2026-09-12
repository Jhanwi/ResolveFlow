import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAgentTicketDetails,
  replyToTicket,
  addInternalNote,
  updateTicketStatus,
  updateTicketPriority,
  escalateTicket
} from "../../services/agentService";

import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import SlaTimer from "../../components/SlaTimer";
import { useAuth } from "../../context/AuthContext";

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTicket = async () => {
    try {
      const result = await getAgentTicketDetails(id);

      setTicket(result.ticket);
      setMessages(result.messages);

      setStatus(result.ticket.status);
      setPriority(result.ticket.priority);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    setSending(true);
    setError("");

    try {
      await replyToTicket(id, message.trim());

      setMessage("");

      await loadTicket();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to send reply"
      );
    } finally {
      setSending(false);
    }
  };

  const handleNote = async (e) => {
    e.preventDefault();

    if (!note.trim()) {
      return;
    }

    setSending(true);
    setError("");

    try {
      await addInternalNote(id, note.trim());

      setNote("");

      await loadTicket();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to add internal note"
      );
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    setStatus(newStatus);
    setSaving(true);
    setError("");

    try {
      const result = await updateTicketStatus(
        id,
        newStatus
      );

      setTicket(result.ticket);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to update status"
      );

      await loadTicket();
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;

    setPriority(newPriority);
    setSaving(true);
    setError("");

    try {
      const result = await updateTicketPriority(
        id,
        newPriority
      );

      setTicket(result.ticket);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to update priority"
      );

      await loadTicket();
    } finally {
      setSaving(false);
    }
  };

  const handleEscalate = async () => {
    setSaving(true);
    setError("");

    try {
      const result = await escalateTicket(id);

      setTicket(result.ticket);
      setPriority(result.ticket.priority);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to escalate ticket"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page">
        <div className="error-message">
          {error || "Ticket not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="ticket-header">
        <div>
          <span className="ticket-id">
            Ticket #{ticket.id}
          </span>

          <h1>{ticket.subject}</h1>

          <p>
            Customer: {ticket.customer_name}
          </p>

          <p>
            {ticket.customer_email}
          </p>
        </div>

        <div className="ticket-status">
          <PriorityBadge
            priority={ticket.priority}
          />

          <StatusBadge
            status={ticket.status}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="agent-control-card">
        <div className="control-group">
          <label>Status</label>

          <select
            value={status}
            onChange={handleStatusChange}
            disabled={saving}
          >
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
        </div>

        <div className="control-group">
          <label>Priority</label>

          <select
            value={priority}
            onChange={handlePriorityChange}
            disabled={saving}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          className="danger-button"
          onClick={handleEscalate}
          disabled={
            saving || ticket.priority === "critical"
          }
        >
          {ticket.priority === "critical"
            ? "Critical Priority"
            : "Escalate Ticket"}
        </button>
      </div>

      <div className="sla-grid">
        <SlaTimer
          dueAt={ticket.response_due_at}
          label="Response SLA"
        />

        <SlaTimer
          dueAt={ticket.resolution_due_at}
          label="Resolution SLA"
        />
      </div>

      <div className="conversation-card">
        <div className="conversation-header">
          <h2>Customer Conversation</h2>
        </div>

        <div className="messages">
          {messages.map((item) => {
            const isInternalNote =
              item.message.startsWith("[Internal Note]");

            return (
              <div
                className={`message ${
                  isInternalNote
                    ? "internal-note"
                    : item.sender_id === user.id
                    ? "customer-message"
                    : "agent-message"
                }`}
                key={item.id}
              >
                <div className="message-top">
                  <strong>
                    {isInternalNote
                      ? "Internal Note"
                      : item.sender_name}
                  </strong>

                  <span>
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </span>
                </div>

                <p>{item.message}</p>
              </div>
            );
          })}
        </div>

        {ticket.status !== "resolved" && (
          <form
            className="reply-form"
            onSubmit={handleReply}
          >
            <label>Reply to customer</label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Write a reply to the customer..."
              rows="4"
            />

            <button
              type="submit"
              className="primary-button"
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </form>
        )}

        <form
          className="note-form"
          onSubmit={handleNote}
        >
          <label>Internal Note</label>

          <textarea
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            placeholder="Add a note for support staff..."
            rows="3"
          />

          <button
            type="submit"
            className="secondary-button"
            disabled={sending}
          >
            Add Internal Note
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetails;