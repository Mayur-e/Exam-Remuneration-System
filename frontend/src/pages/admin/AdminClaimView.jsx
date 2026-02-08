import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import BillSummary from "../faculty/BillSummary";

// Icons
import {
    ArrowLeftIcon,
    UserIcon,
    BuildingOfficeIcon,
    FileTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    AlertCircleIcon
} from "../../components/icons/logo";

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

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Claim not found</div>;

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Claim #{exam.id} - Admin Review</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{exam.claim_form_type}</span>
                        <span>•</span>
                        <span className={`capitalize font-medium ${exam.status === 'paid' ? 'text-green-600' :
                            exam.status === 'approved' ? 'text-blue-600' :
                                exam.status === 'rejected' ? 'text-red-600' :
                                    'text-orange-600'
                            }`}>
                            {exam.status}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="ml-auto flex gap-3">
                    {canTakeAction && (
                        <>
                            <Button
                                onClick={() => setShowSendBackModal(true)}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                <AlertCircleIcon className="w-5 h-5 mr-2" />
                                Send Back
                            </Button>
                            <Button
                                onClick={() => setShowRejectModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <XCircleIcon className="w-5 h-5 mr-2" />
                                Reject Claim
                            </Button>
                        </>
                    )}
                    {exam.status === 'paid' && (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="font-semibold">Paid</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "details"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Claim Details
                    </button>
                    <button
                        onClick={() => setActiveTab("calculation")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "calculation"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Calculation Breakdown
                    </button>
                    <button
                        onClick={() => setActiveTab("audit")}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "audit"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Audit Logs
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "details" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Exam Details */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileTextIcon className="w-5 h-5 text-purple-600" />
                            Exam Information
                        </h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Subject" value={exam.subject_name || 'N/A'} />
                            <InfoRow label="Subject Code" value={exam.subject_code || 'N/A'} />
                            <InfoRow label="Exam Type" value={exam.exam_type} />
                            <InfoRow label="Program" value={`${exam.program} ${exam.level || ''}`} />
                            <InfoRow label="Students Count" value={exam.students_count} />
                            <InfoRow label="Semester" value={exam.semester || 'N/A'} />
                            <InfoRow label="Academic Year" value={exam.academic_year || 'N/A'} />
                            <InfoRow label="Exam Date" value={exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'N/A'} />
                            <InfoRow label="Is Backlog" value={exam.is_backlog ? 'Yes' : 'No'} />
                            {exam.second_examiner && (
                                <InfoRow label="Second Examiner" value={exam.second_examiner} />
                            )}
                        </div>
                    </Card>

                    {/* Claimant Details */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-purple-600" />
                            Claimant Details ({isExternal ? 'External Examiner' : 'Faculty'})
                        </h3>
                        <div className="space-y-3 text-sm mb-4">
                            <InfoRow label="Name" value={examinerName} />
                            <InfoRow label="Email" value={examinerEmail} />
                            <InfoRow label="Mobile" value={isExternal ? (exam.external_examiner_mobile || 'N/A') : (exam.faculty_mobile || 'N/A')} />
                            {isExternal && exam.parent_institute && (
                                <InfoRow label="Institute" value={exam.parent_institute} />
                            )}
                            {!isExternal && exam.faculty_department && (
                                <InfoRow label="Department" value={exam.faculty_department} />
                            )}
                        </div>

                        <div className="bg-muted p-4 rounded-lg border border-gray-100">
                            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                Bank Account Details (Read-Only)
                            </h4>
                            <div className="space-y-2 text-sm">
                                <InfoRow label="Bank Name" value={bankName || 'Not provided'} />
                                <InfoRow label="Account Number" value={accNumber || 'Not provided'} />
                                <InfoRow label="IFSC Code" value={ifsc || 'Not provided'} />
                                <InfoRow label="PAN Number" value={isExternal ? (exam.external_pan_number || 'Not provided') : (exam.faculty_pan_card || exam.faculty_pan_number || 'Not provided')} />
                            </div>
                        </div>
                    </Card>

                    {/* Staff Table for Non-Teaching Claims */}
                    {exam.claim_form_type === 'NON_TEACHING' && staff && staff.length > 0 && (
                        <Card className="p-6 lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Supporting Staff Details
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-purple-50 border-b-2 border-purple-200">
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                                            <th className="px-4 py-3 text-left font-semibold text-foreground">Designation</th>
                                            <th className="px-4 py-3 text-right font-semibold text-foreground">Rate (₹)</th>
                                            <th className="px-4 py-3 text-right font-semibold text-foreground">Prep & Clean Rs</th>
                                            <th className="px-4 py-3 text-right font-semibold text-foreground">Batch Rs</th>
                                            <th className="px-4 py-3 text-right font-semibold text-foreground">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {staff.map((s, idx) => {
                                            const prepClean = Number(s.prep_clean_amount || 0);
                                            const batch = Number(s.batch_amount || 0);
                                            const total = Number(s.total_amount || 0);
                                            const rate = Number(s.rate || 0);

                                            return (
                                                <tr key={idx} className="hover:bg-muted">
                                                    <td className="px-4 py-3 font-medium text-foreground">{s.staff_name}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{s.staff_role}</td>
                                                    <td className="px-4 py-3 text-right text-foreground">₹{rate.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                                                        {prepClean > 0 ? `₹${prepClean.toFixed(2)}` : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-blue-600 font-medium">₹{batch.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right text-purple-600 font-bold">₹{total.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="bg-purple-50 border-t-2 border-purple-200 font-bold">
                                            <td colSpan="5" className="px-4 py-3 text-right text-foreground">Grand Total:</td>
                                            <td className="px-4 py-3 text-right text-purple-700 text-lg">
                                                ₹{staff.reduce((sum, s) => sum + Number(s.total_amount || 0), 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "calculation" && (
                <div className="max-w-md mx-auto">
                    <BillSummary examId={id} billData={data.calculation} />
                </div>
            )}

            {activeTab === "audit" && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
                    {auditLogs && auditLogs.length > 0 ? (
                        <div className="space-y-3">
                            {auditLogs.map((log, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${log.action_type === 'REJECTED' ? 'bg-red-50 border-red-200' :
                                    log.action_type === 'APPROVED' ? 'bg-green-50 border-green-200' :
                                        log.action_type === 'SENT_BACK' ? 'bg-orange-50 border-orange-200' :
                                            'bg-muted border-border'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-medium text-foreground">{log.action_by_name}</span>
                                            <span className="text-sm text-muted-foreground ml-2">({log.action_by_role})</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(log.action_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${log.action_type === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            log.action_type === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                log.action_type === 'SENT_BACK' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-accent text-foreground'
                                            }`}>
                                            {log.action_type}
                                        </span>
                                    </div>
                                    {log.comment && (
                                        <p className="text-foreground text-sm mt-2">{log.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No audit logs available</p>
                    )}
                </Card>
            )}

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

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between py-1">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4 text-red-700">Reject Claim</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Rejection Reason *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-border rounded-lg p-2 text-sm"
                            rows={4}
                            placeholder="Provide a clear reason for rejection..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Policy Reference (Optional)
                        </label>
                        <input
                            type="text"
                            value={policyReference}
                            onChange={(e) => setPolicyReference(e.target.value)}
                            className="w-full border border-border rounded-lg p-2 text-sm"
                            placeholder="e.g., Section 4.2, Rule 7.3"
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={processing}>
                            {processing ? "Rejecting..." : "Reject Claim"}
                        </Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4 text-orange-700">Send Back for Correction</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Correction Instructions *
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="w-full border border-border rounded-lg p-2 text-sm"
                            rows={4}
                            placeholder="Provide clear instructions on what needs to be corrected..."
                            required
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        The claim will be sent back to draft status. Faculty can edit and resubmit.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={processing}>
                            {processing ? "Sending..." : "Send Back"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
