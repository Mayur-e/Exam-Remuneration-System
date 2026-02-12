import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import {
  FileTextIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  ClockIcon,
  XIcon,
  QueryIcon,
  FlagIcon,
  PdfIcon
} from "../../components/icons/logo";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [claims, searchTerm, statusFilter]);

  const fetchClaims = async () => {
    try {
      const res = await api.get("/faculty/exams");
      setClaims(res.data || []);
    } catch (err) {
      console.error("Failed to fetch claims", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let result = [...claims];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        (c.subject_name || "").toLowerCase().includes(term) ||
        (c.exam_type || "").toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(c => c.status === statusFilter);
    }

    setFilteredClaims(result);
  };

  const handleView = (claim) => {
    if (claim.claim_form_type === 'NON_TEACHING') {
      navigate(`/faculty/claim/non-teaching?examId=${claim.id}`);
    } else if (claim.claim_form_type === 'TEACHING_EXTERNAL') {
      navigate(`/faculty/claim/teaching?examId=${claim.id}&claimType=TEACHING_EXTERNAL`);
    } else {
      navigate(`/faculty/claim/teaching?examId=${claim.id}`);
    }
  };

  const handleCopyExternalLink = async (claim) => {
    try {
      if (claim.external_link_token) {
        const link = `${window.location.origin}/external/claim/${claim.external_link_token}`;
        await navigator.clipboard.writeText(link);

        // Custom toast animation
        setToastMessage("External examiner link copied to clipboard! Share this link with the external examiner to resubmit the claim.");
        setToastType("success");
        setTimeout(() => setToastMessage(""), 5000);
      } else {
        setToastMessage("External link not found (Token missing). Please contact support.");
        setToastType("error");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
      setToastMessage("Failed to copy link");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleDownloadPDF = (claim) => {
    try {
      // Custom toast animation
      setToastMessage("Opening PDF...");
      setToastType("info");
      setTimeout(() => setToastMessage(""), 2000);

      const endpoint = claim.claim_form_type === 'NON_TEACHING'
        ? `/pdf/non-teaching/${claim.id}/download`
        : `/pdf/claim/${claim.id}/download`;

      const token = localStorage.getItem("token");
      const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
      const url = `${baseURL}${endpoint}?token=${token}&view=true`;

      window.open(url, '_blank');

    } catch (err) {
      console.error("Failed to open PDF:", err);
      setToastMessage("Failed to open PDF");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: {
        label: "draft",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: <XIcon className="w-3 h-3" />
      },
      submitted: {
        label: "Submitted",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: <ClockIcon className="w-3 h-3" />
      },
      UNDER_COORDINATOR_REVIEW: {
        label: "Under Review (Coord)",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        icon: <ClockIcon className="w-3 h-3" />
      },
      COORDINATOR_VERIFIED: {
        label: "Verified",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        icon: <ClockIcon className="w-3 h-3" />
      },
      SENT_TO_BILLING: {
        label: "Sent to Billing",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        icon: <ClockIcon className="w-3 h-3" />
      },
      approved: {
        label: "Approved",
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: <CheckCircleIcon className="w-3 h-3" />
      },
      paid: {
        label: "Paid",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        icon: <CheckCircleIcon className="w-3 h-3" />
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: <XIcon className="w-3 h-3" />
      },
      COORDINATOR_REJECTED: {
        label: "Rejected (Coord)",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: <XIcon className="w-3 h-3" />
      }
    };

    const s = config[status] || config.submitted;

    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.color}`}
      >
        {s.icon}
        {s.label}
      </motion.span>
    );
  };

  const getStatusCount = (status) => {
    if (status === 'submitted') {
      return claims.filter(c => ['submitted', 'UNDER_COORDINATOR_REVIEW', 'COORDINATOR_VERIFIED', 'SENT_TO_BILLING'].includes(c.status)).length;
    }
    if (status === 'rejected') {
      return claims.filter(c => ['rejected', 'COORDINATOR_REJECTED'].includes(c.status)).length;
    }
    return claims.filter(c => c.status === status).length;
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

  const statCardVariants = {
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

  const claimCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
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
        delay: 0.2
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-3"
          ></motion.div>
          <p className="text-muted-foreground">Loading your claims...</p>
        </motion.div>
      </Card>
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-foreground">My Claims</h1>
        <p className="text-muted-foreground">Submitted examination claims</p>
      </motion.div>

      {/* Stats with staggered animations */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        {/* Total Claims */}
        <motion.div variants={statCardVariants}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card/80 border-border hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Claims</p>
                  <motion.h2
                    key={claims.length}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-foreground"
                  >
                    {claims.length}
                  </motion.h2>
                </div>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-muted rounded-full"
                >
                  <FileTextIcon className="w-8 h-8 text-foreground" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Submitted */}
        <motion.div variants={statCardVariants}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-card/80 border-orange-100 dark:border-orange-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Submitted</p>
                  <motion.h2
                    key={getStatusCount("submitted")}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-orange-700 dark:text-orange-300"
                  >
                    {getStatusCount("submitted")}
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

        {/* Approved */}
        <motion.div variants={statCardVariants}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-card/80 border-green-100 dark:border-green-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Approved</p>
                  <motion.h2
                    key={getStatusCount("approved")}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-green-700 dark:text-green-300"
                  >
                    {getStatusCount("approved")}
                  </motion.h2>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full"
                >
                  <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Paid */}
        <motion.div variants={statCardVariants}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-card/80 border-blue-100 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Paid</p>
                  <motion.h2
                    key={getStatusCount("paid")}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-blue-700 dark:text-blue-300"
                  >
                    {getStatusCount("paid")}
                  </motion.h2>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                >
                  <CheckCircleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Rejected */}
        <motion.div variants={statCardVariants}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-card/80 border-red-100 dark:border-red-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Rejected</p>
                  <motion.h2
                    key={getStatusCount("rejected")}
                    variants={statNumberVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-bold text-red-700 dark:text-red-300"
                  >
                    {getStatusCount("rejected")}
                  </motion.h2>
                </div>
                <motion.div
                  whileHover={{ x: [-2, 2, -2, 2, 0] }}
                  transition={{ duration: 0.5 }}
                  className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full"
                >
                  <XIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex-1 relative"
            >
              <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 border-border focus:border-blue-500"
                placeholder="Search by subject or exam type"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </motion.div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="UNDER_COORDINATOR_REVIEW">Under Review (Coord)</option>
                <option value="SENT_TO_BILLING">Sent to Billing</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* List */}
      {filteredClaims.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center">
            <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No claims found</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredClaims.map((c, index) => (
            <motion.div
              key={`claim-${c.id}-${index}`}
              variants={claimCardVariants}
              whileHover={{ y: -5, scale: 1.005 }}
              className="hover:shadow-lg transition-shadow"
            >
              <Card className="p-6 border-border hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">
                        {c.subject_name || "Unnamed Subject"}
                      </h3>
                      {c.claim_form_type === 'TEACHING_EXTERNAL' && (
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-700"
                        >
                          External Examiner
                        </motion.span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Exam Type:</span> {c.exam_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Program:</span> {c.program} - {c.level}
                      </p>
                      {c.status === 'rejected' && c.claim_form_type === 'TEACHING_EXTERNAL' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded mt-2 border border-red-200 dark:border-red-800"
                        >
                          ⚠️ Share the link with external examiner to resubmit
                        </motion.p>
                      )}
                      <motion.p
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-base font-semibold text-green-700 dark:text-green-400 mt-2"
                      >
                        ₹ {Number(c.total_amount || 0).toLocaleString('en-IN')}
                      </motion.p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(c.status)}
                    <div className="flex gap-2">
                      {c.status === 'rejected' && c.claim_form_type === 'TEACHING_EXTERNAL' && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="sm"
                            onClick={() => handleCopyExternalLink(c)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            title="Copy link to share with external examiner"
                          >
                            <motion.svg
                              whileHover={{ rotate: 180 }}
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </motion.svg>
                            Copy Link
                          </Button>
                        </motion.div>
                      )}
                      {(['submitted', 'UNDER_COORDINATOR_REVIEW', 'COORDINATOR_VERIFIED', 'SENT_TO_BILLING', 'approved', 'paid'].includes(c.status)) && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="sm"
                            onClick={() => handleDownloadPDF(c)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            title="Download PDF"
                          >
                            <PdfIcon className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </motion.div>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(c)}
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </motion.div>
                      {c.status !== 'draft' && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/faculty/queries?claim_id=${c.id}`);
                            }}
                            title="Report an issue"
                          >
                            <FlagIcon className="w-4 h-4 mr-1" />
                            Report
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}