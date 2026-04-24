import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useLocation } from "react-router-dom";

import ExamDetails from "./ExamDetails";
import ClaimsSection from "./ClaimsSection";
import BillSummary from "./BillSummary";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

// ── Sub-component: renders token + Google Form sharing UI after link is generated ──
function ExternalSharingPanel({ examId, externalLink, linkExpiration, isExistingLink, showToast }) {
  const token = externalLink.split("/").pop();
  const [config, setConfig] = useState({ googleFormUrl: null, googleFormTokenFieldId: null });
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    api.get("/config").then(r => setConfig(r.data)).catch(() => {});
  }, []);

  const { googleFormUrl, googleFormTokenFieldId } = config;
  const formConfigured = googleFormUrl && !googleFormUrl.includes("PASTE_YOUR");
  const fieldConfigured = googleFormTokenFieldId && !googleFormTokenFieldId.includes("PASTE_FIELD");

  // Build pre-filled URL
  const shareUrl = formConfigured
    ? fieldConfigured
      ? `${googleFormUrl}?${googleFormTokenFieldId}=${encodeURIComponent(token)}`
      : googleFormUrl
    : null;

  const isPreFilled = formConfigured && fieldConfigured;

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      await api.post("/external/send-examiner-invite", {
        examId,
        examinerEmail: inviteEmail,
      });
      setEmailStatus({ ok: true, message: `Invitation sent to ${inviteEmail}` });
      showToast("Invitation email sent!", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send email";
      const detail = err?.response?.data?.detail;
      const fullMsg = detail ? `${msg}: ${detail}` : msg;
      setEmailStatus({ ok: false, message: fullMsg });
      showToast(msg, "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const copyShareUrl = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch {}
    showToast("Link copied!", "success");
  };

  return (
    <div className="space-y-4 bg-white p-5 rounded-xl border border-purple-100 shadow-sm mt-2">
      <div className={`text-sm font-bold flex items-center gap-2 ${isExistingLink ? 'text-blue-700' : 'text-green-700'}`}>
        <span className="material-symbols-outlined">{isExistingLink ? 'info' : 'check_circle'}</span>
        {isExistingLink ? 'Existing valid token retrieved' : 'Token generated successfully'}
      </div>

      {/* Token display — always show for reference */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          🔑 Exam Reference Token
        </p>
        <div className="flex gap-2 items-center">
          <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 font-mono text-base font-bold text-purple-800 tracking-widest break-all">
            {token}
          </div>
          <Button variant="secondary" className="font-bold border-purple-200 text-purple-700 hover:bg-purple-50 shrink-0"
            onClick={async () => {
              try { await navigator.clipboard.writeText(token); } catch {}
              showToast("Token copied!", "success");
            }}>
            <span className="material-symbols-outlined text-[16px] mr-1">content_copy</span> Copy
          </Button>
        </div>
      </div>

      {/* Share link */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
          {isPreFilled ? "🔗 Google Form Link" : "🔗 Google Form Link"}
        </p>
        {shareUrl ? (
          <div className="flex gap-2 items-center">
            <a href={shareUrl} target="_blank" rel="noreferrer"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-blue-600 font-medium truncate hover:underline">
              {shareUrl}
            </a>
            <Button variant="secondary" className="font-bold border-slate-200 shrink-0" onClick={copyShareUrl}>
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
            </Button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 font-medium space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              Google Form not fully configured in <code className="bg-amber-100 px-1 rounded">backend/.env</code>
            </div>
            {!formConfigured && <p className="ml-6 text-xs">Missing: <code>GOOGLE_FORM_URL</code></p>}
            {!fieldConfigured && formConfigured && <p className="ml-6 text-xs">Missing: <code>GOOGLE_FORM_TOKEN_FIELD_ID</code> — get it from "Get pre-filled link" in your form</p>}
          </div>
        )}
      </div>

      {/* Send invitation email */}
      <div className="pt-1 border-t border-purple-100 space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">✉️ Send Invitation Email to Examiner</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="examiner@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold shrink-0"
            disabled={sendingEmail || !inviteEmail}
            onClick={handleSendEmail}
          >
            {sendingEmail
              ? <><span className="material-symbols-outlined text-[16px] mr-1 animate-spin">progress_activity</span>Sending...</>
              : <><span className="material-symbols-outlined text-[16px] mr-1">send</span>Send Email</>
            }
          </Button>
        </div>
        {emailStatus && (
          <p className={`text-xs font-semibold flex items-center gap-1 ${emailStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
            <span className="material-symbols-outlined text-[14px]">{emailStatus.ok ? 'check_circle' : 'error'}</span>
            {emailStatus.message}
          </p>
        )}
        <p className="text-xs text-slate-400">The email will contain the pre-filled form link — the examiner just needs to fill their details.</p>
      </div>

      {linkExpiration && (
        <p className="text-xs text-slate-400 font-medium">
          <span className="material-symbols-outlined text-[14px] inline align-text-bottom mr-1">timer</span>
          Token expires: {new Date(linkExpiration).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })} (7 days)
        </p>
      )}
    </div>
  );
}

export default function TeachingBillForm() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const examIdFromUrl = params.get("examId");
  const claimTypeFromUrl = params.get("claimType") || "TEACHING_INTERNAL";

  const [examId, setExamId] = useState(examIdFromUrl);
  const [status, setStatus] = useState(examIdFromUrl ? null : "draft");
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [externalLink, setExternalLink] = useState("");
  const [linkExpiration, setLinkExpiration] = useState(null);
  const [isExistingLink, setIsExistingLink] = useState(false);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const baseSteps = [
    { num: 1, label: "GENERAL" },
    { num: 2, label: "DUTY DETAILS" }
  ];

  const steps = (status && status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED")
    ? [...baseSteps, { num: 3, label: "SUMMARY" }]
    : baseSteps;

  useEffect(() => {
    if (!examIdFromUrl) {
      setExamId(null);
      setStatus("draft");
      setExam(null);
      setCurrentStep(1);
    }
  }, [claimTypeFromUrl, examIdFromUrl]);

  const fetchExam = async (id = examId) => {
    if (!id) return;
    try {
      const res = await api.get(`/faculty/exams/${id}`);
      setExam({ ...res.data });
      setStatus(res.data.status);
      setRefreshKey(k => k + 1);

      if (res.data.status && res.data.status !== "draft" && res.data.status !== "rejected" && res.data.status !== "COORDINATOR_REJECTED") {
        setCurrentStep(3);
      }
    } catch (err) {
      console.error("Failed to fetch exam", err);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (examId && currentStep === 3 && !pdfUrl) {
      const allowedStatuses = ["submitted", "approved", "paid", "SENT_TO_BILLING", "UNDER_COORDINATOR_REVIEW", "COORDINATOR_VERIFIED"];
      if (allowedStatuses.includes(status)) {
        const fetchPdfPreview = async () => {
          setIsPreviewLoading(true);
          try {
            const response = await api.get(`/pdf/claim/${examId}/download`, {
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post(`/faculty/exams/${examId}/submit`, {});
      setStatus("submitted");
      setRefreshKey(k => k + 1);
      setCurrentStep(3);
      showToast("Claim submitted successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Submit failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!examId) return;
    try {
      showToast("Generating PDF...", "info");
      const response = await api.get(`/pdf/claim/${examId}/download`, {
        responseType: 'blob',
        validateStatus: (status) => status < 500,
      });

      if (response.status !== 200) throw new Error("Failed to generate PDF");

      const code = exam?.subject_code || 'Exam';
      const safeCode = code.replace(/[^a-zA-Z0-9-_]/g, '');
      const filename = `${safeCode}-Teaching.pdf`;

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast("PDF Downloaded!", "success");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      showToast("Failed to generate PDF. Please try again.", "error");
    }
  };

  return (
    <div className={`mx-auto space-y-8 font-display pb-12 transition-all duration-300 ${currentStep === 3 ? 'max-w-7xl' : 'max-w-4xl'}`}>

      {/* Rejection Notice */}
      {exam && ['rejected', 'COORDINATOR_REJECTED'].includes(exam.status) && exam.claimActions && exam.claimActions.length > 0 && (
        <Card className={`p-6 border-l-4 ${exam.claimActions[0].action_type === 'REJECTED' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'}`}>
          <div className="flex items-start gap-3">
            <span className={`material-symbols-outlined mt-0.5 ${exam.claimActions[0].action_type === 'REJECTED' ? 'text-red-600' : 'text-orange-600'}`}>
              warning
            </span>
            <div className="flex-1">
              <h3 className={`font-bold mb-2 ${['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'text-red-900' : 'text-orange-900'}`}>
                {['REJECTED', 'REJECT'].includes(exam.claimActions[0].action_type) ? 'Claim Rejected' : 'Claim Sent Back for Correction'}
              </h3>
              {exam.claimActions.map((action, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <p className={`text-sm mb-1 font-medium ${['REJECTED', 'REJECT'].includes(action.action_type) ? 'text-red-700' : 'text-orange-700'}`}>
                    {['REJECTED', 'REJECT'].includes(action.action_type) ? 'Rejected by:' : 'Sent back by:'} {action.action_by_name} on {new Date(action.action_at).toLocaleDateString()}
                  </p>
                  <p className={`text-sm p-3 rounded-lg border bg-white shadow-sm ${['REJECTED', 'REJECT'].includes(action.action_type) ? 'text-red-800 border-red-200' : 'text-orange-800 border-orange-200'}`}>
                    {action.comment}
                  </p>
                </div>
              ))}
              <div className="mt-4">
                <Button
                  onClick={async () => {
                    if (!confirm("Have you fixed all the issues? Click OK to resubmit.")) return;
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
                  }}
                  disabled={loading}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-md"
                >
                  <span className="material-symbols-outlined mr-2 text-[18px]">send</span>
                  {loading ? "Resubmitting..." : "Resubmit Claim Now"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stepper Header */}
      <div className="flex items-center justify-center py-6 pt-0">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          return (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center gap-3 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${isActive ? 'bg-[#293fb8] text-white shadow-lg ring-4 ring-blue-100' :
                  isCompleted ? 'bg-[#293fb8] text-white' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                  {isCompleted ? <span className="material-symbols-outlined">check</span> : step.num}
                </div>
                <span className={`text-[11px] font-bold tracking-widest absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div className={`w-16 sm:w-32 h-1 mx-4 rounded-full transition-colors ${isCompleted ? 'bg-[#293fb8]' : 'bg-slate-200'
                  }`}></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Step 1: General Info */}
        {currentStep === 1 && (
          <div className="p-0">
            {/* Render ExamDetails inside, but provide the navigation under it */}
            <ExamDetails
              examId={examId}
              disabled={examId && status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED"}
              onCreated={(id) => {
                setExamId(id);
                fetchExam(id);
                setCurrentStep(2);
              }}
              claimFormType={claimTypeFromUrl}
              onUpdated={fetchExam}
            />

            {examId && (
              <div className="px-6 pb-6 pt-2 bg-white flex justify-end border-t-0 -mt-2">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#293fb8] hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg"
                >
                  Review Section <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Duty Details */}
        {currentStep === 2 && (
          <div className="p-0">
            <ClaimsSection
              examId={examId}
              exam={exam}
            />

            {examId && (
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-2xl">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="border-slate-300 text-slate-700 font-bold px-6"
                >
                  <span className="material-symbols-outlined mr-2 text-[18px]">arrow_back</span> General Info
                </Button>

                {(status === "draft" || status === "rejected" || status === "COORDINATOR_REJECTED") && claimTypeFromUrl === "TEACHING_INTERNAL" && (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-500/20"
                  >
                    <span className="material-symbols-outlined mr-2 text-[18px]">{loading ? 'sync' : 'check_circle'}</span>
                    {loading ? "Submitting..." : "Submit Claim"}
                  </Button>
                )}

                {status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED" && (
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="bg-[#293fb8] hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg"
                  >
                    View Summary <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Summary (Only available after submission) */}
        {currentStep === 3 && (
          <div className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left Column: Details */}
              <div className="flex flex-col h-full bg-white">
                {/* Status Messages */}
                {examId && (status === "submitted" || status === "approved" || status === "paid" || status === "SENT_TO_BILLING" || status === "UNDER_COORDINATOR_REVIEW" || status === "COORDINATOR_VERIFIED") && (
                  <div className="p-6 bg-green-50/50 border-b border-green-100 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-4 ring-green-50">
                      <span className="material-symbols-outlined text-3xl">task_alt</span>
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-2 tracking-tight">
                      {status === "approved" || status === "paid" ? "Claim Approved" : "Claim Submitted Successfully"}
                    </h3>
                    <p className="text-green-700/80 font-medium text-sm">
                      {status === "approved" || status === "paid"
                        ? "Your claim has been fully evaluated and approved."
                        : "Your claim has been securely submitted for department review."}
                    </p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
                  {(status === "submitted" || status === "approved" || status === "paid" || status === "SENT_TO_BILLING" || status === "UNDER_COORDINATOR_REVIEW" || status === "COORDINATOR_VERIFIED") && (
                    <BillSummary examId={examId} refreshKey={refreshKey} />
                  )}
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
      </div>

      {examId && claimTypeFromUrl === "TEACHING_EXTERNAL" && (status === "draft" || status === "rejected") && (
        <Card className="p-6 border-purple-200 bg-purple-50/50 mt-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">assignment_ind</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">External Examiner — Google Form</h3>
              <p className="text-sm text-slate-500">Generate a token → share the Google Form link with the examiner</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-start gap-3 mb-5 bg-purple-100/60 rounded-xl p-4 border border-purple-200">
            <div className="flex flex-col gap-2 text-xs font-semibold text-purple-800 w-full">
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span> Click <b>Generate Token</b> below</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span> Enter the examiner's email and click <b>Send Email</b> — invitation is sent automatically</div>
              <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span> Examiner clicks the link in the email — token is <b>already pre-filled ✅</b></div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Button
              disabled={status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED"}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              onClick={async () => {
                try {
                  const res = await api.post(`/faculty/exams/${examId}/external-link`);
                  setExternalLink(res.data.link);
                  setLinkExpiration(res.data.expiresAt);
                  setIsExistingLink(res.data.isExisting);
                  if (res.data.isExisting) {
                    showToast("Existing valid token retrieved!", "success");
                  } else {
                    showToast("New token generated successfully!", "success");
                  }
                } catch {
                  showToast("Failed to generate token", "error");
                }
              }}
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">key</span>
              {externalLink ? "Regenerate Token" : "Generate Token"}
            </Button>

            {externalLink && (
              <ExternalSharingPanel
                examId={examId}
                externalLink={externalLink}
                linkExpiration={linkExpiration}
                isExistingLink={isExistingLink}
                showToast={showToast}
              />
            )}
          </div>
        </Card>
      )}

    </div>
  );
}
