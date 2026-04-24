import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "../pages/auth/Login";

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
import UserManagement from "../components/admin/UserManagement";

// Faculty
import FacultyLayout from "../pages/faculty/FacultyLayout";
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import GenerateClaim from "../pages/faculty/GenerateClaim";
import TeachingBillForm from "../pages/faculty/TeachingBillForm";
import NonTeachingBillForm from "../pages/faculty/NonTeachingBillForm";
import MyClaims from "../pages/faculty/MyClaims";
import Queries from "../pages/faculty/Queries";
import Settings from "../pages/faculty/Settings";
import CoordinatorDashboard from "../pages/coordinator/CoordinatorDashboard";
import ExternalTeachingForm from "../pages/external/ExternalTeachingForm"
import ExternalSuccess from "../pages/external/ExternalSuccess"



// Accountant
import AccountantLayout from "../pages/accountant/AccountantLayout";
import AccountantDashboard from "../pages/accountant/AccountantDashboard";
import Bills from "../pages/accountant/Bills";
import BillView from "../pages/accountant/BillView";
import FacultyList from "../pages/accountant/FacultyList";
import FacultyProfile from "../pages/accountant/FacultyProfile";
import QueryManagement from "../pages/accountant/QueryManagement";
import Settingsacc from "../pages/accountant/Settings";
import CoordinatorManagement from "../components/billing/CoordinatorManagement";
import AccountantExternalSupervision from "../pages/accountant/AccountantExternalSupervision";

// Protection
import ProtectedRoute from "./ProtectedRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Login />} />

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
        <Route path="users" element={<UserManagement />} />
        <Route path="queries" element={<QueryManagement />} />
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
        <Route path="coordinators" element={<CoordinatorManagement />} />
        <Route path="external" element={<AccountantExternalSupervision />} />
        <Route path="queries" element={<QueryManagement />} />
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
        <Route path="coordinator/dashboard" element={<CoordinatorDashboard />} />
      </Route>

      <Route path="/external/claim/:token" element={<ExternalTeachingForm />} />
      <Route path="/external/success" element={<ExternalSuccess />} />
      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

