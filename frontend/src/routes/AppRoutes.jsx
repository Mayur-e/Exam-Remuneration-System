import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Register";

// Admin
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminClaimsList from "../pages/admin/AdminClaimsList";
import AdminClaimView from "../pages/admin/AdminClaimView";
import AdminFacultyList from "../pages/admin/AdminFacultyList";
import AdminFacultyProfile from "../pages/admin/AdminFacultyProfile";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AdminExternalSupervision from "../pages/admin/AdminExternalSupervision";
import AdminSettings from "../pages/admin/AdminSettings";

// Faculty
import FacultyLayout from "../pages/faculty/FacultyLayout";
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import GenerateClaim from "../pages/faculty/GenerateClaim";
import TeachingBillForm from "../pages/faculty/TeachingBillForm";
import NonTeachingBillForm from "../pages/faculty/NonTeachingBillForm";
import MyClaims from "../pages/faculty/MyClaims";
import Queries from "../pages/faculty/Queries";
import Settings from "../pages/faculty/Settings";
import ExternalTeachingForm from "../pages/external/ExternalTeachingForm"



import AccountantLayout from "../pages/accountant/AccountantLayout";
import AccountantDashboard from "../pages/accountant/AccountantDashboard";
import Bills from "../pages/accountant/Bills";
import BillView from "../pages/accountant/BillView";
import FacultyList from "../pages/accountant/FacultyList";
import FacultyProfile from "../pages/accountant/FacultyProfile";
import Settingsacc from "../pages/accountant/Settings";

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
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="claims" element={<AdminClaimsList />} />
        <Route path="claims/:id" element={<AdminClaimView />} />
        <Route path="faculty" element={<AdminFacultyList />} />
        <Route path="faculty/:id" element={<AdminFacultyProfile />} />
        <Route path="external" element={<AdminExternalSupervision />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ================= BILLING INCHARGE ================= */}
      <Route path="/accountant" element={<ProtectedRoute role="BILLING_INCHARGE">
        <AccountantLayout />
      </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AccountantDashboard />} />
        <Route path="bills" element={<Bills />} />
        <Route path="bills/:id" element={<BillView />} />
        <Route path="faculty" element={<FacultyList />} />
        <Route path="faculty/:id" element={<FacultyProfile />} />
        <Route path="settings" element={<Settingsacc />} />
      </Route>


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
        <Route path="claim/non-teaching" element={<NonTeachingBillForm />} />
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

