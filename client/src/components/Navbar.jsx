import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "agent";

  const homePath = isAdmin
    ? "/admin/dashboard"
    : isAgent
      ? "/agent/dashboard"
      : "/dashboard";

  return (
    <nav className="navbar">
      <Link to={homePath} className="logo">
        ResolveFlow
      </Link>

      {user && (
        <div className="nav-links">
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/tickets">Tickets</Link>
              <Link to="/admin/agents">Agents</Link>
              <Link to="/admin/customers">Customers</Link>
              <Link to="/admin/sla">SLA</Link>
              <Link to="/admin/breaches">Breaches</Link>
              <Link to="/admin/analytics">Analytics</Link>
            </>
          ) : isAgent ? (
            <>
              <Link to="/agent/dashboard">Dashboard</Link>
              <Link to="/agent/tickets">Assigned Tickets</Link>
              <Link to="/agent/customers">Customers</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/tickets">My Tickets</Link>
              <Link to="/tickets/create">Create Ticket</Link>
            </>
          )}

          <button
            className="theme-button"
            onClick={toggleTheme}
            title={
              theme === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
          >
            {theme === "light" ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>

          <NotificationBell />

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