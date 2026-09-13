import { useEffect, useState } from "react";

import {
  getSlaPolicies,
  createSlaPolicy,
  updateSlaPolicy
} from "../../services/adminService";

const SlaManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [priority, setPriority] = useState("low");

  const [responseMinutes, setResponseMinutes] =
    useState("");

  const [resolutionMinutes, setResolutionMinutes] =
    useState("");

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSlaPolicies();
      setPolicies(data.policies);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load SLA policies"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPriority("low");
    setResponseMinutes("");
    setResolutionMinutes("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const policyData = {
        priority,
        responseMinutes: Number(responseMinutes),
        resolutionMinutes: Number(resolutionMinutes)
      };

      if (editingId) {
        await updateSlaPolicy(
          editingId,
          policyData
        );
      } else {
        await createSlaPolicy(policyData);
      }

      resetForm();
      await loadPolicies();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to save SLA policy"
      );
    }
  };

  const startEdit = (policy) => {
    setEditingId(policy.id);
    setPriority(policy.priority);

    setResponseMinutes(
      policy.response_minutes
    );

    setResolutionMinutes(
      policy.resolution_minutes
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>SLA Management</h1>
          <p>
            Configure response and resolution targets.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      <div className="admin-form-card">
        <h2>
          {editingId
            ? "Update SLA Policy"
            : "Add SLA Policy"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Priority</label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
              >
                <option value="critical">
                  Critical
                </option>

                <option value="high">
                  High
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="low">
                  Low
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Response Time (minutes)
              </label>

              <input
                type="number"
                min="1"
                value={responseMinutes}
                onChange={(e) =>
                  setResponseMinutes(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Resolution Time (minutes)
              </label>

              <input
                type="number"
                min="1"
                value={resolutionMinutes}
                onChange={(e) =>
                  setResolutionMinutes(
                    e.target.value
                  )
                }
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
            >
              {editingId
                ? "Update Policy"
                : "Add Policy"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-section">
        <h2>Current SLA Policies</h2>

        {loading ? (
          <div className="loading-state">
            Loading policies...
          </div>
        ) : policies.length === 0 ? (
          <div className="empty-state">
            <h3>No SLA policies found</h3>
            <p>
              Add an SLA policy to start tracking response
              and resolution targets.
            </p>
          </div>
        ) : (
          <div className="tickets-table">
            <div className="table-header">
              <span>Priority</span>
              <span>Response</span>
              <span>Resolution</span>
              <span>Action</span>
            </div>

            {policies.map((policy) => (
              <div
                className="table-row"
                key={policy.id}
              >
                <span>
                  <span
                    className={`badge priority-${policy.priority}`}
                  >
                    {policy.priority}
                  </span>
                </span>

                <span>
                  {policy.response_minutes} minutes
                </span>

                <span>
                  {policy.resolution_minutes} minutes
                </span>

                <span>
                  <button
                    className="secondary-button"
                    onClick={() =>
                      startEdit(policy)
                    }
                  >
                    Edit
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlaManagement;