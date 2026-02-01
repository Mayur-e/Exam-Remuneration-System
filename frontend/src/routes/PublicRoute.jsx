import { Navigate } from "react-router-dom";
import { getAuth } from "../utils/auth";

export default function PublicRoute({ children }) {
  const auth = getAuth();

  // ✅ Already logged in → redirect to dashboard
  if (auth) {
    const role = auth.user.role;

    if (role === "ADMIN") return <Navigate to="/admin" replace />;
    if (role === "BILLING_INCHARGE") return <Navigate to="/accountant" replace />;
    return <Navigate to="/faculty" replace />;
  }

  // ❌ Not logged in → allow access
  return children;
}
