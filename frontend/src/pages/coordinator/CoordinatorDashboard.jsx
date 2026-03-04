import { useState, useEffect } from "react";
import api from "../../services/api";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useToast } from "../../hooks/useToast";

const statusColors = {
    UNDER_COORDINATOR_REVIEW: "bg-yellow-100 text-yellow-700 border-yellow-200",
    COORDINATOR_VERIFIED: "bg-purple-100 text-purple-700 border-purple-200",
    SENT_TO_BILLING: "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    paid: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    COORDINATOR_REJECTED: "bg-red-100 text-red-700 border-red-200",
};

const statusLabel = {
    UNDER_COORDINATOR_REVIEW: "Pending Review",
    COORDINATOR_VERIFIED: "Verified",
    SENT_TO_BILLING: "Sent to Billing",
    approved: "Approved",
    paid: "Paid",
    rejected: "Rejected",
    COORDINATOR_REJECTED: "Rejected by Coordinator",
};

export default function CoordinatorDashboard() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Detail Modal State
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [claimDetails, setClaimDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Action Modal State
    const [actionClaim, setActionClaim] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const res = await api.get("/coordinator/claims");
            setClaims(res.data);
        } catch (error) {
            console.error("Failed to fetch coordinator claims", error);
            showToast("Failed to fetch claims", "error");
        } finally {
            setLoading(false);
        }
    };

    const openDetails = async (claim) => {
        setSelectedClaim(claim);
        setActionType("APPROVE"); // Default for review panel
        setRejectReason("");
        setClaimDetails(null);
        setLoadingDetails(true);
        try {
            const res = await api.get(`/coordinator/claims/${claim.id}`);
            setClaimDetails(res.data);
        } catch (err) {
            showToast("Failed to load claim details", "error");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleAction = (claim) => {
        setActionClaim(claim);
        setRejectReason("");
        setSelectedClaim(null); // close detail modal
    };

    const submitActionWith = async (type) => {
        if (type === "REJECT" && !rejectReason.trim()) {
            showToast("Please provide a reason for rejection", "error");
            return;
        }
        try {
            setProcessing(true);
            if (type === "APPROVE") {
                await api.post("/coordinator/verify", { examId: actionClaim.id });
                showToast("Claim verified and forwarded to billing", "success");
            } else {
                await api.post("/coordinator/reject", { examId: actionClaim.id, reason: rejectReason });
                showToast("Claim rejected", "success");
            }
            setActionClaim(null);
            fetchClaims();
        } catch (error) {
            showToast(error.response?.data?.message || "Action failed", "error");
        } finally {
            setProcessing(false);
        }
    };

    const submitReview = async () => {
        if (actionType === "REJECT" && !rejectReason.trim()) {
            showToast("Please provide a reason for rejection", "error");
            return;
        }
        try {
            setProcessing(true);
            if (actionType === "APPROVE") {
                await api.post("/coordinator/verify", { examId: selectedClaim.id });
                showToast("Claim verified and forwarded to billing", "success");
            } else {
                await api.post("/coordinator/reject", { examId: selectedClaim.id, reason: rejectReason });
                showToast("Claim rejected", "success");
            }
            setSelectedClaim(null);
            fetchClaims();
        } catch (error) {
            showToast(error.response?.data?.message || "Action failed", "error");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading coordinator dashboard...</div>;
    }

    const exam = claimDetails?.exam;
    const isExternal = exam?.claim_form_type === "TEACHING_EXTERNAL";

    return (
        <div className="p-4 sm:p-8 space-y-8 overflow-y-auto w-full max-w-7xl mx-auto font-display bg-background-light min-h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Coordinator Dashboard</h3>
                    <p className="text-slate-500">Review claims for courses assigned to you</p>
                </div>
                <button
                    onClick={fetchClaims}
                    className="px-6 py-2 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors text-slate-600 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-orange-50/50 p-5 rounded-2xl shadow-sm border border-orange-100 flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Waiting for me</p>
                        <p className="text-3xl font-bold text-orange-600">{claims.filter(c => c.status === "UNDER_COORDINATOR_REVIEW").length}</p>
                    </div>
                    <div className="bg-orange-100 p-2 rounded-xl">
                        <span className="material-symbols-outlined text-orange-500 text-2xl">pending_actions</span>
                    </div>
                </div>

                <div className="bg-purple-50/50 p-5 rounded-2xl shadow-sm border border-purple-100 flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Verified (to submit)</p>
                        <p className="text-3xl font-bold text-purple-600">{claims.filter(c => c.status === "COORDINATOR_VERIFIED").length}</p>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-xl">
                        <span className="material-symbols-outlined text-purple-500 text-2xl">verified</span>
                    </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl shadow-sm border border-blue-100 flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Sent to Billing</p>
                        <p className="text-3xl font-bold text-blue-600">{claims.filter(c => c.status === "SENT_TO_BILLING").length}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-xl">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">account_balance</span>
                    </div>
                </div>

                <div className="bg-green-50/50 p-5 rounded-2xl shadow-sm border border-green-100 flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Approved/Paid</p>
                        <p className="text-3xl font-bold text-green-600">{claims.filter(c => ["approved", "paid"].includes(c.status)).length}</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-xl">
                        <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
                    </div>
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Review Claims</h3>
                    {claims.some(c => c.status === "COORDINATOR_VERIFIED") && (
                        <button
                            onClick={async () => {
                                try {
                                    setProcessing(true);
                                    await api.post("/coordinator/submit-billing");
                                    showToast("Claims submitted to billing incharge", "success");
                                    fetchClaims();
                                } catch (err) {
                                    showToast(err.response?.data?.message || "Failed to submit", "error");
                                } finally {
                                    setProcessing(false);
                                }
                            }}
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                        >
                            Submit Verified Claims to Billing
                        </button>
                    )}
                </div>

                {claims.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-medium">No claims found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs tracking-wider uppercase">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Examiner</th>
                                    <th className="px-4 py-3">Course</th>
                                    <th className="px-4 py-3">Exam Type</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {claims.map((claim) => (
                                    <tr
                                        key={claim.id}
                                        className="hover:bg-muted/50 cursor-pointer"
                                        onClick={() => openDetails(claim)}
                                    >
                                        <td className="px-4 py-3 font-medium text-xs">
                                            {claim.exam_date ? new Date(claim.exam_date).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-sm">{claim.faculty_name || "N/A"}</div>
                                            {claim.claim_form_type === "TEACHING_EXTERNAL" && (
                                                <div className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] uppercase font-bold rounded">
                                                    External
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-xs">{claim.subject_code}</div>
                                            <div className="text-[10px] text-muted-foreground">{claim.subject_name}</div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-xs">{claim.exam_type}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[claim.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                                {statusLabel[claim.status] || claim.status}
                                            </span>
                                            {claim.rejection_reason && ["rejected", "COORDINATOR_REJECTED", "UNDER_COORDINATOR_REVIEW"].includes(claim.status) && (
                                                <div className="text-[9px] text-red-600 mt-1 max-w-[150px] font-medium leading-tight italic" title={claim.rejection_reason}>
                                                    Reason: {claim.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                {claim.status === "UNDER_COORDINATOR_REVIEW" && (
                                                    <button onClick={() => handleAction(claim)} className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-1.5 px-3 rounded-lg font-semibold text-xs border border-blue-100/50 flex items-center gap-1 transition-colors shadow-sm">
                                                        <span className="material-symbols-outlined text-[14px]">edit_document</span> Quick Action
                                                    </button>
                                                )}
                                                {claim.status === "COORDINATOR_VERIFIED" && (
                                                    <span className="text-[10px] text-muted-foreground italic mr-2">Waiting for Submission</span>
                                                )}
                                                {["SENT_TO_BILLING", "approved", "paid"].includes(claim.status) && (
                                                    <span className="text-[10px] text-green-600 font-bold mr-2">Processed</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ======================== CLAIM DETAIL MODAL ======================== */}
            {selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm overflow-y-auto py-8 px-4" onClick={() => setSelectedClaim(null)}>
                    <div className="w-full max-w-6xl bg-slate-50 rounded-2xl shadow-2xl overflow-hidden font-display flex flex-col md:flex-row shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200" onClick={(e) => e.stopPropagation()}>
                        {/* LEFT COLUMN: Data View */}
                        <div className="flex-1 bg-slate-50 p-6 md:p-8 space-y-6 md:border-r border-slate-200">
                            <div className="mb-8">
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => setSelectedClaim(null)}>
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Dashboard
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-1">{exam?.faculty_name || exam?.external_examiner_name || selectedClaim.faculty_name}</h2>
                                <p className="text-sm font-semibold text-slate-500 uppercase flex items-center gap-3">
                                    <span>Exam Code: <span className="text-slate-700">{selectedClaim.subject_code}</span></span> •
                                    <span>Type: <span className="text-slate-700">{selectedClaim.exam_type}</span></span>
                                    {exam && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[exam.status] || ""}`}>
                                            {statusLabel[exam.status] || exam.status}
                                        </span>
                                    )}
                                </p>
                            </div>

                            {loadingDetails ? (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl text-blue-500 animate-spin">progress_activity</span>
                                    <p className="text-slate-500 text-sm mt-3 font-medium">Loading precise details...</p>
                                </div>
                            ) : claimDetails ? (
                                <div className="space-y-6">
                                    {/* Subject Stats Panel */}
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Students Info For Verification</h4>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                                <p className="text-slate-700 font-bold text-sm">
                                                    This Claim: <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded">{exam.students_count}</span>
                                                </p>
                                                <p className="text-slate-700 font-bold text-sm flex items-center gap-1.5 border-l-2 border-slate-100 pl-6">
                                                    Total Registered: <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">{claimDetails.total_registered_students || 0}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course Activity</p>
                                            <p className="text-slate-700 font-bold text-sm">
                                                Other Pending/Verified Claims Total: <span className="text-orange-600 font-extrabold bg-orange-50 px-2 py-0.5 rounded">
                                                    {claims.filter(c => c.subject_code === selectedClaim.subject_code && c.id !== selectedClaim.id).reduce((sum, c) => sum + (parseInt(c.students_count) || 0), 0)}
                                                </span> Students
                                            </p>
                                        </div>
                                    </div>

                                    {/* Exam Details Box */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-500">description</span>
                                            <h3 className="font-bold text-slate-800">Exam Details</h3>
                                        </div>
                                        <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Exam Name</p>
                                                <p className="text-sm font-semibold text-slate-800">{exam.exam_type} {exam.academic_year}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Course Name</p>
                                                <p className="text-sm font-semibold text-slate-800">{selectedClaim.subject_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Claim Type</p>
                                                <p className="text-sm font-semibold text-slate-800">{exam.claim_form_type?.replace(/_/g, " ")}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financials & Banks */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-500">monetization_on</span>
                                            <h3 className="font-bold text-slate-800">Remuneration & Bank Details</h3>
                                        </div>
                                        <div className="p-6">
                                            {claimDetails.calculation && (
                                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Calculation Output Amount</p>
                                                        <p className="text-3xl font-extrabold text-blue-600">₹{parseFloat(claimDetails.calculation.net_amount || claimDetails.calculation.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-blue-200 text-5xl">payments</span>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Overview</p>
                                                    <p className="text-sm font-semibold text-slate-800">{exam.faculty_bank_name || exam.external_bank_name || "N/A"}</p>
                                                    <p className="text-xs text-slate-500">{exam.faculty_branch_name || exam.external_branch_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account No.</p>
                                                    <p className="text-sm font-semibold text-slate-800 font-mono tracking-wider">{exam.faculty_account_number || exam.external_account_number || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IFSC</p>
                                                    <p className="text-sm font-semibold text-slate-800 font-mono uppercase tracking-wider">{exam.faculty_ifsc_code || exam.external_ifsc_code || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : null}
                        </div>

                        {/* RIGHT COLUMN: Review Dashboard */}
                        <div className="w-full md:w-[400px] bg-white p-6 md:p-8 border-t md:border-t-0 border-slate-200 flex flex-col h-full md:min-h-full shrink-0">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Review Actions</h3>
                            <p className="text-sm text-slate-500 mb-6">Coordinator Approval Workflow</p>

                            {/* Workflow form */}
                            <div className="mb-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Set Status</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-3 pr-10 appearance-none font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            value={actionType}
                                            onChange={e => setActionType(e.target.value)}
                                            disabled={exam?.status !== "UNDER_COORDINATOR_REVIEW"}
                                        >
                                            <option value="APPROVE">Verify & Forward</option>
                                            <option value="REJECT">Return to Faculty</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-3.5 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Coordinator Remarks</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-32 placeholder:text-slate-400 text-sm"
                                        placeholder="Add your notes or justification here..."
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        disabled={exam?.status !== "UNDER_COORDINATOR_REVIEW"}
                                    />
                                </div>

                                {exam?.status === "UNDER_COORDINATOR_REVIEW" ? (
                                    <button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_theme('colors.blue.300')] flex justify-center items-center gap-2"
                                        onClick={submitReview}
                                        disabled={processing}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                        {processing ? "Confirming..." : "Confirm Action"}
                                    </button>
                                ) : (
                                    <div className="bg-slate-100 p-3 rounded-xl text-center text-slate-500 text-sm font-semibold">
                                        No pending actions for this claim.
                                    </div>
                                )}
                            </div>

                            {/* Action History visualizer */}
                            {claimDetails?.actions?.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Action History</h4>
                                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                        {claimDetails.actions.map((act, i) => (
                                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                </div>
                                                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                                        <div className="font-bold text-slate-800 text-sm">{act.action_type === "VERIFY" ? "Verified" : act.action_type === "SUBMIT_TO_BILLING" ? "Submitted" : act.action_type === "REJECT" ? "Returned" : "Action"}</div>
                                                        <time className="font-mono text-slate-400 text-[9px]">{new Date(act.action_at).toLocaleString()}</time>
                                                    </div>
                                                    <div className="text-slate-500 text-xs">by {act.action_by_name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* ======================== CONFIRM ACTION MODAL ======================== */}
            {actionClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setActionClaim(null)}>
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden font-display" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-blue-600 text-2xl">check_box</span>
                                    Action for Claim #{actionClaim.id || "N/A"}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                    Examiner: <span className="text-slate-700 font-bold">{actionClaim.faculty_name}</span>
                                </p>
                            </div>
                            <button onClick={() => setActionClaim(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 bg-white space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">chat_bubble</span>
                                    Reviewer Remarks <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-28 text-sm placeholder:text-slate-400"
                                    placeholder="Add comments for the accountant or reasons for rejection..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-400 mt-2 italic font-medium">Please provide detailed context if returning to the faculty.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-5 mt-2 border-t border-slate-100">
                                <button
                                    onClick={() => setActionClaim(null)}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors sm:mr-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { submitActionWith("REJECT"); }}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span> Return to Faculty
                                </button>
                                <button
                                    onClick={() => { submitActionWith("APPROVE"); }}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Verify & Forward
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
