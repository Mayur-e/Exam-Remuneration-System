import { useState, useEffect } from "react";
import api from "../../services/api";

import ExamDetails from "./ExamDetails";
import ClaimsSection from "./ClaimsSection";
// import DocumentsSection from "./DocumentsSection";
import BillSummary from "./BillSummary";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function TeachingBillForm() {
  const [examId, setExamId] = useState(null);
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);

  useEffect(() => {
    if (!examId) return;

    api.get(`/faculty/exams/${examId}`).then(res => {
      setExam(res.data);
    });
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
          disabled={status !== "draft"}
          onCreated={setExamId}
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
      {examId && status !== "draft" && (
        <Card className="p-6">
          <BillSummary examId={examId} />
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
