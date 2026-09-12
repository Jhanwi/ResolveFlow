import { useEffect, useState } from "react";
import { getCustomers } from "../../services/adminService";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data.customers);
    } catch (error) {
      console.error(error);
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

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          No customers found.
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