import { useState, useEffect } from "react";
import api from "../../services/api";
import { useLocation } from "react-router-dom";

import ExamDetails from "./ExamDetails";
import ClaimsSection from "./ClaimsSection";
// import DocumentsSection from "./DocumentsSection";
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
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [externalLink, setExternalLink] = useState("");
  const [chairmanAllowance, setChairmanAllowance] = useState("");
  const [conveyanceAllowance, setConveyanceAllowance] = useState("");


  useEffect(() => {
    // New claim → reset everything
    if (!examIdFromUrl) {
      setExamId(null);
      setStatus("draft");
      setExam(null);
      setChairmanAllowance("");
      setConveyanceAllowance("");
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
      await api.post(`/faculty/exams/${examId}/submit`, {
        chairman_allowance: Number(chairmanAllowance) || 0,
        conveyance_amount: Number(conveyanceAllowance) || 0
      });
      setStatus("submitted");
      setRefreshKey(k => k + 1); // Refresh summary
    } catch (err) {
      alert(err.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Teaching Staff Claim</h2>

      {/* STEP 1 */}
      <Card className="p-6">
        <ExamDetails
          examId={examId}
          disabled={examId && status !== "draft"}
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
        status === "draft" && (
          <Card className="p-4 space-y-4">
            <Button
              disabled={status !== "draft"}
              onClick={async () => {
                try {
                  const res = await api.post(
                    `/faculty/exams/${examId}/external-link`
                  );
                  setExternalLink(res.data.link);
                } catch {
                  alert("Failed to generate external link");
                }
              }}
            >
              {status !== "draft"
                ? "External Claim Submitted"
                : "Generate External Examiner Link"}

            </Button>

            {externalLink && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">
                  ✅ Link generated successfully! Please share this link with the external examiner.
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
                      await navigator.clipboard.writeText(externalLink);
                      alert("Link copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
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

      {/* STEP 2.5: Allowances (Internal Only) */}
      {examId && claimTypeFromUrl === "TEACHING_INTERNAL" && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Allowances</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chairman Allowance</label>
              <Input
                type="number"
                placeholder="0"
                value={chairmanAllowance}
                onChange={(e) => setChairmanAllowance(e.target.value)}
                disabled={status !== "draft"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Conveyance Allowance (External Only)</label>
              <Input
                type="number"
                placeholder="0"
                value={conveyanceAllowance}
                onChange={(e) => setConveyanceAllowance(e.target.value)}
                disabled={status !== "draft"}
              />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4 */}
      {examId && status === "submitted" && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center space-y-2 mb-4">
            <h3 className="text-lg font-bold text-green-700">Claim Submitted Successfully</h3>
            <p className="text-green-600">Your claim has been submitted for approval.</p>
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
    </div>
  );
}
