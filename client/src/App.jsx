import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CustomerDashboard from "./pages/customer/Dashboard";
import CreateTicket from "./pages/customer/CreateTicket";
import MyTickets from "./pages/customer/MyTickets";
import CustomerTicketDetails from "./pages/customer/TicketDetails";

import AgentDashboard from "./pages/agent/Dashboard";
import AssignedTickets from "./pages/agent/AssignedTickets";
import AgentTicketDetails from "./pages/agent/TicketDetails";
import AgentCustomers from "./pages/agent/Customers";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminTickets from "./pages/admin/Tickets";
import AdminAgents from "./pages/admin/Agents";
import AdminCustomers from "./pages/admin/Customers";
import SlaManagement from "./pages/admin/SlaManagement";
import SlaBreaches from "./pages/admin/SlaBreaches";
import Analytics from "./pages/admin/Analytics";

const ProtectedRoute = ({
  children,
  roles
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!roles.includes(user.role)) {
    if (user.role === "customer") {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }

    if (user.role === "agent") {
      return (
        <Navigate
          to="/agent/dashboard"
          replace
        />
      );
    }

    if (user.role === "admin") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
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

        {/* Customer */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["customer"]}>
              <CustomerDashboard />
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
              <CustomerTicketDetails />
            </ProtectedRoute>
          }
        />

        {/* Agent */}

        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute roles={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/tickets"
          element={
            <ProtectedRoute roles={["agent"]}>
              <AssignedTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/tickets/:id"
          element={
            <ProtectedRoute roles={["agent"]}>
              <AgentTicketDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/customers"
          element={
            <ProtectedRoute roles={["agent"]}>
              <AgentCustomers />
            </ProtectedRoute>
          }
        />

        {/* Admin */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/agents"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminAgents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminCustomers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/sla"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SlaManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/breaches"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SlaBreaches />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;