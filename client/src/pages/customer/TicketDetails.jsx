import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTicketDetails,
  addMessage
} from "../../services/ticketService";

import {
  createReview,
  getTicketReview
} from "../../services/reviewService";

import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import SlaTimer from "../../components/SlaTimer";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] =
    useState("");
  const [review, setReview] = useState(null);
  const [reviewMessage, setReviewMessage] =
    useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTicketDetails(id);

      setTicket(data.ticket);
      setMessages(data.messages);

      const reviewData =
        await getTicketReview(id);

      setReview(reviewData.review);
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
    const file = event.target.files[0];

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

  const handleSendMessage = async (event) => {
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

      await addMessage(
        id,
        formData
      );

      setMessage("");
      setAttachment(null);

      const fileInput =
        document.getElementById(
          "customer-attachment"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      await loadTicket();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (rating === 0) {
      setReviewMessage(
        "Please select a rating"
      );

      return;
    }

    try {
      const data = await createReview(id, {
        rating,
        comment: reviewComment
      });

      setReview(data.review);

      setReviewMessage(
        "Thank you for your feedback!"
      );
    } catch (error) {
      setReviewMessage(
        error.response?.data?.message ||
          "Unable to submit review"
      );
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
              navigate("/tickets")
            }
          >
            Back to My Tickets
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
              navigate("/tickets")
            }
          >
            ← Back to My Tickets
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

      <div className="status-timeline">
        <div
          className={
            ticket.status
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>1</span>
          <p>Created</p>
        </div>

        <div
          className={
            [
              "assigned",
              "in_progress",
              "waiting_for_customer",
              "resolved"
            ].includes(ticket.status)
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>2</span>
          <p>Assigned</p>
        </div>

        <div
          className={
            [
              "in_progress",
              "waiting_for_customer",
              "resolved"
            ].includes(ticket.status)
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>3</span>
          <p>In Progress</p>
        </div>

        <div
          className={
            [
              "waiting_for_customer",
              "resolved"
            ].includes(ticket.status)
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>4</span>
          <p>Waiting</p>
        </div>

        <div
          className={
            ticket.status === "resolved"
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>5</span>
          <p>Resolved</p>
        </div>
      </div>

      <div className="conversation-card">
        <div className="section-header">
          <div>
            <h2>
              Conversation
            </h2>

            <p>
              Communicate with the support
              team about your issue.
            </p>
          </div>
        </div>

        <div className="messages">
          {messages.length === 0 ? (
            <p>
              No messages yet.
            </p>
          ) : (
            messages.map((item) => (
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
            ))
          )}
        </div>

        {ticket.status !== "resolved" && (
          <form
            className="reply-form"
            onSubmit={handleSendMessage}
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
              <label htmlFor="customer-attachment">
                Attach file
              </label>

              <input
                id="customer-attachment"
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

        {ticket.status === "resolved" && (
          <div className="resolved-message">
            This ticket has been resolved.
          </div>
        )}
      </div>

      {ticket.status === "resolved" && (
        <div className="review-card">
          <h2>
            How did we do?
          </h2>

          {review ? (
            <div className="review-submitted">
              <p>
                Your rating
              </p>

              <div className="review-stars">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <span
                      key={star}
                      className={
                        star <=
                        review.rating
                          ? "star active"
                          : "star"
                      }
                    >
                      ★
                    </span>
                  )
                )}
              </div>

              <p>
                {review.comment ||
                  "No written feedback provided."}
              </p>

              <small>
                Review submitted on{" "}
                {new Date(
                  review.created_at
                ).toLocaleDateString()}
              </small>
            </div>
          ) : (
            <form
              className="review-form"
              onSubmit={
                handleReviewSubmit
              }
            >
              <p>
                Did this support
                interaction solve your
                problem?
              </p>

              <div className="review-stars">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      type="button"
                      key={star}
                      className={
                        star <= rating
                          ? "star-button active"
                          : "star-button"
                      }
                      onClick={() =>
                        setRating(star)
                      }
                    >
                      ★
                    </button>
                  )
                )}
              </div>

              <textarea
                value={reviewComment}
                onChange={(event) =>
                  setReviewComment(
                    event.target.value
                  )
                }
                placeholder="Tell us about your experience..."
                rows="4"
              />

              <button
                type="submit"
                className="primary-button"
              >
                Submit Review
              </button>

              {reviewMessage && (
                <p className="form-message">
                  {reviewMessage}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketDetails;

