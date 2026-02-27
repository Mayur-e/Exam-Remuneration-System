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
import ExportFilterModal from "../../components/ExportFilterModal";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
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
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setStats(null);
        setAlerts(null);
        setToastMessage("Failed to load dashboard statistics");
        setToastType("error");
        setTimeout(() => setToastMessage(""), 3000);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (filters) => {
    try {
      // Loading toast
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

      // Success toast
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const statCardVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    }
  };

  const statNumberVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3
      }
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
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <Card className="p-8 text-center max-w-md">
          <motion.div
            animate={{
              x: [0, -5, 5, -5, 5, 0],
              transition: { duration: 0.6 }
            }}
          >
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <p className="text-red-600 text-lg font-medium mb-2">Failed to load dashboard statistics</p>
          <p className="text-muted-foreground mb-6">Please check your connection and try again</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Retry Loading
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Custom Toast Animation */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${toastType === "success"
                ? "bg-green-600 text-white"
                : toastType === "error"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <ExportFilterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isAdmin={true}
      />

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center"
          >
            <FileTextIcon className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">System-wide overview and supervision</p>
          </div>
        </div>
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
          icon={<FileTextIcon className="w-6 h-6" />}
          bgColor="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-card/80"
          borderColor="border-blue-200 dark:border-blue-800/50"
          textColor="text-blue-700 dark:text-blue-300"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Submitted Claims"
          value={stats.submitted_claims || 0}
          subtitle="Pending review"
          icon={<ClockIcon className="w-6 h-6" />}
          bgColor="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-card/80"
          borderColor="border-orange-200 dark:border-orange-800/50"
          textColor="text-orange-700 dark:text-orange-300"
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
          animateIcon={true}
        />

        <StatCard
          title="Approved Claims"
          value={stats.approved_claims || 0}
          subtitle="Ready for payment"
          icon={<CheckCircleIcon className="w-6 h-6" />}
          bgColor="bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-card/80"
          borderColor="border-green-200 dark:border-green-800/50"
          textColor="text-green-700 dark:text-green-300"
          iconBg="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />

        <StatCard
          title="Paid Claims"
          value={stats.paid_claims || 0}
          subtitle="Completed"
          icon={<CheckCircleIcon className="w-6 h-6" />}
          bgColor="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-card/80"
          borderColor="border-emerald-200 dark:border-emerald-800/50"
          textColor="text-emerald-700 dark:text-emerald-300"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          pulseIcon={true}
        />

        <StatCard
          title="Rejected Claims"
          value={stats.rejected_claims || 0}
          subtitle="Needs correction"
          icon={<XCircleIcon className="w-6 h-6" />}
          bgColor="bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-card/80"
          borderColor="border-red-200 dark:border-red-800/50"
          textColor="text-red-700 dark:text-red-300"
          iconBg="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
        />

        <StatCard
          title="External Claims"
          value={stats.external_claims || 0}
          subtitle="External examiners"
          icon={<UsersIcon className="w-6 h-6" />}
          bgColor="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-card/80"
          borderColor="border-purple-200 dark:border-purple-800/50"
          textColor="text-purple-700 dark:text-purple-300"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </motion.div>

      {/* Alerts Section */}
      <AnimatePresence>
        {alerts && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.3 }}
          >
            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    transition: { duration: 2, repeat: Infinity }
                  }}
                >
                  <AlertCircleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </motion.div>
                <h2 className="text-xl font-semibold text-foreground">System Alerts</h2>
              </div>
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4 text-muted-foreground"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500 dark:text-green-400" />
                    </motion.div>
                    <p>No alerts at this time. System is running smoothly.</p>
                  </motion.div>
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
        transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.4 }}
      >
        <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={() => navigate("/admin/claims")}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FileTextIcon className="w-5 h-5 mr-2" />
                View All Claims
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={() => navigate("/admin/faculty")}
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
              >
                <UsersIcon className="w-5 h-5 mr-2" />
                Faculty Oversight
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={() => navigate("/admin/audit-logs")}
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
              >
                <FileTextIcon className="w-5 h-5 mr-2" />
                Audit Logs
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                onClick={() => setIsExportModalOpen(true)}
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold"
              >
                <FileTextIcon className="w-5 h-5 mr-2" />
                Export Billing Excel
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, bgColor, borderColor, textColor, iconBg, iconColor, animateIcon = false, pulseIcon = false }) {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0, scale: 0.9 },
        visible: {
          y: 0,
          opacity: 1,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 15
          }
        }
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className={`p-6 ${bgColor} border ${borderColor} hover:shadow-lg transition-all duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <motion.h3
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
              className={`text-2xl font-bold ${textColor}`}
            >
              {value}
            </motion.h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <motion.div
            className={`p-3 rounded-lg ${iconBg}`}
            animate={
              animateIcon
                ? { rotate: [0, 10, 0, -10, 0], transition: { duration: 4, repeat: Infinity, ease: "linear" } }
                : pulseIcon
                  ? { scale: [1, 1.1, 1], transition: { duration: 2, repeat: Infinity } }
                  : {}
            }
            whileHover={!animateIcon && !pulseIcon ? { rotate: 360 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className={`${iconColor}`}>
              {icon}
            </div>
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

  const iconAnimations = {
    warning: { scale: [1, 1.2, 1], transition: { duration: 2, repeat: Infinity } },
    error: { x: [0, -2, 2, -2, 2, 0], transition: { duration: 0.5, repeat: Infinity } },
    info: { rotate: [0, 5, 0, -5, 0], transition: { duration: 3, repeat: Infinity } }
  };

  return (
    <motion.div
      className={`${colors[type]} border rounded-lg p-4 flex items-center justify-between`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
      whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={iconAnimations[type]}
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