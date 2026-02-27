import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

// Icons
import {
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  FileTextIcon
} from "../../components/icons/logo";
import ExportFilterModal from "../../components/ExportFilterModal";

export default function AccountantDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/accountant/dashboard")
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (filters) => {
    try {
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
        exit={{ opacity: 0 }}
      >
        <div className="text-center space-y-4">
          <motion.div
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
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
      className="space-y-8 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <ExportFilterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isAdmin={false}
      />

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold text-card-foreground">Billing Incharge Dashboard</h1>
        <p className="text-muted-foreground">Department financial overview and payment management</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Pending Claims */}
        <motion.div variants={itemVariants}>
          <StatCard
            title="Pending Payment"
            value={stats.pending_count || 0}
            subtitle={`₹${Number(stats.pending_amount || 0).toLocaleString('en-IN')}`}
            icon={<ClockIcon className="w-6 h-6 text-orange-600" />}
            bgColor="bg-orange-50 dark:bg-orange-900/20"
            borderColor="border-orange-200 dark:border-orange-800"
            textColor="text-orange-600 dark:text-orange-400"
          />
        </motion.div>

        {/* Paid Claims */}
        <motion.div variants={itemVariants}>
          <StatCard
            title="Paid Claims"
            value={stats.paid_count || 0}
            subtitle={`₹${Number(stats.paid_amount || 0).toLocaleString('en-IN')}`}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
            bgColor="bg-green-50 dark:bg-green-900/20"
            borderColor="border-green-200 dark:border-green-800"
            textColor="text-green-600 dark:text-green-400"
          />
        </motion.div>

        {/* Total Amount */}
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Amount"
            value={`₹${Number(stats.total_amount || 0).toLocaleString('en-IN')}`}
            subtitle="All claims"
            icon={<CurrencyRupeeIcon className="w-6 h-6 text-blue-600" />}
            bgColor="bg-blue-50 dark:bg-blue-900/20"
            borderColor="border-blue-200 dark:border-blue-800"
            textColor="text-blue-600 dark:text-blue-400"
          />
        </motion.div>

        {/* Pending Amount */}
        <motion.div variants={itemVariants}>
          <StatCard
            title="Pending Amount"
            value={`₹${Number(stats.pending_amount || 0).toLocaleString('en-IN')}`}
            subtitle="Awaiting payment"
            icon={<FileTextIcon className="w-6 h-6 text-purple-600" />}
            bgColor="bg-purple-50 dark:bg-purple-900/20"
            borderColor="border-purple-200 dark:border-purple-800"
            textColor="text-purple-600 dark:text-purple-400"
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/accountant/bills?status=submitted")}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full"
              >
                <ClockIcon className="w-5 h-5 mr-2" />
                View Pending Bills ({stats.pending_count || 0})
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/accountant/bills?status=paid")}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold w-full"
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                View Paid Bills ({stats.paid_count || 0})
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/accountant/faculty")}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold w-full"
              >
                <FileTextIcon className="w-5 h-5 mr-2" />
                Faculty Directory
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setIsExportModalOpen(true)}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold w-full"
              >
                <FileTextIcon className="w-5 h-5 mr-2" />
                Export Billing Excel
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Summary Info */}
      <AnimatePresence>
        {stats.pending_count > 0 && (
          <motion.div
            className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-300">
                {stats.pending_count} claim{stats.pending_count !== 1 ? 's' : ''} awaiting payment
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Total pending amount: ₹{Number(stats.pending_amount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ title, value, subtitle, icon, bgColor, borderColor, textColor }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`p-6 ${bgColor} border ${borderColor} hover:shadow-lg transition-shadow duration-300`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <motion.h3
              className={`text-2xl font-bold ${textColor}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <motion.div
            className={`p-3 rounded-lg ${bgColor}`}
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            {icon}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
