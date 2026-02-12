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


export default function TeachingBillForm() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const examIdFromUrl = params.get("examId");
  const claimTypeFromUrl =
    params.get("claimType") || "TEACHING_INTERNAL";


  const [examId, setExamId] = useState(examIdFromUrl);
  const [status, setStatus] = useState(examIdFromUrl ? null : "draft");
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [externalLink, setExternalLink] = useState("");
  const [linkExpiration, setLinkExpiration] = useState(null);
  const [isExistingLink, setIsExistingLink] = useState(false);


  useEffect(() => {
    // New claim → reset everything
    if (!examIdFromUrl) {
      setExamId(null);
      setStatus("draft");
      setExam(null);
    }
  }, [claimTypeFromUrl]);


  // ✅ DEFINE fetchExam
  const fetchExam = async (id = examId) => {
    if (!id) return;

    try {
      const res = await api.get(`/faculty/exams/${id}`);
      setExam({ ...res.data });
      setStatus(res.data.status);
      setRefreshKey(k => k + 1); // triggers BillSummary refresh
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
      setRefreshKey(k => k + 1); // Refresh summary
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
        validateStatus: (status) => status < 500, // Resolve only if the status code is less than 500
      });

      if (response.status !== 200) {
        throw new Error("Failed to generate PDF");
      }

      // Construct filename
      const code = exam?.subject_code || 'Exam';
      const safeCode = code.replace(/[^a-zA-Z0-9-_]/g, '');
      const filename = `${safeCode}-Teaching.pdf`;

      // Create a URL for the blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Trigger direct download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast("PDF Downloaded!", "success");

      // Clean up the URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {
      console.error("Failed to generate PDF:", err);
      showToast("Failed to generate PDF. Please try again.", "error");
    }
  };



  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Teaching Staff Claim</h2>

      {/* Rejection/Sent-Back Notice */}
      {exam && exam.claimActions && exam.claimActions.length > 0 && (
        <Card className={`p-6 ${exam.claimActions[0].action_type === 'REJECTED' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className={`w-6 h-6 ${exam.claimActions[0].action_type === 'REJECTED' ? 'text-red-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* STEP 1 */}
      <Card className="p-6">
        <ExamDetails
          examId={examId}
          disabled={examId && status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED"}
          onCreated={(id) => {
            setExamId(id);
            fetchExam(id); // load immediately after create
          }}
          claimFormType={claimTypeFromUrl}
          onUpdated={fetchExam}
        />
      </Card>


      {examId &&
        claimTypeFromUrl === "TEACHING_EXTERNAL" &&
        (status === "draft" || status === "rejected") && (
          <Card className="p-4 space-y-4">
            <Button
              disabled={status !== "draft" && status !== "rejected" && status !== "COORDINATOR_REJECTED"}
              onClick={async () => {
                try {
                  const res = await api.post(
                    `/faculty/exams/${examId}/external-link`
                  );
                  setExternalLink(res.data.link);
                  setLinkExpiration(res.data.expiresAt);
                  setIsExistingLink(res.data.isExisting);

                  if (res.data.isExisting) {
                    showToast("Existing valid link retrieved!", "success");
                  } else {
                    showToast("New link generated successfully!", "success");
                  }
                } catch {
                  showToast("Failed to generate external link", "error");
                }
              }}
            >
              {status === "submitted" || status === "approved" || status === "paid"
                ? "External Claim Submitted"
                : externalLink ? "Regenerate Link" : "Generate External Examiner Link"}

            </Button>

            {externalLink && (
              <div className="space-y-3">
                <div className={`p-3 border rounded text-sm font-medium ${isExistingLink
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                  {isExistingLink
                    ? '🔗 Existing valid link retrieved!'
                    : '✅ New link generated successfully!'}
                  {' '}Please share this link with the external examiner.
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    value={externalLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        // Focus the window first to ensure clipboard access
                        window.focus();
                        await navigator.clipboard.writeText(externalLink);
                        showToast("Link copied to clipboard", "success");
                      } catch (err) {
                        console.error("Clipboard error:", err);
                        // Fallback: Select the text
                        const input = document.querySelector('input[readonly]');
                        if (input) {
                          input.select();
                          try {
                            document.execCommand('copy');
                            showToast("Link copied to clipboard", "success");
                          } catch (e) {
                            showToast("Failed to copy. Please manually copy the link.", "error");
                          }
                        }
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
                {linkExpiration && (
                  <p className="text-xs text-muted-foreground">
                    ⏰ Expires on: {new Date(linkExpiration).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Note: This link is valid for 7 days. Once the examiner submits, it cannot be used again.
                </p>
              </div>
            )}
          </Card>
        )}





      {/* STEP 2 */}
      {examId && (
        <Card className="p-6">
          <ClaimsSection
            examId={examId}
            exam={exam}
          />
        </Card>
      )}



      {/* STEP 4 */}
      {examId && (status === "submitted" || status === "approved") && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center space-y-2 mb-4">
            <h3 className="text-lg font-bold text-green-700">
              {status === "approved" ? "Claim Approved" : "Claim Submitted Successfully"}
            </h3>
            <p className="text-green-600">
              {status === "approved"
                ? "Your claim has been approved."
                : "Your claim has been submitted for approval."}
            </p>
            <div className="pt-2">
              <Button
                onClick={handleDownloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </Button>
            </div>
          </div>
          <BillSummary examId={examId} refreshKey={refreshKey} />
        </Card>
      )}

      {/* SUBMIT */}
      {examId && status === "draft" && claimTypeFromUrl === "TEACHING_INTERNAL" && (
        <div className="flex justify-end p-4">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Claim"}
          </Button>
        </div>
      )}

      {/* RESUBMIT for Rejected Claims */}
      {examId && (status === "rejected" || status === "COORDINATOR_REJECTED") && claimTypeFromUrl === "TEACHING_INTERNAL" && (
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
                        fetchExam(); // Refresh to show new status
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
