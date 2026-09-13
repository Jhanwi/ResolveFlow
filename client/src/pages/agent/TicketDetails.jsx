import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");

  const [attachment, setAttachment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [addingNote, setAddingNote] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAgentTicketDetails(id);

      setTicket(data.ticket);
      setMessages(data.messages);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file =
      event.target.files[0];

    if (!file) {
      setAttachment(null);
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "application/pdf"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only PNG, JPG, JPEG and PDF files are allowed"
      );

      event.target.value = "";
      setAttachment(null);

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "File size must be 5 MB or less"
      );

      event.target.value = "";
      setAttachment(null);

      return;
    }

    setError("");
    setAttachment(file);
  };

  const handleReply = async (event) => {
    event.preventDefault();

    if (!message.trim() && !attachment) {
      setError(
        "Message or attachment is required"
      );

      return;
    }

    try {
      setSending(true);
      setError("");

      const formData = new FormData();

      if (message.trim()) {
        formData.append(
          "message",
          message.trim()
        );
      }

      if (attachment) {
        formData.append(
          "attachment",
          attachment
        );
      }

      await replyToTicket(
        id,
        formData
      );

      setMessage("");
      setAttachment(null);

      const fileInput =
        document.getElementById(
          "agent-attachment"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      await loadTicket();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to send reply"
      );
    } finally {
      setSending(false);
    }
  };

  const handleInternalNote = async (
    event
  ) => {
    event.preventDefault();

    if (!note.trim()) {
      setError("Note is required");
      return;
    }

    try {
      setAddingNote(true);
      setError("");

      await addInternalNote(
        id,
        note.trim()
      );

      setNote("");

      await loadTicket();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to add internal note"
      );
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusChange = async (
    event
  ) => {
    const newStatus =
      event.target.value;

    try {
      setUpdating(true);
      setError("");

      await updateTicketStatus(
        id,
        newStatus
      );

      await loadTicket();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to update status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (
    event
  ) => {
    const newPriority =
      event.target.value;

    try {
      setUpdating(true);
      setError("");

      await updateTicketPriority(
        id,
        newPriority
      );

      await loadTicket();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to update priority"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleEscalate = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to escalate this ticket?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      await escalateTicket(id);

      await loadTicket();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to escalate ticket"
      );
    } finally {
      setUpdating(false);
    }
  };

  const getAttachmentName = (
    attachmentUrl
  ) => {
    if (!attachmentUrl) {
      return "";
    }

    const parts =
      attachmentUrl.split("/");

    return parts[parts.length - 1];
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
        <div className="empty-state">
          <p>
            {error || "Ticket not found."}
          </p>

          <button
            className="secondary-button"
            onClick={() =>
              navigate(
                "/agent/tickets"
              )
            }
          >
            Back to Assigned Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button
            className="secondary-button"
            onClick={() =>
              navigate(
                "/agent/tickets"
              )
            }
          >
            ← Back to Assigned Tickets
          </button>

          <h1>
            Ticket #{ticket.id}
          </h1>

          <p>
            Created on{" "}
            {new Date(
              ticket.created_at
            ).toLocaleString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      <div className="ticket-header">
        <div>
          <h2>
            {ticket.subject}
          </h2>

          <p>
            {ticket.description}
          </p>

          <div className="ticket-customer">
            <strong>
              Customer:
            </strong>{" "}
            {ticket.customer_name}

            {" · "}

            {ticket.customer_email}
          </div>
        </div>

        <div className="ticket-badges">
          <StatusBadge
            status={ticket.status}
          />

          <PriorityBadge
            priority={ticket.priority}
          />
        </div>
      </div>

      <div className="sla-grid">
        <div className="sla-timer">
          <span>
            Response SLA
          </span>

          <SlaTimer
            dueAt={
              ticket.response_due_at
            }
          />
        </div>

        <div className="sla-timer">
          <span>
            Resolution SLA
          </span>

          <SlaTimer
            dueAt={
              ticket.resolution_due_at
            }
          />
        </div>
      </div>

      <div className="ticket-actions">
        <div className="form-group">
          <label htmlFor="status">
            Status
          </label>

          <select
            id="status"
            value={ticket.status}
            onChange={
              handleStatusChange
            }
            disabled={updating}
          >
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
            value={ticket.priority}
            onChange={
              handlePriorityChange
            }
            disabled={updating}
          >
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

        {ticket.status !==
          "resolved" && (
          <button
            className="secondary-button"
            onClick={
              handleEscalate
            }
            disabled={updating}
          >
            {updating
              ? "Updating..."
              : "Escalate Ticket"}
          </button>
        )}
      </div>

      <div className="conversation-card">
        <div className="section-header">
          <div>
            <h2>
              Conversation
            </h2>

            <p>
              Communicate with the
              customer about the issue.
            </p>
          </div>
        </div>

        <div className="messages">
          {messages.length === 0 ? (
            <p>
              No messages yet.
            </p>
          ) : (
            messages.map(
              (item) => (
                <div
                  key={item.id}
                  className={`message ${
                    item.sender_role ===
                    "customer"
                      ? "customer-message"
                      : "agent-message"
                  }`}
                >
                  <div className="message-header">
                    <strong>
                      {item.sender_name}
                    </strong>

                    <small>
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </small>
                  </div>

                  <p>
                    {item.message}
                  </p>

                  {item.attachment_url && (
                    <a
                      href={`http://localhost:5000${item.attachment_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="attachment-link"
                    >
                      📎{" "}
                      {getAttachmentName(
                        item.attachment_url
                      )}
                    </a>
                  )}
                </div>
              )
            )
          )}
        </div>

        {ticket.status !==
          "resolved" && (
          <form
            className="reply-form"
            onSubmit={handleReply}
          >
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder="Write a reply..."
              rows="4"
              disabled={sending}
            />

            <div className="attachment-input">
              <label htmlFor="agent-attachment">
                Attach file
              </label>

              <input
                id="agent-attachment"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={
                  handleFileChange
                }
                disabled={sending}
              />

              <small>
                PNG, JPG, JPEG or PDF.
                Maximum 5 MB.
              </small>

              {attachment && (
                <small>
                  Selected:{" "}
                  {attachment.name}
                </small>
              )}
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={sending}
            >
              {sending
                ? "Sending..."
                : "Send Reply"}
            </button>
          </form>
        )}

        {ticket.status ===
          "resolved" && (
          <div className="resolved-message">
            This ticket has been resolved.
          </div>
        )}
      </div>

      {ticket.status !==
        "resolved" && (
        <div className="conversation-card">
          <div className="section-header">
            <div>
              <h2>
                Internal Note
              </h2>

              <p>
                Add a private note for
                the support team.
              </p>
            </div>
          </div>

          <form
            className="reply-form"
            onSubmit={
              handleInternalNote
            }
          >
            <textarea
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
              placeholder="Write an internal note..."
              rows="4"
              disabled={addingNote}
            />

            <button
              type="submit"
              className="secondary-button"
              disabled={addingNote}
            >
              {addingNote
                ? "Adding..."
                : "Add Internal Note"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;

