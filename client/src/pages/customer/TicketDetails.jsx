import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTicketDetails,
  addMessage
} from "../../services/ticketService";
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

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadTicket = async () => {
    try {
      const result = await getTicketDetails(id);

      setTicket(result.ticket);
      setMessages(result.messages);
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
      const result = await addMessage(
        id,
        message.trim()
      );

      setMessages((current) => [
        ...current,
        {
          ...result.reply,
          sender_name: user.name,
          sender_role: user.role
        }
      ]);

      setMessage("");
      loadTicket();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to send reply"
      );
    } finally {
      setSending(false);
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
            {ticket.category || "General Support"}
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
          <h2>Conversation</h2>
        </div>

        <div className="messages">
          {messages.map((item) => (
            <div
              className={`message ${
                item.sender_id === user.id
                  ? "customer-message"
                  : "agent-message"
              }`}
              key={item.id}
            >
              <div className="message-top">
                <strong>
                  {item.sender_name}
                </strong>

                <span>
                  {new Date(
                    item.created_at
                  ).toLocaleString()}
                </span>
              </div>

              <p>{item.message}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {ticket.status !== "resolved" ? (
          <form
            className="reply-form"
            onSubmit={handleReply}
          >
            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Write a reply..."
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
        ) : (
          <div className="resolved-message">
            This ticket has been resolved.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;