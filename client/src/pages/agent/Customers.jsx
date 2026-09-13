import { useEffect, useState } from "react";
import { getAgentTickets } from "../../services/agentService";

const Customers = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAgentTickets();
      setTickets(result.tickets);
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

  const customers = [];

  tickets.forEach((ticket) => {
    const exists = customers.find(
      (customer) =>
        customer.email === ticket.customer_email
    );

    if (!exists) {
      customers.push({
        name: ticket.customer_name,
        email: ticket.customer_email,
        tickets: 1
      });
    } else {
      exists.tickets += 1;
    }
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      customer.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>
            Customers associated with your assigned tickets.
          </p>
        </div>
      </div>

      <div className="search-card">
        <input
          type="text"
          placeholder="Search customer by name or email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          disabled={loading}
        />
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
      ) : filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <h3>No customers found</h3>
          <p>
            Customers associated with your assigned tickets
            will appear here.
          </p>
        </div>
      ) : (
        <div className="customer-list">
          {filteredCustomers.map((customer) => (
            <div
              className="customer-card"
              key={customer.email}
            >
              <div>
                <h3>{customer.name}</h3>
                <p>{customer.email}</p>
              </div>

              <span>
                {customer.tickets} ticket
                {customer.tickets !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;