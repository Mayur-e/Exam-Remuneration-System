import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openTimelines, setOpenTimelines] = useState({});
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

  const toggleTimeline = (id) => {
    setOpenTimelines(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: {
        label: "Draft",
        color: "bg-slate-100 text-slate-600",
        icon: "drafts"
      },
      submitted: {
        label: "Submitted",
        color: "bg-orange-100 text-orange-600",
        icon: "schedule"
      },
      UNDER_COORDINATOR_REVIEW: {
        label: "Under Review (Coord)",
        color: "bg-orange-100 text-orange-600",
        icon: "schedule"
      },
      COORDINATOR_VERIFIED: {
        label: "Verified",
        color: "bg-orange-100 text-orange-600",
        icon: "schedule"
      },
      SENT_TO_BILLING: {
        label: "Sent to Billing",
        color: "bg-blue-100 text-blue-600",
        icon: "account_balance"
      },
      approved: {
        label: "Approved",
        color: "bg-green-100 text-green-600",
        icon: "check_circle"
      },
      paid: {
        label: "Paid",
        color: "bg-blue-100 text-blue-600",
        icon: "verified"
      },
      rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-600",
        icon: "close"
      },
      COORDINATOR_REJECTED: {
        label: "Rejected (Coord)",
        color: "bg-red-100 text-red-600",
        icon: "close"
      }
    };

    const s = config[status] || config.submitted;

    return (
      <span className={`${s.color} text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1`}>
        <span className="material-symbols-outlined text-[14px]">{s.icon}</span> {s.label}
      </span>
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

  const getTimelineDetails = (claim) => {
    // Generate an artificial timeline sequence for demonstration,
    // normally this would be parsed from claim history.
    const timeline = [];

    // Step 1: Submission
    timeline.push({
      status: "Claim Submitted",
      desc: new Date(claim.created_at || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      icon: "check",
      iconBg: "bg-green-500",
      fade: false
    });

    if (claim.status === 'rejected' || claim.status === 'COORDINATOR_REJECTED') {
      timeline.push({
        status: "Claim Rejected",
        desc: "Requires your attention",
        icon: "close",
        iconBg: "bg-red-500",
        fade: false
      });
      return timeline;
    }

    if (claim.status === 'draft') return timeline;

    // Step 2: Coordinator Review
    const isCoordinatorVerified = ['COORDINATOR_VERIFIED', 'SENT_TO_BILLING', 'approved', 'paid'].includes(claim.status);
    const isUnderCoordinatorReview = ['submitted', 'UNDER_COORDINATOR_REVIEW'].includes(claim.status);

    timeline.push({
      status: "Coordinator Verified",
      desc: isCoordinatorVerified ? "Verified by Course Coordinator" : "Review in progress by Coordinator",
      icon: isCoordinatorVerified ? "check" : "sync",
      iconBg: isCoordinatorVerified ? "bg-green-500" : (isUnderCoordinatorReview ? "bg-blue-500" : "bg-slate-300"),
      fade: !isCoordinatorVerified && !isUnderCoordinatorReview,
      pulse: isUnderCoordinatorReview
    });

    // Step 3: Billing Approval
    const isPaid = claim.status === 'paid';
    const isBillingApproved = ['approved', 'paid'].includes(claim.status);
    const isUnderBillingReview = claim.status === 'SENT_TO_BILLING';

    timeline.push({
      status: "Billing Approved",
      desc: isPaid ? "Payment Processed" : (isBillingApproved ? "Approved - Processing Payment" : (isUnderBillingReview ? "Review in progress by Billing" : "Waiting for coordinator verification")),
      icon: isBillingApproved ? "check" : (isUnderBillingReview ? "sync" : "account_balance"),
      iconBg: isBillingApproved ? "bg-green-500" : (isUnderBillingReview ? "bg-blue-500" : "bg-slate-300"),
      fade: !isBillingApproved && !isUnderBillingReview,
      pulse: isUnderBillingReview
    });

    return timeline;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 overflow-y-auto w-full max-w-7xl mx-auto font-display bg-background-light min-h-[calc(100vh-4rem)]">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-xl z-50 font-medium ${toastType === "success"
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

      <div className="mb-2">
        <h3 className="text-2xl font-bold text-slate-800">My Claims</h3>
        <p className="text-slate-500">Submitted examination claims</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Claims</p>
            <p className="text-3xl font-bold text-slate-800">{claims.length}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-slate-500 text-xl">description</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Submitted</p>
            <p className="text-3xl font-bold text-slate-800">{getStatusCount("submitted")}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-slate-500 text-xl">schedule</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Approved</p>
            <p className="text-3xl font-bold text-slate-800">{getStatusCount("approved")}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-slate-500 text-xl">check_circle</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Paid</p>
            <p className="text-3xl font-bold text-slate-800">{getStatusCount("paid")}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-slate-500 text-xl">verified</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rejected</p>
            <p className="text-3xl font-bold text-slate-800">{getStatusCount("rejected")}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-slate-500 text-xl">close</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-slate-800 outline-none"
            placeholder="Search by subject or exam type"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            className="flex-1 md:w-48 bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 text-slate-800 outline-none font-medium cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="UNDER_COORDINATOR_REVIEW">Under Review</option>
            <option value="SENT_TO_BILLING">Processing</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
            className="px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors text-slate-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">receipt_long</span>
            <p className="text-slate-500 font-medium">No claims match your filters.</p>
          </div>
        ) : (
          filteredClaims.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h4 className="text-xl font-bold text-slate-800 mr-2">
                      {c.subject_name || "Unnamed Subject"}
                    </h4>
                    <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {c.claim_form_type === 'TEACHING_EXTERNAL' ? 'External Examiner' :
                        c.claim_form_type === 'NON_TEACHING' ? 'Non-Teaching' : 'Teaching'}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-sm text-slate-500">
                    <p><span className="font-medium text-slate-600">Exam Type:</span> {c.exam_type}</p>
                    <p><span className="font-medium text-slate-600">Program:</span> {c.program} {c.level ? `- ${c.level}` : ''}</p>
                  </div>
                  {c.status === 'rejected' && c.claim_form_type === 'TEACHING_EXTERNAL' && (
                    <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded inline-block font-medium border border-red-100 mt-2">
                      ⚠️ Share link with external examiner to resubmit: <button onClick={() => handleCopyExternalLink(c)} className="underline ml-1">Copy Link</button>
                    </p>
                  )}
                  <p className="text-green-600 font-bold text-lg pt-1">
                    ₹ {Number(c.total_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {(['submitted', 'UNDER_COORDINATOR_REVIEW', 'COORDINATOR_VERIFIED', 'SENT_TO_BILLING', 'approved', 'paid'].includes(c.status)) && (
                    <button
                      onClick={() => handleDownloadPDF(c)}
                      className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[18px]">description</span> PDF
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (c.status === 'draft') {
                        handleView(c);
                      } else {
                        toggleTimeline(c.id);
                      }
                    }}
                    className="border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {c.status === 'draft' ? 'edit' : (openTimelines[c.id] ? 'expand_less' : 'visibility')}
                    </span>
                    {c.status === 'draft' ? 'Edit' : 'View Status'}
                  </button>

                  <button
                    onClick={() => handleView(c)}
                    className="border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span> Details
                  </button>

                  {c.status !== 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/faculty/queries?claim_id=${c.id}`);
                      }}
                      className="text-orange-600 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm hover:bg-orange-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">flag</span> Report
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Tracker / Timeline */}
              {openTimelines[c.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-8 pt-8 border-t border-slate-100 overflow-hidden"
                >
                  <h5 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Claim Status Timeline</h5>
                  <div className="relative">
                    <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-200"></div>
                    <div className="space-y-8 relative">
                      {getTimelineDetails(c).map((step, idx) => (
                        <div key={idx} className={`flex items-start gap-4 ${step.fade ? 'opacity-40' : ''}`}>
                          <div className={`w-8 h-8 rounded-full ${step.iconBg} flex items-center justify-center z-10 ${step.pulse ? 'animate-pulse' : ''}`}>
                            <span className="material-symbols-outlined text-white text-[16px]">{step.icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{step.status}</p>
                            <p className="text-sm text-slate-500">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}