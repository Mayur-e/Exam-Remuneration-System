import { Navigate } from "react-router-dom";
import { getAuth } from "../utils/auth";

export default function ProtectedRoute({ children, role }) {
  const auth = getAuth();

  // ❌ Not logged in
  if (!auth) {
    return <Navigate to="/" replace />;
  }

  // ❌ Logged in but wrong role
  if (role && auth.user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allowed
  return children;
}
