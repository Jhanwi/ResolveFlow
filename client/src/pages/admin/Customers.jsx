import { useEffect, useState } from "react";
import { getCustomers } from "../../services/adminService";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomers();
      setCustomers(data.customers);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>
            View customer accounts and ticket activity.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Loading customers...
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <h3>No customers found</h3>
          <p>
            Customer accounts will appear here after
            registration.
          </p>
        </div>
      ) : (
        <div className="tickets-table">
          <div className="table-header">
            <span>Customer</span>
            <span>Email</span>
            <span>Total Tickets</span>
            <span>Open</span>
            <span>Resolved</span>
          </div>

          {customers.map((customer) => (
            <div
              className="table-row"
              key={customer.id}
            >
              <span>{customer.name}</span>

              <span>{customer.email}</span>

              <span>
                {customer.ticket_count}
              </span>

              <span>
                {customer.open_tickets}
              </span>

              <span>
                {customer.resolved_tickets}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;