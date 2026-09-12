import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAgent =
    user?.role === "agent" ||
    user?.role === "admin";

  return (
    <nav className="navbar">
      <Link
        to={
          isAgent
            ? "/agent/dashboard"
            : "/dashboard"
        }
        className="logo"
      >
        ResolveFlow
      </Link>

      {user && (
        <div className="nav-links">
          {isAgent ? (
            <>
              <Link to="/agent/dashboard">
                Dashboard
              </Link>

              <Link to="/agent/tickets">
                Assigned Tickets
              </Link>

              <Link to="/agent/customers">
                Customers
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">
                Dashboard
              </Link>

              <Link to="/tickets">
                My Tickets
              </Link>

              <Link to="/tickets/create">
                Create Ticket
              </Link>
            </>
          )}

          <span className="user-name">
            {user.name}
          </span>

          <span className="role-label">
            {user.role}
          </span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;