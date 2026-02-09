import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Icons
import {
  FileTextIcon,
  UserIcon,
  UsersIcon,
  ClockIcon,
  TrashIcon,
  EditIcon,
  SearchIcon
} from "../../components/icons/logo";

export default function GenerateClaim() {
  const navigate = useNavigate();

  const handleEditDraft = (draft) => {
    // Route to appropriate form based on claim_form_type
    if (draft.claim_form_type === 'NON_TEACHING') {
      navigate(`/faculty/claim/non-teaching?examId=${draft.id}`);
    } else if (draft.claim_form_type === 'TEACHING_EXTERNAL') {
      navigate(`/faculty/claim/teaching?examId=${draft.id}&claimType=TEACHING_EXTERNAL`);
    } else {
      // Default to TEACHING_INTERNAL
      navigate(`/faculty/claim/teaching?examId=${draft.id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Header with animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Generate Claim</h1>
        <p className="text-muted-foreground">Create new claims or continue from saved drafts</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Claim Type Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
              >
                <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h2 className="text-xl font-semibold text-foreground">Select Claim Type</h2>
            </div>

            <div className="space-y-4">
              {/* Teaching Internal */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-4 border border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                  <Button
                    onClick={() => navigate("/faculty/claim/teaching?claimType=TEACHING_INTERNAL")}
                    className="w-full h-auto py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                      >
                        <UserIcon className="w-6 h-6" />
                      </motion.div>
                      <span className="text-lg">Teaching Staff Claim</span>
                      <span className="text-sm opacity-90">(Internal Examiner)</span>
                    </div>
                  </Button>
                </div>
              </motion.div>

              {/* Teaching External */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-4 border border-border rounded-lg hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/faculty/claim/teaching?claimType=TEACHING_EXTERNAL")}
                    className="w-full h-auto py-4 border-green-400 dark:border-green-600 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                      >
                        <UsersIcon className="w-6 h-6" />
                      </motion.div>
                      <span className="text-lg">Teaching Staff Claim</span>
                      <span className="text-sm opacity-90">(External Examiner)</span>
                    </div>
                  </Button>
                </div>
              </motion.div>

              {/* Non-Teaching */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-4 border border-border rounded-lg hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                  <Button
                    onClick={() => navigate("/faculty/claim/non-teaching")}
                    variant="outline"
                    className="w-full h-auto py-4 border-purple-400 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-semibold"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                      >
                        <UsersIcon className="w-6 h-6" />
                      </motion.div>
                      <span className="text-lg">Non-Teaching Staff Claim</span>
                      <span className="text-sm opacity-90">(Support Staff)</span>
                    </div>
                  </Button>
                </div>
              </motion.div>
            </div>
          </Card>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-3 bg-white dark:bg-card rounded-lg border border-border"
                >
                  <p className="text-sm text-muted-foreground">Average Processing</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">7-10 Days</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-3 bg-white dark:bg-card rounded-lg border border-border"
                >
                  <p className="text-sm text-muted-foreground">TDS Rate</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">10%</p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Right Column: Drafts List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DraftList onEdit={handleEditDraft} />
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Draft List Component                                                */
/* ------------------------------------------------------------------ */

function DraftList({ onEdit }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const fetchingRef = useRef(false);

  const fetchDrafts = () => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      console.log('Already fetching drafts, skipping...');
      return;
    }

    fetchingRef.current = true;
    setLoading(true);

    api
      .get("/faculty/drafts")
      .then((res) => {
        console.log('Fetched drafts:', res.data);
        // Ensure we're setting a fresh array, not appending
        setDrafts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Error fetching drafts:', err);
        setDrafts([]);
      })
      .finally(() => {
        setLoading(false);
        fetchingRef.current = false;
      });
  };

  useEffect(() => {
    fetchDrafts();

    // Refetch when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, refetching drafts...');
        fetchDrafts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) return;

    try {
      await api.delete(`/faculty/drafts/${id}`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));

      // Custom toast animation
      setToastMessage("Draft deleted successfully");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);
    } catch {
      // Error toast animation
      setToastMessage("Failed to delete draft. Please try again.");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const filteredDrafts = drafts.filter(draft =>
    draft.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.exam_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="space-y-4 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
            ></motion.div>
            <p className="text-muted-foreground">Loading drafts...</p>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <>
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
              : "bg-red-600 text-white"
              }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
            >
              <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground">Saved Drafts</h2>
          </div>
          <motion.span
            key={drafts.length}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full"
          >
            {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
          </motion.span>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Input
              type="text"
              placeholder="Search drafts by subject or exam type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus:border-blue-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>

        {drafts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileTextIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No saved drafts</h3>
            <p className="text-muted-foreground">Create a new claim to get started</p>
          </motion.div>
        ) : filteredDrafts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No drafts match your search</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredDrafts.map((draft, index) => (
              <motion.div
                key={draft.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, borderColor: "rgb(59 130 246)" }}
                className="p-4 border border-border rounded-lg hover:shadow-sm transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{draft.subject_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="px-2 py-1 bg-muted text-foreground text-xs font-medium rounded"
                      >
                        {draft.exam_type}
                      </motion.span>
                      {draft.claim_form_type === 'NON_TEACHING' && (
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded"
                        >
                          Non-Teaching
                        </motion.span>
                      )}
                      {draft.claim_form_type === 'TEACHING_EXTERNAL' && (
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded"
                        >
                          External
                        </motion.span>
                      )}
                      {draft.claim_form_type === 'TEACHING_INTERNAL' && (
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded"
                        >
                          Internal
                        </motion.span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        <ClockIcon className="w-3 h-3 inline mr-1" />
                        {new Date(draft.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(draft)}
                      className="flex items-center gap-2"
                    >
                      <EditIcon className="w-4 h-4" />
                      Edit
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(draft.id)}
                      className="flex items-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {drafts.length > 0 && filteredDrafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-4 border-t border-border"
          >
            <p className="text-sm text-muted-foreground text-center">
              Drafts are automatically saved. You can edit or delete them anytime.
            </p>
          </motion.div>
        )}
      </Card>
    </>
  );
}