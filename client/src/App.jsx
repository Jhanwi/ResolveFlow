import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  AuthProvider,
  useAuth
} from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/customer/Dashboard";
import CreateTicket from "./pages/customer/CreateTicket";
import MyTickets from "./pages/customer/MyTickets";
import TicketDetails from "./pages/customer/TicketDetails";

import AgentDashboard from "./pages/agent/Dashboard";
import AssignedTickets from "./pages/agent/AssignedTickets";
import AgentTicketDetails from "./pages/agent/TicketDetails";
import Customers from "./pages/agent/Customers";

const ProtectedRoute = ({
  children,
  roles
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    if (user.role === "customer") {
      return (
        <Navigate to="/dashboard" replace />
      );
    }

    return (
      <Navigate
        to="/agent/dashboard"
        replace
      />
    );
  }

  return children;
};

const AppContent = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Customer routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["customer"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute roles={["customer"]}>
              <MyTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/create"
          element={
            <ProtectedRoute roles={["customer"]}>
              <CreateTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute roles={["customer"]}>
              <TicketDetails />
            </ProtectedRoute>
          }
        />

        {/* Agent routes */}

        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute
              roles={["agent", "admin"]}
            >
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/tickets"
          element={
            <ProtectedRoute
              roles={["agent", "admin"]}
            >
              <AssignedTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/tickets/:id"
          element={
            <ProtectedRoute
              roles={["agent", "admin"]}
            >
              <AgentTicketDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/customers"
          element={
            <ProtectedRoute
              roles={["agent", "admin"]}
            >
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;