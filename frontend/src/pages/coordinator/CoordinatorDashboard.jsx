import { useState, useEffect } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useToast } from "../../hooks/useToast";
import { EyeIcon } from "../../components/icons/logo";

export default function CoordinatorDashboard() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Action Modal State
    const [actionClaim, setActionClaim] = useState(null); // The claim being acted upon
    const [actionType, setActionType] = useState(null); // 'APPROVE' or 'REJECT'
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

    const handleAction = (claim, type) => {
        setActionClaim(claim);
        setActionType(type);
        setRejectReason("");
    };

    const submitAction = async () => {
        if (actionType === 'REJECT' && !rejectReason.trim()) {
            showToast("Please provide a reason for rejection", "error");
            return;
        }

        try {
            setProcessing(true);

            if (actionType === 'APPROVE') {
                await api.post("/coordinator/verify", { examId: actionClaim.id });
                showToast("Claim verified and forwarded to billing", "success");
            } else {
                await api.post("/coordinator/reject", {
                    examId: actionClaim.id,
                    reason: rejectReason
                });
                showToast("Claim rejected", "success");
            }

            // Close modal and refresh
            setActionClaim(null);
            fetchClaims();

        } catch (error) {
            console.error("Action failed", error);
            showToast(error.response?.data?.message || "Action failed", "error");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading coordinator dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Coordinator Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Review claims for courses assigned to you
                    </p>
                </div>
                <Button onClick={fetchClaims} variant="outline">Refresh</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="text-yellow-600 font-medium text-sm">Waiting for me</div>
                    <div className="text-2xl font-bold">{claims.filter(c => c.status === 'UNDER_COORDINATOR_REVIEW').length}</div>
                </Card>
                <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="text-purple-600 font-medium text-sm">Verified (to submit)</div>
                    <div className="text-2xl font-bold">{claims.filter(c => c.status === 'COORDINATOR_VERIFIED').length}</div>
                </Card>
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-blue-600 font-medium text-sm">Sent to Billing</div>
                    <div className="text-2xl font-bold">{claims.filter(c => c.status === 'SENT_TO_BILLING').length}</div>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-green-600 font-medium text-sm">Approved/Paid</div>
                    <div className="text-2xl font-bold">{claims.filter(c => ['approved', 'paid'].includes(c.status)).length}</div>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
                    <h3 className="font-semibold">Review Claims</h3>
                    {claims.some(c => c.status === 'COORDINATOR_VERIFIED') && (
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
                    <div className="p-8 text-center text-muted-foreground">
                        No claims found.
                    </div>
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
                                    <tr key={claim.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium text-xs">
                                            {new Date(claim.exam_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-sm">{claim.faculty_name || 'N/A'}</div>
                                            {claim.claim_form_type === 'TEACHING_EXTERNAL' && (
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
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${claim.status === 'COORDINATOR_VERIFIED' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                claim.status === 'SENT_TO_BILLING' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    claim.status === 'UNDER_COORDINATOR_REVIEW' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        claim.status === 'approved' || claim.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                {claim.status === 'UNDER_COORDINATOR_REVIEW' ? 'Pending' :
                                                    claim.status === 'COORDINATOR_VERIFIED' ? 'Verified (Local)' :
                                                        claim.status === 'SENT_TO_BILLING' ? 'Sent to Billing' :
                                                            claim.status === 'approved' ? 'Approved' :
                                                                claim.status === 'paid' ? 'Paid' :
                                                                    'Rejected'}
                                            </span>
                                            {claim.rejection_reason && (claim.status === 'rejected' || claim.status === 'COORDINATOR_REJECTED' || claim.status === 'UNDER_COORDINATOR_REVIEW') && (
                                                <div className="text-[9px] text-red-600 mt-1 max-w-[150px] font-medium leading-tight italic" title={claim.rejection_reason}>
                                                    Reason: {claim.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                {claim.status === 'UNDER_COORDINATOR_REVIEW' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 text-[10px] h-7 px-2"
                                                            onClick={() => handleAction(claim, 'APPROVE')}
                                                        >
                                                            Verify
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px] h-7 px-2"
                                                            onClick={() => handleAction(claim, 'REJECT')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {claim.status === 'COORDINATOR_VERIFIED' && (
                                                    <span className="text-[10px] text-muted-foreground italic mr-2">
                                                        Waiting for Submission
                                                    </span>
                                                )}
                                                {(claim.status === 'SENT_TO_BILLING' || claim.status === 'approved' || claim.status === 'paid') && (
                                                    <span className="text-[10px] text-green-600 font-bold mr-2">
                                                        Processed
                                                    </span>
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

            {/* Action Modal */}
            {actionClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 m-4 shadow-xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold mb-4">
                            {actionType === 'APPROVE' ? 'Verify Claim' : 'Reject Claim'}
                        </h3>

                        <div className="mb-4 text-sm">
                            <p><strong>Faculty:</strong> {actionClaim.faculty_name}</p>
                            <p><strong>Course:</strong> {actionClaim.subject_code} - {actionClaim.subject_name}</p>
                        </div>

                        {actionType === 'REJECT' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Reason for Rejection *</label>
                                <textarea
                                    className="w-full p-2 border rounded-md min-h-[100px]"
                                    placeholder="Please explain why this claim is being rejected..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        {actionType === 'APPROVE' && (
                            <p className="mb-6 text-muted-foreground">
                                Are you sure you want to verify this claim? It will be forwarded to the billing department.
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setActionClaim(null)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={actionType === 'APPROVE' ? 'default' : 'destructive'}
                                onClick={submitAction}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : (actionType === 'APPROVE' ? 'Confirm Verify' : 'Confirm Reject')}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
