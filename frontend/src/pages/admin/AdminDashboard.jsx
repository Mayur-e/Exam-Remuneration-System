import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ExportFilterModal from "../../components/ExportFilterModal";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [deptExpenditures, setDeptExpenditures] = useState(null);
  const [recentClaims, setRecentClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/dashboard/stats")
      .then(res => {
        setStats(res.data.stats);
        setAlerts(res.data.alerts);
        setDeptExpenditures(res.data.department_expenditures);
        setRecentClaims(res.data.recent_claims);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setStats(null);
        setAlerts(null);
        setDeptExpenditures(null);
        setRecentClaims(null);
        setToastMessage("Failed to load dashboard statistics");
        setToastType("error");
        setTimeout(() => setToastMessage(""), 3000);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (filters) => {
    try {
      setToastMessage("Generating export...");
      setToastType("info");

      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/admin/export/billing-sheet?${queryString}` : '/admin/export/billing-sheet';

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Billing_Sheet_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMessage("Export downloaded successfully!");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (error) {
      console.error("Export failed:", error);
      setToastMessage("Failed to export billing sheet");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-4 block">error</span>
          <p className="text-red-600 text-lg font-bold mb-2">Failed to load dashboard statistics</p>
          <p className="text-slate-500 mb-6">Please check your connection and try again</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#84cc16'];

  const chartData = deptExpenditures ? deptExpenditures.map((dept, index) => ({
    name: dept.department,
    value: Number(dept.total_expenditure) || 0,
    color: COLORS[index % COLORS.length]
  })).filter(item => item.value > 0) : [];

  const barData = deptExpenditures ? deptExpenditures.map((dept) => ({
    name: dept.department,
    Expenditure: Number(dept.total_expenditure) || 0
  })).filter(item => item.Expenditure > 0) : [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 font-bold transition-all animate-in slide-in-from-top-2 flex items-center gap-2 ${toastType === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
          toastType === "error" ? "bg-red-50 text-red-600 border border-red-200" :
            "bg-blue-50 text-blue-600 border border-blue-200"
          }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toastType === "success" ? "check_circle" : toastType === "error" ? "error" : "info"}
          </span>
          {toastMessage}
        </div>
      )}

      {/* Export Modal */}
      <ExportFilterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isAdmin={true}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">System-wide overview and supervision</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">upgrade</span>
            Export Excel
          </button>
          <span className="material-symbols-outlined text-primary text-2xl bg-primary/10 p-2 rounded-xl">dashboard</span>
        </div>
      </div>

      {/* System Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-slate-400">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Claims</p>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">receipt_long</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900">{stats.total_claims || 0}</h3>
            <p className="text-sm font-bold text-slate-500">₹{Number(stats.total_amount || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted</p>
            <span className="material-symbols-outlined text-amber-500 text-[18px]">pending_actions</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900">{stats.submitted_claims || 0}</h3>
            <p className="text-sm font-bold text-amber-600">₹{Number(stats.submitted_amount || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
            <span className="material-symbols-outlined text-blue-500 text-[18px]">fact_check</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900">{stats.approved_claims || 0}</h3>
            <p className="text-sm font-bold text-blue-600">₹{Number(stats.approved_amount || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Paid</p>
            <span className="material-symbols-outlined text-emerald-500 text-[18px]">payments</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900">{stats.paid_claims || 0}</h3>
            <p className="text-sm font-bold text-emerald-600">₹{Number(stats.paid_amount || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md border-l-4 border-l-red-500">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
            <span className="material-symbols-outlined text-red-500 text-[18px]">cancel</span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900">{stats.rejected_claims || 0}</h3>
            <p className="text-sm font-bold text-red-600">₹{Number(stats.rejected_amount || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Recent Claims Section */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">history</span>
          <h2 className="text-lg font-bold text-slate-800">Recent Claims</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentClaims && recentClaims.length > 0 ? (
            recentClaims.map((claim) => (
              <div key={claim.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {claim.exam_type?.replace(/_/g, ' ') || 'Exam'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${claim.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      claim.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                      }`}>
                      {claim.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2" title={claim.subject_name}>
                    {claim.subject_name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{claim.claimant_name} &bull; {claim.department || 'External'}</p>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                    <p className="font-black text-lg text-slate-900">
                      {claim.net_amount ? `₹${claim.net_amount}` : 'Pending'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/claims/${claim.id}`)}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-primary/10 text-slate-400 hover:text-primary flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500 text-sm">
              No recent claims available.
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500 text-[20px]">pie_chart</span>
              <h2 className="text-lg font-bold text-slate-800">Expenditures Ratio</h2>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">pie_chart</span>
                <p className="font-medium text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-[20px]">bar_chart</span>
              <h2 className="text-lg font-bold text-slate-800">Department Expenditures</h2>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <RechartsTooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                <Bar dataKey="Expenditure" radius={[4, 4, 0, 0]} barSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">notifications_active</span>
            <h2 className="text-lg font-bold text-slate-800">System Alerts</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[200px]">
            {alerts && (
              <div className="space-y-3">
                {alerts.pending_beyond_limit > 0 && (
                  <AlertItem
                    type="warning"
                    icon="warning"
                    message={`${alerts.pending_beyond_limit} claim(s) pending beyond 7 days`}
                    action={() => navigate("/admin/claims?status=submitted")}
                    actionLabel="View Claims"
                  />
                )}

                {alerts.repeated_rejections > 0 && (
                  <AlertItem
                    type="error"
                    icon="error"
                    message={`${alerts.repeated_rejections} claim(s) with previous rejections`}
                    action={() => navigate("/admin/claims?status=submitted")}
                    actionLabel="Review"
                  />
                )}

                {alerts.external_without_docs > 0 && (
                  <AlertItem
                    type="warning"
                    icon="description"
                    message={`${alerts.external_without_docs} external claim(s) without complete documents`}
                    action={() => navigate("/admin/external")}
                    actionLabel="Verify"
                  />
                )}

                {alerts.rate_mismatch_flags > 0 && (
                  <AlertItem
                    type="info"
                    icon="info"
                    message={`${alerts.rate_mismatch_flags} claim(s) with minimum rate applied`}
                    action={() => navigate("/admin/claims")}
                    actionLabel="Review"
                  />
                )}

                {!alerts.pending_beyond_limit && !alerts.repeated_rejections && !alerts.external_without_docs && !alerts.rate_mismatch_flags && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <span className="material-symbols-outlined text-4xl text-emerald-100 mb-2 block">task_alt</span>
                    <p className="font-medium text-slate-500">No alerts at this time. System is running smoothly.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">bolt</span>
            <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <button
              onClick={() => navigate("/admin/claims")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 text-slate-700 font-bold transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <span className="flex-1">View All Claims</span>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
            </button>

            <button
              onClick={() => navigate("/admin/faculty")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 text-slate-700 font-bold transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <span className="flex-1">Faculty Oversight</span>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
            </button>

            <button
              onClick={() => navigate("/admin/audit-logs")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 text-slate-700 font-bold transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">history</span>
              </div>
              <span className="flex-1">Audit Logs</span>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ type, icon, message, action, actionLabel }) {
  const styles = {
    warning: "bg-orange-50 border-orange-200 text-orange-900 icon-orange-500",
    error: "bg-red-50 border-red-200 text-red-900 icon-red-500",
    info: "bg-blue-50 border-blue-200 text-blue-900 icon-blue-500"
  }[type];

  // Extract base classes for icon color mapping
  const iconColorClass = type === 'warning' ? 'text-orange-500' : type === 'error' ? 'text-red-500' : 'text-blue-500';

  return (
    <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${styles}`}>
      <div className="flex items-center gap-3 flex-1">
        <span className={`material-symbols-outlined ${iconColorClass} text-[24px]`}>{icon}</span>
        <p className="font-bold text-sm">{message}</p>
      </div>
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-sm shrink-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}