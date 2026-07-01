import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { TicketProvider } from "./context/TicketContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import UserPortal from "./pages/UserPortal.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import CreateTicketPage from "./pages/CreateTicketPage.jsx";
import MyTicketsPage from "./pages/MyTicketsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminTickets from "./pages/AdminTickets.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import AdminProfile from "./pages/AdminProfile.jsx";
import TecnicoLayout from "./pages/TecnicoLayout.jsx";
import TecnicoTickets from "./pages/TecnicoTickets.jsx";
import TecnicoProfile from "./pages/TecnicoProfile.jsx";

import { RequirePasswordChange } from "./components/RequirePasswordChange.jsx";

import { UserProvider, useUsers } from "./context/UserContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { NotificationProvider, useNotifications } from "./context/NotificationContext.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          {/*
            UserProvider es el PRIMERO en el árbol de providers que dependen de datos de usuario.
            AuthProvider está anidado dentro porque necesita acceder a useUsers() para autenticar.
            Este orden es la base de la fuente única de verdad para todos los usuarios del sistema.
          */}
          <UserProvider>
            <NotificationProvider>
              <SettingsProvider>
                <AuthProvider>
                  <TicketProviderWithNotifications />
                </AuthProvider>
              </SettingsProvider>
            </NotificationProvider>
          </UserProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

/**
 * Puente entre NotificationContext y TicketProvider.
 * Evita importar NotificationContext desde TicketContext (dependencia circular).
 * useNotifications() solo puede llamarse dentro de NotificationProvider.
 */
function TicketProviderWithNotifications() {
  const { addNotification } = useNotifications();
  const { users } = useUsers();

  const handleTicketEvent = (type, recipientId, payload) => {
    if (recipientId === "admin") {
      const activeAdmins = users.filter((u) => u.role === "admin" && u.estado === "Activo");
      activeAdmins.forEach((admin) => addNotification(type, admin.id, payload));
    } else {
      addNotification(type, recipientId, payload);
    }
  };

  return (
    <TicketProvider onEvent={handleTicketEvent}>
      <AppRoutes />
    </TicketProvider>
  );
}

function AppRoutes() {
  return (
    <RequirePasswordChange>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="usuario">
            <UserPortal />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="create-ticket" element={<CreateTicketPage />} />
        <Route path="my-tickets" element={<MyTicketsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route
        path="/tecnico"
        element={
          <ProtectedRoute role="tecnico">
            <TecnicoLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TecnicoTickets />} />
        <Route path="profile" element={<TecnicoProfile />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </RequirePasswordChange>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "tecnico") return <Navigate to="/tecnico" replace />;
  return <Navigate to="/dashboard" replace />;
}
