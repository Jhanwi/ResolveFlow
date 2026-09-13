import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createTicket } from "../../services/ticketService";

const CreateTicket = () => {
  const navigate = useNavigate();

  const [subject, setSubject] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [priority, setPriority] =
    useState("medium");

  const [attachment, setAttachment] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!subject.trim() || !description.trim()) {
      setError(
        "Subject and description are required"
      );

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "subject",
        subject.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "priority",
        priority
      );

      if (attachment) {
        formData.append(
          "attachment",
          attachment
        );
      }

      const data =
        await createTicket(formData);

      navigate(
        `/tickets/${data.ticket.id}`
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create ticket"
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Create Support Ticket</h1>

          <p>
            Tell us about the issue you are facing.
          </p>
        </div>
      </div>

      <div className="form-card">
        <form
          className="ticket-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="subject">
              Subject
            </label>

            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(event) =>
                setSubject(
                  event.target.value
                )
              }
              placeholder="Example: Payment failed"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              disabled={loading}
            >
              <option value="">
                Select category
              </option>

              <option value="billing">
                Billing
              </option>

              <option value="technical">
                Technical
              </option>

              <option value="account">
                Account
              </option>

              <option value="general">
                General
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
              disabled={loading}
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

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe your issue..."
              rows="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="attachment">
              Attachment
            </label>

            <input
              id="attachment"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileChange}
              disabled={loading}
            />

            <small>
              PNG, JPG, JPEG or PDF. Maximum 5 MB.
            </small>

            {attachment && (
              <small>
                Selected: {attachment.name}
              </small>
            )}
          </div>

          {error && (
            <p className="form-message error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;