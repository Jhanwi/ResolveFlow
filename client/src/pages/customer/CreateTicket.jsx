import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../services/ticketService";

const CreateTicket = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await createTicket(form);

      navigate(`/tickets/${result.ticket.id}`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to create ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page narrow-page">
      <div className="page-header">
        <div>
          <h1>Create Support Ticket</h1>
          <p>
            Tell us what problem you're facing.
          </p>
        </div>
      </div>

      <div className="form-card">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Subject</label>

          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Example: Payment failed"
            required
          />

          <label>Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            <option value="Payment">Payment</option>
            <option value="Account">Account</option>
            <option value="Technical">Technical</option>
            <option value="Order">Order</option>
            <option value="Other">Other</option>
          </select>

          <label>Priority</label>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <label>Describe the issue</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Explain what happened..."
            rows="7"
            required
          />

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating ticket..."
              : "Create Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;