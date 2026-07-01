import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function RequirePasswordChange({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return children; // ProtectedRoute will handle this

  // If user has tempPassword flag and is trying to access protected routes, redirect them
  if (user.tempPassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  // If they don't have tempPassword but try to visit change-password, redirect to home
  if (!user.tempPassword && location.pathname === "/change-password") {
    return <Navigate to="/" replace />;
  }

  return children;
}
