import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Register";

// Admin & Accountant
import AdminDashboard from "../pages/admin/AdminDashboard";
import AccountantDashboard from "../pages/accountant/AccountantDashboard";

// Faculty
import FacultyLayout from "../pages/faculty/FacultyLayout";
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import GenerateClaim from "../pages/faculty/GenerateClaim";
import TeachingBillForm from "../pages/faculty/TeachingBillForm";
import MyClaims from "../pages/faculty/MyClaims";
import Queries from "../pages/faculty/Queries";
import Settings from "../pages/faculty/Settings";
import ExternalTeachingForm from "../pages/external/ExternalTeachingForm"
// Protection
import ProtectedRoute from "./ProtectedRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= ACCOUNTANT ================= */}
      <Route
        path="/accountant"
        element={
          <ProtectedRoute role="ACCOUNTANT">
            <AccountantDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= FACULTY ================= */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute role="FACULTY">
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboard />} />
        <Route path="generateclaim" element={<GenerateClaim />} />
        <Route path="claim/teaching" element={<TeachingBillForm />} />
        <Route path="myclaims" element={<MyClaims />} />
        <Route path="queries" element={<Queries />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="/external/claim/:token" element={<ExternalTeachingForm />} />
      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
