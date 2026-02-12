import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useLocation } from "react-router-dom";

import ExamDetails from "./ExamDetails";
import NonTeachingInfo from "./NonTeachingInfo";
import StaffClaimsSection from "./StaffClaimsSection";
import BillSummary from "./BillSummary";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function NonTeachingBillForm() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const examIdFromUrl = params.get("examId");

    const [examId, setExamId] = useState(examIdFromUrl);
    const [status, setStatus] = useState(examIdFromUrl ? null : "draft");
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [exam, setExam] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch exam details
    const fetchExam = async (id = examId) => {
        if (!id) return;

        try {
            const res = await api.get(`/faculty/exams/${id}`);
            setExam({ ...res.data });
            setStatus(res.data.status);
            setRefreshKey((k) => k + 1);
        } catch (err) {
            console.error("Failed to fetch exam", err);
        }
    };

    useEffect(() => {
        fetchExam();
    }, [examId]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post(`/faculty/exams/${examId}/submit`, {});
            setStatus("submitted");
            setRefreshKey((k) => k + 1);
            showToast("Non-Teaching claim submitted successfully!", "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Submit failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Non-Teaching Staff Claim</h2>

            {/* Rejection/Sent-Back Notice */}
            {exam && exam.claimActions && exam.claimActions.length > 0 && (
                <Card className={`p-6 ${['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className={`w-6 h-6 ${['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'text-red-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-semibold mb-2 ${['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'text-red-900' : 'text-orange-900'}`}>
                                {['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'Claim Rejected' : 'Claim Sent Back for Correction'}
                            </h3>
                            {exam.claimActions.map((action, idx) => (
                                <div key={idx} className="mb-3 last:mb-0">
                                    <p className={`text-sm mb-1 ${['REJECTED', 'REJECT'].includes(action.action_type) ? 'text-red-700' : 'text-orange-700'}`}>
                                        <strong>{['REJECTED', 'REJECT'].includes(action.action_type) ? (action.action_type === 'REJECT' ? 'Rejected by Coordinator:' : 'Rejected by Billing:') : 'Sent back by:'}</strong> {action.action_by_name} on{' '}
                                        {new Date(action.action_at).toLocaleString()}
                                    </p>
                                    <p className={`text-sm p-3 rounded border bg-card ${['REJECTED', 'REJECT'].includes(action.action_type) ? 'text-red-800 border-red-200' : 'text-orange-800 border-orange-200'}`}>
                                        {action.comment}
                                    </p>
                                </div>
                            ))}
                            <p className={`text-sm mt-3 ${exam.claimActions[0].action_type === 'REJECTED' ? 'text-red-700' : 'text-orange-700'}`}>
                                Please review the feedback above, make necessary corrections, and resubmit your claim.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* STEP 1: Exam Details */}
            <Card className="p-6">
                <ExamDetails
                    examId={examId}
                    disabled={examId && status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED"}
                    onCreated={(id) => {
                        setExamId(id);
                        fetchExam(id);
                    }}
                    claimFormType="NON_TEACHING"
                    onUpdated={fetchExam}
                />
            </Card>

            {/* STEP 2: Dates & Student Info */}
            {examId && (
                <NonTeachingInfo
                    examId={examId}
                    refreshKey={refreshKey}
                    disabled={status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED"}
                    onUpdated={fetchExam}
                />
            )}

            {/* STEP 3: Staff Details */}
            {examId && (
                <StaffClaimsSection
                    examId={examId}
                    refreshKey={refreshKey}
                    disabled={status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED"}
                />
            )}

            {/* STEP 4: Bill Summary (After Submission) */}
            {examId && status === "submitted" && (
                <>
                    <Card className="p-6 bg-green-50 border-green-200">
                        <div className="text-center space-y-2 mb-4">
                            <h3 className="text-lg font-bold text-green-700">
                                Claim Submitted Successfully
                            </h3>
                            <p className="text-green-600">
                                Your non-teaching claim has been submitted for approval.
                            </p>
                        </div>
                        <BillSummary examId={examId} refreshKey={refreshKey} />
                    </Card>

                    {/* PDF Download Button */}
                    <Card className="p-6 bg-blue-50 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">Download Claim Form</h4>
                                <p className="text-sm text-blue-700">
                                    Download the PDF version of your non-teaching staff claim form
                                </p>
                            </div>
                            <Button
                                onClick={async () => {
                                    try {
                                        showToast('Downloading PDF...', 'info');
                                        const response = await api.get(`/pdf/non-teaching/${examId}/download`, {
                                            responseType: 'blob'
                                        });

                                        // Construct filename
                                        const code = exam?.subject_code || 'Exam';
                                        const safeCode = code.replace(/[^a-zA-Z0-9-_]/g, '');
                                        const filename = `${safeCode}-Non-Teaching.pdf`;

                                        // Create blob link to download
                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', filename);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.parentNode.removeChild(link);
                                        window.URL.revokeObjectURL(url);

                                        showToast('PDF Downloaded!', 'success');
                                    } catch (err) {
                                        showToast('Failed to download PDF', 'error');
                                        console.error('PDF download error:', err);
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                            </Button>
                        </div>
                    </Card>
                </>
            )}

            {/* SUBMIT BUTTON */}
            {examId && status === "draft" && (
                <Card className="p-6 bg-yellow-50 border-yellow-200">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="declaration"
                                className="mt-1 w-4 h-4 text-blue-600 border-border rounded focus:ring-blue-500"
                            />
                            <label htmlFor="declaration" className="text-sm text-foreground">
                                <strong>Declaration:</strong> I hereby declare that the
                                information provided above is true and correct to the best of my
                                knowledge. The staff members listed have performed their duties
                                as per institutional norms and examination requirements.
                            </label>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Submitting..." : "Submit Claim"}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* RESUBMIT BUTTON (For Rejected Claims *) */}
            {examId && (status === "rejected" || status === "COORDINATOR_REJECTED") && (
                <Card className="p-6 bg-orange-50 border-orange-200">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="font-semibold text-orange-900 mb-2">Ready to Resubmit?</h3>
                                <p className="text-sm text-orange-800 mb-4">
                                    Please ensure you have addressed all the issues mentioned in the rejection notice above before resubmitting your claim.
                                </p>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={async () => {
                                            if (!confirm("Have you fixed all the issues mentioned in the rejection? Click OK to resubmit.")) {
                                                return;
                                            }
                                            try {
                                                setLoading(true);
                                                await api.post(`/faculty/exams/${examId}/resubmit`);
                                                showToast("Claim resubmitted successfully!", "success");
                                                fetchExam();
                                            } catch (err) {
                                                showToast(err.response?.data?.message || "Failed to resubmit claim", "error");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {loading ? "Resubmitting..." : "Resubmit Claim"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
