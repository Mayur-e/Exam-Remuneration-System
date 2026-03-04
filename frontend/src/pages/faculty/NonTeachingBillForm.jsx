import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useLocation, useNavigate } from "react-router-dom";

import ExamDetails from "./ExamDetails";
import NonTeachingInfo from "./NonTeachingInfo";
import StaffClaimsSection from "./StaffClaimsSection";
import BillSummary from "./BillSummary";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function NonTeachingBillForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);

    const examIdFromUrl = params.get("examId");

    const [examId, setExamId] = useState(examIdFromUrl);
    const [status, setStatus] = useState(examIdFromUrl ? null : "draft");
    const { showToast } = useToast();
    const [claimDetails, setClaimDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [exam, setExam] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [currentStep, setCurrentStep] = useState(1);

    const fetchExam = async (id = examId) => {
        if (!id) return;

        try {
            const res = await api.get(`/faculty/exams/${id}`);
            setExam({ ...res.data });
            setStatus(res.data.status);
            setRefreshKey((k) => k + 1);

            if (res.data.status && !["draft", "rejected", "COORDINATOR_REJECTED"].includes(res.data.status)) {
                setCurrentStep(3);
            }
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
            setCurrentStep(3); // move to step 3 on success
        } catch (err) {
            showToast(err.response?.data?.message || "Submit failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResubmit = async () => {
        if (!confirm("Have you fixed all the issues mentioned in the rejection? Click OK to resubmit.")) {
            return;
        }
        try {
            setLoading(true);
            await api.post(`/faculty/exams/${examId}/resubmit`);
            showToast("Claim resubmitted successfully!", "success");
            // Redirect back to Dashboard to clear the state and show progress natively
            window.location.href = '/faculty/my-claims';
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to resubmit claim", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (examId && currentStep === 3 && !pdfUrl) {
            const allowedStatuses = ["submitted", "approved", "paid", "SENT_TO_BILLING", "UNDER_COORDINATOR_REVIEW", "COORDINATOR_VERIFIED"];
            if (allowedStatuses.includes(status)) {
                const fetchPdfPreview = async () => {
                    setIsPreviewLoading(true);
                    try {
                        const response = await api.get(`/pdf/non-teaching/${examId}/download`, {
                            responseType: 'blob',
                            validateStatus: (s) => s < 500,
                        });
                        if (response.status === 200) {
                            const blob = new Blob([response.data], { type: 'application/pdf' });
                            setPdfUrl(URL.createObjectURL(blob));
                        }
                    } catch (error) {
                        console.error("Failed to load PDF preview:", error);
                    } finally {
                        setIsPreviewLoading(false);
                    }
                };
                fetchPdfPreview();
            }
        }
    }, [examId, currentStep, status, pdfUrl]);

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    const handleDownloadPDF = async () => {
        try {
            showToast('Downloading PDF...', 'info');
            const response = await api.get(`/pdf/non-teaching/${examId}/download`, {
                responseType: 'blob'
            });

            const code = exam?.subject_code || 'Exam';
            const safeCode = code.replace(/[^a-zA-Z0-9-_]/g, '');
            const filename = `${safeCode}-Non-Teaching.pdf`;

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
    };

    const steps = [
        { num: 1, label: "GENERAL", id: "General" },
        { num: 2, label: "DUTY DETAILS", id: "Duty Details" },
    ];
    if (currentStep === 3 || (!["draft", "rejected", "COORDINATOR_REJECTED"].includes(status) && status !== null)) {
        steps.push({ num: 3, label: "SUMMARY", id: "Summary" });
    }

    const disabledForms = status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED";

    return (
        <div className={`mx-auto pb-20 mt-4 transition-all duration-300 ${currentStep === 3 ? 'max-w-7xl' : 'max-w-5xl'}`}>
            {/* Stepper Header */}
            <div className="flex items-center justify-center py-4 mb-6">
                {steps.map((step, idx) => {
                    const isActive = currentStep === step.num;
                    const isCompleted = currentStep > step.num;
                    return (
                        <div key={step.num} className="flex items-center">
                            <div className="flex flex-col items-center gap-2 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow-md' : isCompleted ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                    {isCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : step.num}
                                </div>
                                <span className={`text-[10px] font-bold tracking-widest absolute -bottom-5 whitespace-nowrap ${isActive ? 'text-primary' : (isCompleted ? 'text-green-600' : 'text-slate-400')}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`w-16 sm:w-32 h-0.5 mx-4 transition-colors ${isCompleted ? 'bg-green-600' : 'bg-slate-200'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Rejection notice on Step 1 if rejected */}
            {exam && ['rejected', 'COORDINATOR_REJECTED'].includes(exam.status) && exam.claimActions && exam.claimActions.length > 0 && currentStep === 1 && (
                <div className={`mb-6 p-4 rounded-lg border ${['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined ${['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'text-red-500' : 'text-orange-500'}`}>
                            {['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'error' : 'warning'}
                        </span>
                        <div className="flex-1">
                            <h3 className={`font-semibold mb-2 ${['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'text-red-900' : 'text-orange-900'}`}>
                                {['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'Claim Rejected' : 'Claim Sent Back for Correction'}
                            </h3>
                            {exam.claimActions.map((action, idx) => (
                                <div key={idx} className="mb-3 last:mb-0">
                                    <p className={`text-sm mb-1 ${['REJECTED', 'REJECT'].includes(action.action_type) ? 'text-red-700' : 'text-orange-700'}`}>
                                        <strong>{['REJECTED', 'REJECT'].includes(action.action_type) ? (action.action_type === 'REJECT' ? 'Rejected by Coordinator:' : 'Rejected by Billing:') : 'Sent back by:'}</strong> {action.action_by_name} on {new Date(action.action_at).toLocaleString()}
                                    </p>
                                    <p className={`text-sm p-3 rounded border bg-white ${['REJECTED', 'REJECT'].includes(action.action_type) ? 'text-red-800 border-red-200' : 'text-orange-800 border-orange-200'}`}>
                                        {action.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
                {currentStep === 1 && (
                    <div className="p-0 animate-in fade-in duration-300">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Exam Details</h3>
                                <p className="text-sm text-slate-500">Provide general information about the exam.</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <ExamDetails
                                examId={examId}
                                disabled={disabledForms}
                                onCreated={(id) => {
                                    setExamId(id);
                                    fetchExam(id);
                                    setCurrentStep(2); // Auto advance on create
                                }}
                                claimFormType="NON_TEACHING"
                                onUpdated={fetchExam}
                            />
                        </div>
                        {examId && (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <Button onClick={() => setCurrentStep(2)} className="min-w-[120px]">
                                    Next: Duty Details &rarr;
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="p-0 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Duty Details</h3>
                                <p className="text-sm text-slate-500">Add dates, student counts, and staff assignments.</p>
                            </div>
                        </div>

                        <div className="p-0">
                            <NonTeachingInfo
                                examId={examId}
                                refreshKey={refreshKey}
                                disabled={disabledForms}
                                onUpdated={fetchExam}
                            />

                            <hr className="border-slate-100 mx-6" />

                            <StaffClaimsSection
                                examId={examId}
                                refreshKey={refreshKey}
                                disabled={disabledForms}
                            />
                        </div>

                        {!disabledForms && (
                            <div className="px-6 py-4 bg-orange-50 border-t border-b border-orange-100 flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="declaration"
                                    className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                                />
                                <label htmlFor="declaration" className="text-sm text-slate-700 cursor-pointer">
                                    <strong>Declaration:</strong> I hereby declare that the
                                    information provided above is true and correct to the best of my
                                    knowledge. The staff members listed have performed their duties
                                    as per institutional norms and examination requirements.
                                </label>
                            </div>
                        )}

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                &larr; Back to General
                            </Button>

                            <div className="flex gap-4">
                                {disabledForms ? (
                                    <Button onClick={() => setCurrentStep(3)} className="min-w-[120px]">
                                        Next: Claim Status &rarr;
                                    </Button>
                                ) : (
                                    <>
                                        {(status === "rejected" || status === "COORDINATOR_REJECTED") ? (
                                            <Button onClick={handleResubmit} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px]">
                                                {loading ? "Resubmitting..." : "Resubmit Claim"}
                                            </Button>
                                        ) : (
                                            <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
                                                {loading ? "Submitting..." : "Submit Claim"}
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="p-0 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                            {/* Left Column: Details */}
                            <div className="flex flex-col h-full bg-white">
                                <div className="p-8 border-b border-slate-100 bg-green-50/50 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm ring-4 ring-green-50">
                                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Claim Submitted Successfully</h3>
                                    <p className="text-slate-500 max-w-md text-sm font-medium">
                                        Your non-teaching staff claim has been generated and submitted for approval.
                                    </p>
                                </div>

                                <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin p-8">
                                    <BillSummary examId={examId} refreshKey={refreshKey} />
                                </div>
                            </div>

                            {/* Right Column: PDF Preview */}
                            <div className="bg-slate-50 flex flex-col h-[700px] lg:h-auto min-h-[500px]">
                                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shadow-sm border border-red-100">
                                            <span className="material-symbols-outlined text-[18px]">print</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 leading-tight">Print Preview</h3>
                                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Generated Document</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleDownloadPDF}
                                        variant="outline"
                                        className="border-slate-300 hover:bg-slate-100 text-slate-700 font-bold shadow-sm"
                                        size="sm"
                                    >
                                        <span className="material-symbols-outlined mr-1.5 text-[18px]">download</span>
                                        Download
                                    </Button>
                                </div>
                                <div className="flex-1 p-0 overflow-hidden relative bg-slate-100/50">
                                    {isPreviewLoading ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4 shadow-sm"></div>
                                            <p className="font-medium text-sm">Generating Document...</p>
                                        </div>
                                    ) : pdfUrl ? (
                                        <iframe
                                            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                                            className="w-full h-full border-0 lg:min-h-[700px]"
                                            title="PDF Preview"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">error_outline</span>
                                            <p className="font-medium text-sm">Preview Unavailable</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center rounded-b-2xl shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] relative z-10">
                            <Button
                                onClick={() => setCurrentStep(2)}
                                variant="outline"
                                className="border-slate-300 text-slate-700 font-bold px-6 shadow-sm"
                            >
                                <span className="material-symbols-outlined mr-2 text-[18px]">arrow_back</span> Duty Details
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
