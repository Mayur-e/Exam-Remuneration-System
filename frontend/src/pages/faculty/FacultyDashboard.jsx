import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    approved_count: 0,
    pending_count: 0,
    rejected_count: 0,
    total_amount: 0,
  });
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  useEffect(() => {
    fetchStats();

    // Check if we should show bank details notification
    const shouldShowNotification = localStorage.getItem("showBankDetailsNotification");
    if (shouldShowNotification === "true") {
      setToastMessage("Please complete your bank account details in the Settings tab");
      setToastType("warning");
      setTimeout(() => setToastMessage(""), 10000);
      localStorage.removeItem("showBankDetailsNotification");
    }
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, claimsRes] = await Promise.all([
        api.get("/faculty/dashboard-stats"),
        api.get("/faculty/exams")
      ]);
      setStats(statsRes.data);
      setRecentClaims((claimsRes.data || []).slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setToastMessage("Failed to load dashboard data");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    const config = {
      draft: { label: "Draft", style: "bg-slate-100 text-slate-700" },
      submitted: { label: "Submitted", style: "bg-amber-100 text-amber-700" },
      UNDER_COORDINATOR_REVIEW: { label: "Under Review", style: "bg-purple-100 text-purple-700" },
      COORDINATOR_VERIFIED: { label: "Verified", style: "bg-purple-100 text-purple-700" },
      SENT_TO_BILLING: { label: "Processing", style: "bg-amber-100 text-amber-700" },
      approved: { label: "Approved", style: "bg-green-100 text-green-700" },
      paid: { label: "Credited", style: "bg-green-100 text-green-700" },
      rejected: { label: "Rejected", style: "bg-red-100 text-red-700" },
      COORDINATOR_REJECTED: { label: "Rejected", style: "bg-red-100 text-red-700" },
    };
    const s = config[status] || { label: status, style: "bg-slate-100 text-slate-700" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${s.style}`}>
        {s.label}
      </span>
    );
  };

  const handleViewClaim = (claim) => {
    if (claim.claim_form_type === 'NON_TEACHING') {
      navigate(`/faculty/claim/non-teaching?examId=${claim.id}`);
    } else if (claim.claim_form_type === 'TEACHING_EXTERNAL') {
      navigate(`/faculty/claim/teaching?examId=${claim.id}&claimType=TEACHING_EXTERNAL`);
    } else {
      navigate(`/faculty/claim/teaching?examId=${claim.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)]">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-xl z-50 font-medium ${toastType === "warning"
              ? "bg-amber-500 text-white"
              : toastType === "error"
                ? "bg-red-500 text-white"
                : "bg-primary text-white"
              }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your claims and remuneration</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium">Total Payable Earnings</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-black text-slate-900">₹{Number(stats.total_amount || 0).toLocaleString('en-IN')}</h3>
              <p className="text-green-600 text-xs font-bold flex items-center mt-1">
                <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span> Approved Total
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium">Approved Claims</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-black text-slate-900">{stats.approved_count}</h3>
              <p className="text-green-600 text-xs font-bold flex items-center mt-1">
                <span className="material-symbols-outlined text-[14px] mr-1">task_alt</span> Duties Completed
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium">Pending Claims</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-black text-slate-900">{stats.pending_count}</h3>
              <p className="text-slate-400 text-xs font-medium flex items-center mt-1">
                <span className="material-symbols-outlined text-[14px] mr-1">schedule</span> In review
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium">Rejected Claims</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-black text-slate-900">{stats.rejected_count}</h3>
              <p className="text-red-500 text-xs font-medium flex items-center mt-1">
                <span className="material-symbols-outlined text-[14px] mr-1">error</span> Needs attention
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-2xl">cancel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Recent Duty Earnings</h4>
            <p className="text-sm text-slate-500">Overview of latest remunerations processed</p>
          </div>
          <button onClick={() => navigate("/faculty/myclaims")} className="text-sm font-bold text-primary hover:underline">View History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duty Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Code</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentClaims.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">No recent claims found.</td>
                </tr>
              ) : (
                recentClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => handleViewClaim(claim)}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {claim.created_at ? new Date(claim.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {claim.exam_type} {claim.claim_form_type === 'TEACHING_EXTERNAL' && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">External</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 uppercase">
                      {claim.subject_code || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">
                      ₹{Number(claim.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(claim.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Integration into Dashboard UX */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h4 className="text-lg font-bold text-slate-900">Quick Actions</h4>
          <p className="text-sm text-slate-500">Manage your claims and profile settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">

          <button
            onClick={() => navigate("/faculty/generateclaim")}
            className="p-6 flex flex-col items-center text-center hover:bg-slate-50 transition-colors group cursor-pointer border-none outline-none"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">add_circle</span>
            </div>
            <h5 className="font-bold text-slate-900 mb-1">Create Teaching Claim</h5>
            <p className="text-sm text-slate-500">Submit a new teaching examination remuneration claim</p>
          </button>

          <button
            onClick={() => navigate("/faculty/myclaims")}
            className="p-6 flex flex-col items-center text-center hover:bg-slate-50 transition-colors group cursor-pointer border-none outline-none"
          >
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">history</span>
            </div>
            <h5 className="font-bold text-slate-900 mb-1">View My Claims</h5>
            <p className="text-sm text-slate-500">Track the status of your submitted claims and history</p>
          </button>

          <button
            onClick={() => navigate("/faculty/settings")}
            className="p-6 flex flex-col items-center text-center hover:bg-slate-50 transition-colors group cursor-pointer border-none outline-none"
          >
            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">manage_accounts</span>
            </div>
            <h5 className="font-bold text-slate-900 mb-1">Update Profile</h5>
            <p className="text-sm text-slate-500">Manage your bank details, department, and settings</p>
          </button>

        </div>
      </div>

    </div>
  );
}