import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/billing-sheet', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Billing_Sheet_Export.xlsx');
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export billing sheet");
    }
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center space-y-4">
          <motion.div
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </motion.div>
    );
  }

  if (!stats) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="p-8 text-center">
          <p className="text-red-600">Failed to load dashboard statistics</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold text-card-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide overview and supervision</p>
      </motion.div>

      {/* System Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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
      </motion.div>

      {/* Alerts Section */}
      <AnimatePresence>
        {alerts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
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
                    message={`${alerts.repeated_rejections} claim(s) with previous rejections (Resubmitted)`}
                    action={() => navigate("/admin/claims?status=submitted&rejection_history=true")}
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
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No alerts at this time. System is running smoothly.</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/admin/claims")}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FileTextIcon className="w-5 h-5 mr-2" />
                View All Claims
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/admin/faculty")}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold"
              >
                <UsersIcon className="w-5 h-5 mr-2" />
                Faculty Oversight
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate("/admin/audit-logs")}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold"
              >
                <FileTextIcon className="w-5 h-5 mr-2" />
                Audit Logs
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 font-semibold"
              >
                <FileTextIcon className="w-5 h-5 mr-2" />
                Export Billing Excel
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, subtitle, icon, bgColor, borderColor, textColor }) {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
          }
        }
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className={`p-6 ${bgColor} border ${borderColor} hover:shadow-lg transition-shadow duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <motion.h3
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`text-2xl font-bold ${textColor}`}
            >
              {value}
            </motion.h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <motion.div
            className={`p-3 rounded-lg ${bgColor}`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            {icon}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

function AlertItem({ type, message, action, actionLabel }) {
  const colors = {
    warning: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
  };

  const iconColors = {
    warning: "text-orange-600 dark:text-orange-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400"
  };

  return (
    <motion.div
      className={`${colors[type]} border rounded-lg p-4 flex items-center justify-between`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertCircleIcon className={`w-5 h-5 ${iconColors[type]}`} />
        </motion.div>
        <p className="font-medium">{message}</p>
      </div>
      {action && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={action}
            size="sm"
            variant="outline"
            className="ml-4"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
