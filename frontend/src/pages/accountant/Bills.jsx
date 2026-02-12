import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Icons
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  EyeIcon
} from "../../components/icons/logo";

export default function Bills() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status") || "submitted";
  const facultyId = searchParams.get("facultyId");

  useEffect(() => {
    fetchClaims();
  }, [status, facultyId]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      let url = `/accountant/claims?status=${status}`;
      if (facultyId) {
        url += `&facultyId=${facultyId}`;
      }
      const res = await api.get(url);
      setClaims(res.data);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim =>
    claim.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.exam_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClaimTypeBadge = (type) => {
    const badges = {
      'TEACHING_INTERNAL': { label: 'Teaching Internal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
      'TEACHING_EXTERNAL': { label: 'Teaching External', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
      'NON_TEACHING': { label: 'Non-Teaching', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' }
    };
    return badges[type] || { label: type, color: 'bg-accent text-foreground' };
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    })
  };

  return (
    <motion.div
      className="space-y-6 p-6"
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
        <h1 className="text-3xl font-bold text-card-foreground">Bills Management</h1>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground">Review and process department claim payments</p>
          <AnimatePresence>
            {facultyId && claims.length > 0 && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                  Filtered by: {claims[0]?.faculty_name}
                </span>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/accountant/bills')}
                    className="text-xs"
                  >
                    Clear Filter
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 bg-card border-border">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Status Tabs */}
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setSearchParams({ status: "submitted" })}
                  variant={status === "submitted" ? "default" : "outline"}
                  className={status === "submitted" ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Pending
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setSearchParams({ status: "approved" })}
                  variant={status === "approved" ? "default" : "outline"}
                  className={status === "approved" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Approved
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setSearchParams({ status: "paid" })}
                  variant={status === "paid" ? "default" : "outline"}
                  className={status === "paid" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Paid
                </Button>
              </motion.div>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-96">
              <Input
                type="text"
                placeholder="Search by faculty, subject, or exam type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Claims List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card border-border">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-muted-foreground">Loading claims...</p>
              </motion.div>
            ) : filteredClaims.length === 0 ? (
              <motion.div
                key="empty"
                className="p-12 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <FileTextIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {claims.length === 0 ? "No claims found" : "No matching claims"}
                </h3>
                <p className="text-muted-foreground">
                  {claims.length === 0
                    ? `There are no ${status} claims at the moment.`
                    : "Try adjusting your search criteria."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                className="overflow-x-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Faculty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Exam Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Claim Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredClaims.map((claim, index) => {
                      const badge = getClaimTypeBadge(claim.claim_form_type);
                      return (
                        <motion.tr
                          key={claim.id}
                          className="hover:bg-muted transition-colors"
                          custom={index}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ backgroundColor: "rgba(0,0,0,0.02)", scale: 1.005 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-foreground">
                              {claim.claimant_name || claim.faculty_name || 'Unknown'}
                            </div>
                            {claim.claim_form_type === 'TEACHING_EXTERNAL' && claim.original_faculty_name && (
                              <motion.div
                                className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full inline-block mt-1 border border-blue-100 dark:border-blue-800"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                Ref: {claim.original_faculty_name}
                              </motion.div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">{claim.subject_name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.span
                              className="px-2 py-1 text-xs font-medium bg-accent text-foreground rounded"
                              whileHover={{ scale: 1.1 }}
                            >
                              {claim.exam_type}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.span
                              className={`px-2 py-1 text-xs font-medium rounded ${badge.color}`}
                              whileHover={{ scale: 1.1 }}
                            >
                              {badge.label}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-foreground font-semibold">
                              <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                              {Number(claim.total_amount || 0).toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border ${claim.status === 'paid'
                                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                : claim.status === 'approved'
                                  ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                  : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
                                }`}
                              whileHover={{ scale: 1.1 }}
                            >
                              {claim.status === 'submitted' || claim.status === 'SENT_TO_BILLING' ? 'Pending' :
                                claim.status === 'approved' ? 'Approved' :
                                  'Paid'}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                size="sm"
                                onClick={() => navigate(`/accountant/bills/${claim.id}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </motion.div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <AnimatePresence>
            {filteredClaims.length > 0 && (
              <motion.div
                className="px-6 py-4 bg-muted border-t border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold">{filteredClaims.length}</span> of{" "}
                  <span className="font-semibold">{claims.length}</span> claims
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}
