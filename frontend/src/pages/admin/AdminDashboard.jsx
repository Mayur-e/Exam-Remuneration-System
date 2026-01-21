import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// Icons
import {
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  UsersIcon
} from "../../components/icons/logo";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/dashboard/stats")
      .then(res => {
        setStats(res.data.stats);
        setAlerts(res.data.alerts);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setStats(null);
        setAlerts(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-red-600">Failed to load dashboard statistics</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">System-wide overview and supervision</p>
      </div>

      {/* System Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Claims"
          value={stats.total_claims || 0}
          subtitle="All claims"
          icon={<FileTextIcon className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          textColor="text-blue-600"
        />

        <StatCard
          title="Submitted Claims"
          value={stats.submitted_claims || 0}
          subtitle="Pending review"
          icon={<ClockIcon className="w-6 h-6 text-orange-600" />}
          bgColor="bg-orange-50"
          borderColor="border-orange-200"
          textColor="text-orange-600"
        />

        <StatCard
          title="Approved Claims"
          value={stats.approved_claims || 0}
          subtitle="Ready for payment"
          icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-50"
          borderColor="border-green-200"
          textColor="text-green-600"
        />

        <StatCard
          title="Paid Claims"
          value={stats.paid_claims || 0}
          subtitle="Completed"
          icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
          textColor="text-emerald-600"
        />

        <StatCard
          title="Rejected Claims"
          value={stats.rejected_claims || 0}
          subtitle="Needs correction"
          icon={<XCircleIcon className="w-6 h-6 text-red-600" />}
          bgColor="bg-red-50"
          borderColor="border-red-200"
          textColor="text-red-600"
        />

        <StatCard
          title="External Claims"
          value={stats.external_claims || 0}
          subtitle="External examiners"
          icon={<UsersIcon className="w-6 h-6 text-purple-600" />}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          textColor="text-purple-600"
        />
      </div>

      {/* Alerts Section */}
      {alerts && (
        <Card className="p-6 bg-white border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircleIcon className="w-6 h-6 text-orange-600" />
            System Alerts
          </h2>
          <div className="space-y-3">
            {alerts.pending_beyond_limit > 0 && (
              <AlertItem
                type="warning"
                message={`${alerts.pending_beyond_limit} claim(s) pending beyond 7 days`}
                action={() => navigate("/admin/claims?status=submitted")}
                actionLabel="View Claims"
              />
            )}

            {alerts.repeated_rejections > 0 && (
              <AlertItem
                type="error"
                message={`${alerts.repeated_rejections} claim(s) with repeated rejections`}
                action={() => navigate("/admin/claims?status=rejected")}
                actionLabel="Review"
              />
            )}

            {alerts.external_without_docs > 0 && (
              <AlertItem
                type="warning"
                message={`${alerts.external_without_docs} external claim(s) without complete documents`}
                action={() => navigate("/admin/external")}
                actionLabel="Verify"
              />
            )}

            {alerts.rate_mismatch_flags > 0 && (
              <AlertItem
                type="info"
                message={`${alerts.rate_mismatch_flags} claim(s) with minimum rate applied`}
                action={() => navigate("/admin/claims")}
                actionLabel="Review"
              />
            )}

            {!alerts.pending_beyond_limit && !alerts.repeated_rejections && !alerts.external_without_docs && !alerts.rate_mismatch_flags && (
              <div className="text-center py-4 text-gray-500">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No alerts at this time. System is running smoothly.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6 bg-white border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate("/admin/claims")}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FileTextIcon className="w-5 h-5 mr-2" />
            View All Claims
          </Button>

          <Button
            onClick={() => navigate("/admin/faculty")}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold"
          >
            <UsersIcon className="w-5 h-5 mr-2" />
            Faculty Oversight
          </Button>

          <Button
            onClick={() => navigate("/admin/audit-logs")}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold"
          >
            <FileTextIcon className="w-5 h-5 mr-2" />
            Audit Logs
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, bgColor, borderColor, textColor }) {
  return (
    <Card className={`p-6 ${bgColor} border ${borderColor} hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${textColor}`}>{value}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function AlertItem({ type, message, action, actionLabel }) {
  const colors = {
    warning: "bg-orange-50 border-orange-200 text-orange-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const iconColors = {
    warning: "text-orange-600",
    error: "text-red-600",
    info: "text-blue-600"
  };

  return (
    <div className={`${colors[type]} border rounded-lg p-4 flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <AlertCircleIcon className={`w-5 h-5 ${iconColors[type]}`} />
        <p className="font-medium">{message}</p>
      </div>
      {action && (
        <Button
          onClick={action}
          size="sm"
          variant="outline"
          className="ml-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
