import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";

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
    <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Generate Claim</h2>
        <p className="text-slate-500">Create new claims or continue from saved drafts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Select Claim Type & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-start">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">article</span>
              </div>
              <h3 className="text-lg font-bold">Select Claim Type</h3>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate("/faculty/claim/teaching?claimType=TEACHING_INTERNAL")}
                className="w-full bg-primary hover:bg-blue-700 text-white rounded-xl p-6 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/20 text-center"
              >
                <span className="material-symbols-outlined mb-2 text-3xl">person</span>
                <p className="font-bold text-lg">Teaching Staff Claim</p>
                <p className="text-sm opacity-90">(Internal Examiner)</p>
              </button>

              <button
                onClick={() => navigate("/faculty/claim/teaching?claimType=TEACHING_EXTERNAL")}
                className="w-full bg-white border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-600 rounded-xl p-6 transition-all transform hover:-translate-y-1 text-center"
              >
                <span className="material-symbols-outlined mb-2 text-3xl">person_pin</span>
                <p className="font-bold text-lg">Teaching Staff Claim</p>
                <p className="text-sm opacity-80">(External Examiner)</p>
              </button>

              <button
                onClick={() => navigate("/faculty/claim/non-teaching")}
                className="w-full bg-white border-2 border-purple-500 hover:bg-purple-50 text-purple-600 rounded-xl p-6 transition-all transform hover:-translate-y-1 text-center"
              >
                <span className="material-symbols-outlined mb-2 text-3xl">group</span>
                <p className="font-bold text-lg">Non-Teaching Staff Claim</p>
                <p className="text-sm opacity-80">(Support Staff)</p>
              </button>
            </div>
          </div>

          {/* Quick Information */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">info</span>
              Quick Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-blue-100">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Average Processing</p>
                <p className="text-xl font-bold text-primary">7-10 Days</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-100">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">TDS Rate</p>
                <p className="text-xl font-bold text-primary">10%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Drafts */}
        <DraftList onEdit={handleEditDraft} />
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
  const navigate = useNavigate();

  const fetchDrafts = () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    api.get("/faculty/drafts")
      .then((res) => {
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

    const handleVisibilityChange = () => {
      if (!document.hidden) fetchDrafts();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) return;

    try {
      await api.delete(`/faculty/drafts/${id}`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      setToastMessage("Draft deleted successfully");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);
    } catch {
      setToastMessage("Failed to delete draft. Please try again.");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const filteredDrafts = drafts.filter(draft =>
    (draft.subject_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (draft.exam_type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClaimTypeDetails = (claimFormType) => {
    switch (claimFormType) {
      case 'NON_TEACHING':
        return { icon: 'group', color: 'text-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' };
      case 'TEACHING_EXTERNAL':
        return { icon: 'person_pin', color: 'text-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700' };
      default:
        return { icon: 'edit_note', color: 'text-primary', bg: 'bg-blue-100', text: 'text-blue-700' };
    }
  };

  const timeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.abs(now - d) / 36e5;

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-xl z-50 font-medium ${toastType === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-start h-full">
        <div className="flex items-center justify-between mb-8 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <span className="material-symbols-outlined">folder_open</span>
            </div>
            <h3 className="text-lg font-bold">Saved Drafts</h3>
          </div>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
            {drafts.length} {drafts.length === 1 ? 'DRAFT' : 'DRAFTS'}
          </span>
        </div>

        <div className="mb-6 w-full">
          <div className="relative hover:scale-[1.01] transition-transform">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none"
              placeholder="Search drafts by subject or exam type..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4 w-full flex-grow">
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-slate-400 text-3xl">inbox</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No saved drafts</h3>
              <p className="text-slate-500 text-sm">Create a new claim to get started</p>
            </div>
          ) : (
            filteredDrafts.map((draft) => {
              const typeDetails = getClaimTypeDetails(draft.claim_form_type);

              return (
                <div key={draft.id} onClick={() => onEdit(draft)} className="cursor-pointer p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors group bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100">
                        <span className={`material-symbols-outlined ${typeDetails.color}`}>{typeDetails.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px]">{draft.subject_name || "Unnamed Exam"}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{draft.exam_type} • {draft.program}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${typeDetails.bg} ${typeDetails.text}`}>
                            {draft.claim_form_type === 'NON_TEACHING' ? 'NON-TEACH' : draft.claim_form_type === 'TEACHING_EXTERNAL' ? 'EXT' : 'INT'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">LAST EDITED</p>
                        <p className="text-xs font-semibold text-slate-600">
                          {timeAgo(draft.created_at)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => remove(draft.id, e)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Delete Draft"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex gap-4">
                      {/* Note: Amount and Progress are derived or omitted cleanly if not heavily tracked in backend */}
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Status</span>
                        <span className="text-sm font-semibold text-slate-700">Draft</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                      Continue
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {drafts.length > 0 && filteredDrafts.length > 0 && (
            <button
              onClick={() => navigate("/faculty/claim/teaching?claimType=TEACHING_INTERNAL")}
              className="mt-6 w-full py-6 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex flex-col items-center justify-center group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors mb-2">
                <span className="material-symbols-outlined">add</span>
              </div>
              <p className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Create another claim</p>
            </button>
          )}

        </div>
      </div>
    </>
  );
}