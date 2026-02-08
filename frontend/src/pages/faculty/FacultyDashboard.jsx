import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/useToast";

// Icons
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  PlusIcon,
  FileTextIcon,
  XCircleIcon
} from "../../components/icons/logo";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    approved_count: 0,
    pending_count: 0,
    rejected_count: 0,
    total_amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  useEffect(() => {
    fetchStats();

    // Check if we should show bank details notification
    const shouldShowNotification = localStorage.getItem("showBankDetailsNotification");
    if (shouldShowNotification === "true") {
      // Custom toast animation for bank details
      setToastMessage("Please complete your bank account details in the Settings tab");
      setToastType("warning");
      setTimeout(() => setToastMessage(""), 10000);
      
      // Remove the flag so it doesn't show again
      localStorage.removeItem("showBankDetailsNotification");
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/faculty/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
      // Error toast animation
      setToastMessage("Failed to fetch dashboard statistics");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Custom toast animation
  const showCustomToast = (message, type = "info", duration = 5000) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(""), duration);
  };

  // Animation variants
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

  const cardHoverVariants = {
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.98
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
        delay: 0.2
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-64"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        ></motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Toast Animation */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${
              toastType === "warning" 
                ? "bg-amber-600 text-white" 
                : toastType === "error"
                ? "bg-red-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your claims overview</p>
        </div>
      </motion.div>

      {/* Stats Cards with staggered animations */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Approved Claims */}
        <motion.div variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-card border-green-100 dark:border-green-800/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Approved Claims</p>
                  <motion.h2 
                    key={stats.approved_count}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-green-700 dark:text-green-300"
                  >
                    {stats.approved_count}
                  </motion.h2>
                </div>
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full"
                >
                  <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Pending Claims */}
        <motion.div variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-card border-orange-100 dark:border-orange-800/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Pending Claims</p>
                  <motion.h2 
                    key={stats.pending_count}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-orange-700 dark:text-orange-300"
                  >
                    {stats.pending_count}
                  </motion.h2>
                </div>
                <motion.div 
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full"
                >
                  <ClockIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Rejected Claims */}
        <motion.div variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-card border-red-100 dark:border-red-800/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Rejected Claims</p>
                  <motion.h2 
                    key={stats.rejected_count}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-red-700 dark:text-red-300"
                  >
                    {stats.rejected_count || 0}
                  </motion.h2>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full"
                >
                  <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Total Amount */}
        <motion.div variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-card border-blue-100 dark:border-blue-800/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Payable</p>
                  <motion.h2 
                    key={stats.total_amount}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-blue-700 dark:text-blue-300"
                  >
                    ₹{Number(stats.total_amount || 0).toLocaleString('en-IN')}
                  </motion.h2>
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                >
                  <CurrencyRupeeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quick Actions with animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={() => navigate("/faculty/generateclaim")}
                className="justify-start h-auto py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors w-full"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                  >
                    <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Create Teaching Claim</p>
                    <p className="text-sm text-muted-foreground">Submit new teaching examination claim</p>
                  </div>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={() => navigate("/faculty/myclaims")}
                className="justify-start h-auto py-4 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-colors w-full"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"
                  >
                    <FileTextIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">View My Claims</p>
                    <p className="text-sm text-muted-foreground">Check status of submitted claims</p>
                  </div>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={() => navigate("/faculty/settings")}
                className="justify-start h-auto py-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors w-full"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"
                  >
                    <FileTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Update Profile</p>
                    <p className="text-sm text-muted-foreground">Manage bank details and settings</p>
                  </div>
                </div>
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Additional Stats or Info (Optional) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center py-8"
      >
        <p className="text-sm text-muted-foreground">
          Need help? Contact the billing department at <span className="text-blue-600 dark:text-blue-400">billing@pccoepune.org</span>
        </p>
      </motion.div>
    </div>
  );
}