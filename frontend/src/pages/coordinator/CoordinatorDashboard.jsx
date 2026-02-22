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

    const handleAction = (claim, type) => {
        setActionClaim(claim);
        setActionType(type);
        setRejectReason("");
        setSelectedClaim(null); // close detail modal
    };

    const submitAction = async () => {
        if (actionType === "REJECT" && !rejectReason.trim()) {
            showToast("Please provide a reason for rejection", "error");
            return;
        }
        try {
            setProcessing(true);
            if (actionType === "APPROVE") {
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

    if (loading) {
        return <div className="p-8 text-center">Loading coordinator dashboard...</div>;
    }

    const exam = claimDetails?.exam;
    const isExternal = exam?.claim_form_type === "TEACHING_EXTERNAL";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Coordinator Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Review claims for courses assigned to you</p>
                </div>
                <Button onClick={fetchClaims} variant="outline">Refresh</Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="text-yellow-600 font-medium text-sm">Waiting for me</div>
                    <div className="text-2xl font-bold">{claims.filter(c => c.status === "UNDER_COORDINATOR_REVIEW").length}</div>
                </Card>
                <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="text-purple-600 font-medium text-sm">Verified (to submit)</div>
                    <div className="text-2xl font-bold">{claims.filter(c => c.status === "COORDINATOR_VERIFIED").length}</div>
                </Card>
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-blue-600 font-medium text-sm">Sent to Billing</div>
                    <div className="text-2xl font-bold">{claims.filter(c => c.status === "SENT_TO_BILLING").length}</div>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-green-600 font-medium text-sm">Approved/Paid</div>
                    <div className="text-2xl font-bold">{claims.filter(c => ["approved", "paid"].includes(c.status)).length}</div>
                </Card>
            </div>

            {/* Claims Table */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
                    <h3 className="font-semibold">Review Claims</h3>
                    {claims.some(c => c.status === "COORDINATOR_VERIFIED") && (
                        <Button
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
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Submit Verified Claims to Billing
                        </Button>
                    )}
                </div>

                {claims.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No claims found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
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
                                                    <>
                                                        <Button size="sm" variant="outline"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 text-[10px] h-7 px-2"
                                                            onClick={() => handleAction(claim, "APPROVE")}>
                                                            Verify
                                                        </Button>
                                                        <Button size="sm" variant="outline"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px] h-7 px-2"
                                                            onClick={() => handleAction(claim, "REJECT")}>
                                                            Reject
                                                        </Button>
                                                    </>
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
            </Card>

            {/* ======================== CLAIM DETAIL MODAL ======================== */}
            {selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8 px-4">
                    <div className="w-full max-w-4xl bg-card rounded-2xl shadow-2xl border border-border">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Claim Details</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {selectedClaim.subject_code} — {selectedClaim.subject_name}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {exam && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColors[exam.status] || ""}`}>
                                        {statusLabel[exam.status] || exam.status}
                                    </span>
                                )}
                                <button onClick={() => setSelectedClaim(null)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
                            </div>
                        </div>

                        {loadingDetails ? (
                            <div className="p-12 text-center">
                                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">Loading details...</p>
                            </div>
                        ) : claimDetails ? (
                            <div className="p-6 space-y-6">

                                {/* Exam Info */}
                                <section>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Exam Information</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Exam Type", value: exam.exam_type },
                                            { label: "Claim Type", value: exam.claim_form_type?.replace(/_/g, " ") },
                                            { label: "Program", value: exam.program },
                                            { label: "Level", value: exam.level },
                                            { label: "Academic Year", value: exam.academic_year },
                                            { label: "Semester", value: exam.semester },
                                            { label: "Students Count", value: exam.students_count },
                                            { label: "Exam Date", value: exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "—" },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-muted/40 rounded-lg p-3">
                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</div>
                                                <div className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Examiner / Faculty Info */}
                                <section>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                        {isExternal ? "External Examiner Details" : "Faculty Details"}
                                        {isExternal && (
                                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold">External</span>
                                        )}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {(isExternal ? [
                                            { label: "Name", value: exam.external_examiner_name },
                                            { label: "Email", value: exam.external_examiner_email },
                                            { label: "Mobile", value: exam.external_examiner_mobile },
                                            { label: "Institute", value: exam.parent_institute },
                                            { label: "PAN", value: exam.external_pan_number },
                                            { label: "Travel Type", value: exam.is_local ? "Local (< 25km)" : "Outstation" },
                                        ] : [
                                            { label: "Name", value: exam.faculty_name },
                                            { label: "Email", value: exam.faculty_email },
                                            { label: "Mobile", value: exam.faculty_mobile },
                                            { label: "Department", value: exam.faculty_department },
                                        ]).map(({ label, value }) => (
                                            <div key={label} className="bg-muted/40 rounded-lg p-3">
                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</div>
                                                <div className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Bank Details */}
                                <section>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Bank Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {(isExternal ? [
                                            { label: "Bank", value: exam.external_bank_name },
                                            { label: "Branch", value: exam.external_branch_name },
                                            { label: "Account No.", value: exam.external_account_number },
                                            { label: "IFSC", value: exam.external_ifsc_code },
                                        ] : [
                                            { label: "Bank", value: exam.faculty_bank_name },
                                            { label: "Branch", value: exam.faculty_branch_name },
                                            { label: "Account No.", value: exam.faculty_account_number },
                                            { label: "IFSC", value: exam.faculty_ifsc_code },
                                        ]).map(({ label, value }) => (
                                            <div key={label} className="bg-muted/40 rounded-lg p-3">
                                                <div className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</div>
                                                <div className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Documents (External only) */}
                                {isExternal && (exam.external_pan_url || exam.external_cheque_url || exam.travel_proof_url) && (
                                    <section>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Documents</h3>
                                        <div className="flex gap-3 flex-wrap">
                                            {exam.external_pan_url && (
                                                <a href={`http://localhost:5000${exam.external_pan_url}`} target="_blank" rel="noreferrer"
                                                    className="px-4 py-2 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2">
                                                    📄 View PAN Card
                                                </a>
                                            )}
                                            {exam.external_cheque_url && (
                                                <a href={`http://localhost:5000${exam.external_cheque_url}`} target="_blank" rel="noreferrer"
                                                    className="px-4 py-2 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2">
                                                    📄 View Cancelled Cheque
                                                </a>
                                            )}
                                            {exam.travel_proof_url && (
                                                <a href={`http://localhost:5000${exam.travel_proof_url}`} target="_blank" rel="noreferrer"
                                                    className="px-4 py-2 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2">
                                                    🚌 View Travel Proof
                                                </a>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Remuneration Calculation */}
                                {claimDetails.calculation && (
                                    <section>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Remuneration</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <div className="text-[10px] text-green-600 uppercase font-semibold">Gross Amount</div>
                                                <div className="text-lg font-bold text-green-700 mt-0.5">₹{parseFloat(claimDetails.calculation.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                                            </div>
                                            {claimDetails.calculation.net_amount && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="text-[10px] text-blue-600 uppercase font-semibold">Net Amount</div>
                                                    <div className="text-lg font-bold text-blue-700 mt-0.5">₹{parseFloat(claimDetails.calculation.net_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Action History */}
                                {claimDetails.actions?.length > 0 && (
                                    <section>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Action History</h3>
                                        <div className="space-y-2">
                                            {claimDetails.actions.map((a, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border text-sm">
                                                    <div className="flex-1">
                                                        <span className="font-semibold">{a.action_by_name}</span>
                                                        <span className="text-muted-foreground text-xs ml-2">({a.action_by_role?.replace(/_/g, " ")})</span>
                                                        <span className="ml-2 text-muted-foreground">— {a.action_type}</span>
                                                        {(a.remarks || a.comment) && (
                                                            <div className="text-xs text-muted-foreground mt-1 italic">"{a.remarks || a.comment}"</div>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {new Date(a.action_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Action Buttons */}
                                {exam.status === "UNDER_COORDINATOR_REVIEW" && (
                                    <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                        <Button variant="outline" className="text-red-600 hover:bg-red-50"
                                            onClick={() => handleAction(selectedClaim, "REJECT")}>
                                            Reject Claim
                                        </Button>
                                        <Button className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleAction(selectedClaim, "APPROVE")}>
                                            Verify & Approve
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* ======================== CONFIRM ACTION MODAL ======================== */}
            {actionClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 m-4 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">
                            {actionType === "APPROVE" ? "Verify Claim" : "Reject Claim"}
                        </h3>

                        <div className="mb-4 text-sm space-y-1">
                            <p><strong>Examiner:</strong> {actionClaim.faculty_name}</p>
                            <p><strong>Course:</strong> {actionClaim.subject_code} — {actionClaim.subject_name}</p>
                            <p><strong>Exam Type:</strong> {actionClaim.exam_type}</p>
                        </div>

                        {actionType === "REJECT" && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Reason for Rejection *</label>
                                <textarea
                                    className="w-full p-2 border border-border rounded-md min-h-[100px] bg-background text-foreground"
                                    placeholder="Please explain why this claim is being rejected..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        {actionType === "APPROVE" && (
                            <p className="mb-6 text-muted-foreground text-sm">
                                Are you sure you want to verify this claim? It will be marked as verified and queued for billing.
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setActionClaim(null)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button
                                variant={actionType === "APPROVE" ? "default" : "destructive"}
                                onClick={submitAction}
                                disabled={processing}
                            >
                                {processing ? "Processing..." : (actionType === "APPROVE" ? "Confirm Verify" : "Confirm Reject")}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
