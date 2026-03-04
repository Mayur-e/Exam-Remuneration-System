import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import BillSummary from "../faculty/BillSummary";

export default function AdminClaimView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("details");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showSendBackModal, setShowSendBackModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/admin/claims/${id}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (reason, policyReference) => {
        setProcessing(true);
        try {
            await api.post(`/admin/claims/${id}/reject`, {
                reason,
                policy_reference: policyReference
            });
            showToast("Claim rejected successfully!", "success");
            setShowRejectModal(false);
            fetchDetails();
        } catch (err) {
            const errorMessage = err.response?.data?.errors
                ? err.response.data.errors.map(e => e.msg).join(', ')
                : (err.response?.data?.message || "Failed to reject claim");
            showToast(errorMessage, "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleSendBack = async (instructions) => {
        setProcessing(true);
        try {
            await api.post(`/admin/claims/${id}/send-back`, { instructions });
            showToast("Claim sent back for correction!", "success");
            setShowSendBackModal(false);
            fetchDetails();
        } catch (err) {
            const errorMessage = err.response?.data?.errors
                ? err.response.data.errors.map(e => e.msg).join(', ')
                : (err.response?.data?.message || "Failed to send back claim");
            showToast(errorMessage, "error");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading claim details...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light">
                <span className="material-symbols-outlined text-6xl text-red-300 mb-4">error</span>
                <h3 className="text-xl font-bold text-slate-800">Claim Not Found</h3>
                <p className="text-slate-500 mt-2">The requested claim could not be found or you don't have access.</p>
                <button onClick={() => navigate(-1)} className="mt-6 text-primary hover:underline font-medium inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Go Back
                </button>
            </div>
        );
    }

    const { exam, staff, auditLogs } = data;
    const isExternal = exam.claim_form_type === 'TEACHING_EXTERNAL';
    const canTakeAction = exam.status === 'submitted' || exam.status === 'approved';

    // Determine which info to show
    const examinerName = isExternal ? exam.external_examiner_name : exam.faculty_name;
    const examinerEmail = isExternal ? exam.external_examiner_email : exam.faculty_email;
    const bankName = isExternal ? exam.external_bank_name : exam.faculty_bank_name;
    const accNumber = isExternal ? exam.external_account_number : exam.faculty_account_number;
    const ifsc = isExternal ? exam.external_ifsc_code : exam.faculty_ifsc_code;
    const pan = isExternal ? exam.external_pan_number : exam.faculty_pan_number;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)] pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm shrink-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claim #{exam.id}</h1>
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${exam.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    exam.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                        exam.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                                            'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                {exam.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">category</span>
                                {exam.claim_form_type.replace(/_/g, ' ')}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>Admin Review</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    {canTakeAction && (
                        <>
                            <button
                                onClick={() => setShowSendBackModal(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg text-sm font-bold shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">replay</span>
                                Send Back
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                Reject Claim
                            </button>
                        </>
                    )}
                    {exam.status === 'paid' && (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200 font-bold shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span>Paid</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Flat Tabs */}
            <div className="bg-white rounded-2xl p-1.5 inline-flex border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto">
                <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-shrink-0 px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "details"
                        ? "bg-primary text-white shadow-md"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Details
                </button>
                <button
                    onClick={() => setActiveTab("calculation")}
                    className={`flex-shrink-0 px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "calculation"
                        ? "bg-primary text-white shadow-md"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">calculate</span>
                    Calculation
                </button>
                <button
                    onClick={() => setActiveTab("audit")}
                    className={`flex-shrink-0 px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "audit"
                        ? "bg-primary text-white shadow-md"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">history</span>
                    Audit Logs
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "details" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Exam Information Flat Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                    <span className="material-symbols-outlined">description</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Exam Information</h3>
                                    <p className="text-xs font-medium text-slate-500">Details about the examination</p>
                                </div>
                            </div>
                            <div className="p-6 divide-y divide-slate-100">
                                <InfoRow label="Subject" value={exam.subject_name || 'N/A'} icon="book" />
                                <InfoRow label="Subject Code" value={exam.subject_code || 'N/A'} icon="tag" />
                                <InfoRow label="Exam Type" value={exam.exam_type} icon="school" />
                                <InfoRow label="Program" value={`${exam.program} ${exam.level || ''}`} icon="local_library" />
                                <InfoRow label="Students Count" value={exam.students_count} icon="groups" />
                                <InfoRow label="Semester" value={exam.semester || 'N/A'} icon="calendar_view_week" />
                                <InfoRow label="Academic Year" value={exam.academic_year || 'N/A'} icon="calendar_today" />
                                <InfoRow label="Exam Date" value={exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'N/A'} icon="event" />
                                <InfoRow label="Is Backlog" value={exam.is_backlog ? 'Yes' : 'No'} icon="history_edu" />
                                {exam.second_examiner && (
                                    <InfoRow label="Second Examiner" value={exam.second_examiner} icon="person_add" />
                                )}
                            </div>
                        </div>

                        {/* Claimant Details Flat Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Claimant Details</h3>
                                    <p className="text-xs font-medium text-slate-500">{isExternal ? 'External Examiner info' : 'Faculty info'}</p>
                                </div>
                            </div>
                            <div className="p-6 divide-y divide-slate-100 mb-6">
                                <InfoRow label="Name" value={examinerName} icon="badge" />
                                <InfoRow label="Email" value={examinerEmail} icon="mail" />
                                <InfoRow label="Mobile" value={isExternal ? (exam.external_examiner_mobile || 'N/A') : (exam.faculty_mobile || 'N/A')} icon="call" />
                                {isExternal && exam.parent_institute && (
                                    <InfoRow label="Institute" value={exam.parent_institute} icon="domain" />
                                )}
                                {!isExternal && exam.faculty_department && (
                                    <InfoRow label="Department" value={exam.faculty_department} icon="account_tree" />
                                )}
                            </div>

                            {/* Bank Details Sub-card */}
                            <div className="mx-6 mb-6 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">account_balance</span>
                                    <h4 className="font-bold text-slate-700 text-sm">Bank Details (Read-Only)</h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                                            <p className="text-sm font-medium text-slate-800">{bankName || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                                            <p className="text-sm font-medium text-slate-800 font-mono">{accNumber || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">IFSC Code</p>
                                            <p className="text-sm font-medium text-slate-800 uppercase">{ifsc || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PAN Number</p>
                                            <p className="text-sm font-medium text-slate-800 uppercase">{isExternal ? (exam.external_pan_number || 'Not provided') : (exam.faculty_pan_card || exam.faculty_pan_number || 'Not provided')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Staff Table for Non-Teaching Claims */}
                        {exam.claim_form_type === 'NON_TEACHING' && staff && staff.length > 0 && (
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                        <span className="material-symbols-outlined">engineering</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Supporting Staff Details</h3>
                                        <p className="text-xs font-medium text-slate-500">Breakdown of non-teaching staff claims</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">Designation</th>
                                                <th className="px-6 py-4 text-right">Rate (₹)</th>
                                                <th className="px-6 py-4 text-right">Prep & Clean (₹)</th>
                                                <th className="px-6 py-4 text-right">Batch (₹)</th>
                                                <th className="px-6 py-4 text-right text-slate-800">Total (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {staff.map((s, idx) => {
                                                const prepClean = Number(s.prep_clean_amount || 0);
                                                const batch = Number(s.batch_amount || 0);
                                                const total = Number(s.total_amount || 0);
                                                const rate = Number(s.rate || 0);

                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-800">{s.staff_name}</td>
                                                        <td className="px-6 py-4 text-slate-500 font-medium">{s.staff_role}</td>
                                                        <td className="px-6 py-4 text-right text-slate-600 font-medium">₹{rate.toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-right text-emerald-600 font-bold">
                                                            {prepClean > 0 ? `₹${prepClean.toFixed(2)}` : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-indigo-600 font-bold">₹{batch.toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-right text-primary font-black">₹{total.toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-slate-50/80 border-t-2 border-slate-200">
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-widest text-[11px]">Grand Total:</td>
                                                <td className="px-6 py-4 text-right text-primary text-lg font-black">
                                                    ₹{staff.reduce((sum, s) => sum + Number(s.total_amount || 0), 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "calculation" && (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <BillSummary examId={id} billData={data.calculation} />
                    </div>
                )}

                {activeTab === "audit" && (
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                                <span className="material-symbols-outlined">receipt_long</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Audit Trail</h3>
                                <p className="text-xs font-medium text-slate-500">History of actions taken on this claim</p>
                            </div>
                        </div>

                        <div className="p-6">
                            {auditLogs && auditLogs.length > 0 ? (
                                <div className="space-y-4">
                                    {auditLogs.map((log, idx) => (
                                        <div key={idx} className={`p-5 rounded-xl border ${log.action_type === 'REJECTED' ? 'bg-red-50/50 border-red-100' :
                                                log.action_type === 'APPROVED' ? 'bg-emerald-50/50 border-emerald-100' :
                                                    log.action_type === 'SENT_BACK' ? 'bg-amber-50/50 border-amber-100' :
                                                        'bg-slate-50/50 border-slate-200'
                                            }`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-800 text-sm">{log.action_by_name}</span>
                                                        <span className="text-xs font-medium text-slate-400 ml-2">{log.action_by_role}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${log.action_type === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            log.action_type === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                log.action_type === 'SENT_BACK' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                        }`}>
                                                        {log.action_type}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                                        {new Date(log.action_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {log.comment && (
                                                <div className="mt-3 pl-3 border-l-2 border-slate-300">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">chat</span>
                                                        Comment
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-700 italic">"{log.comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">history_toggle_off</span>
                                    <p className="text-slate-500 font-medium">No audit logs available for this claim.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            <RejectModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onReject={handleReject}
                processing={processing}
            />

            {/* Send Back Modal */}
            <SendBackModal
                isOpen={showSendBackModal}
                onClose={() => setShowSendBackModal(false)}
                onSendBack={handleSendBack}
                processing={processing}
            />
        </div>
    );
}

function InfoRow({ label, value, icon }) {
    return (
        <div className="py-3 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500">
                {icon && <span className="material-symbols-outlined text-[18px] text-slate-400">{icon}</span>}
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="text-sm font-bold text-slate-800 text-right">{value}</div>
        </div>
    );
}

function RejectModal({ isOpen, onClose, onReject, processing }) {
    const [reason, setReason] = useState("");
    const [policyReference, setPolicyReference] = useState("");
    const { showToast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            showToast("Rejection reason is required", "error");
            return;
        }
        onReject(reason, policyReference);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <span className="material-symbols-outlined">cancel</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Reject Claim</h3>
                        <p className="text-xs font-medium text-slate-500">This action cannot be undone.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none custom-scrollbar"
                            rows={4}
                            placeholder="Provide a clear reason for rejection..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Policy Reference <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={policyReference}
                            onChange={(e) => setPolicyReference(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            placeholder="e.g., Section 4.2, Rule 7.3"
                        />
                    </div>
                    <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Rejecting...
                                </>
                            ) : "Reject Claim"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SendBackModal({ isOpen, onClose, onSendBack, processing }) {
    const [instructions, setInstructions] = useState("");
    const { showToast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!instructions.trim()) {
            showToast("Correction instructions are required", "error");
            return;
        }
        onSendBack(instructions);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <span className="material-symbols-outlined">replay</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Send Back for Correction</h3>
                        <p className="text-xs font-medium text-slate-500">Return to faculty as draft.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Correction Instructions <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none custom-scrollbar"
                            rows={4}
                            placeholder="Provide clear instructions on what needs to be corrected..."
                            required
                        />
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-[16px] mt-0.5">info</span>
                        <p className="text-xs text-amber-800 font-medium">
                            The claim will be sent back to draft status. Faculty can edit and resubmit.
                        </p>
                    </div>
                    <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Sending...
                                </>
                            ) : "Send Back"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
