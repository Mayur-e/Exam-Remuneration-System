import { useState, useEffect } from "react";
import api from "../../services/api";
import { useLocation } from "react-router-dom";

import ExamDetails from "./ExamDetails";
import ClaimsSection from "./ClaimsSection";
// import DocumentsSection from "./DocumentsSection";
import BillSummary from "./BillSummary";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function TeachingBillForm() {
  const location = useLocation();
  const examIdFromUrl = new URLSearchParams(location.search).get("examId");

  const [examId, setExamId] = useState(examIdFromUrl);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      await api.post(`/faculty/exams/${examId}/submit`);
      setStatus("submitted");
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
          claimFormType="TEACHING_INTERNAL"
          onUpdated={fetchExam}
        />
      </Card>

      {/* STEP 2 */}
      {examId && (
        <Card className="p-6">
          <ClaimsSection
            examId={examId}
            exam = {exam}
          />
        </Card>
      )}

      {/* STEP 3 */}
      {/* {examId && (
        <Card className="p-6">
          <DocumentsSection examId={examId} />
        </Card>
      )} */}

      {/* STEP 4 */}
      {examId && status === "submitted" && (
        <Card className="p-6">
          <BillSummary examId={examId} refreshKey={refreshKey} />
        </Card>
      )}

      {/* SUBMIT */}
      {examId && status === "draft" && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Claim"}
          </Button>
        </div>
      )}
    </div>
  );
}
