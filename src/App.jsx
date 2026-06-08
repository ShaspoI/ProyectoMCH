import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { TicketProvider } from "./context/TicketContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import UserPortal from "./pages/UserPortal.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import CreateTicketPage from "./pages/CreateTicketPage.jsx";
import MyTicketsPage from "./pages/MyTicketsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TicketProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </TicketProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}
