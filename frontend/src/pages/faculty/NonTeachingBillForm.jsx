import { useState, useEffect } from "react";
import api from "../../services/api";
import { useLocation } from "react-router-dom";

import ExamDetails from "./ExamDetails";
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
            alert("Non-Teaching claim submitted successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Submit failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Non-Teaching Staff Claim</h2>

            {/* STEP 1: Exam Details */}
            <Card className="p-6">
                <ExamDetails
                    examId={examId}
                    disabled={examId && status !== "draft"}
                    onCreated={(id) => {
                        setExamId(id);
                        fetchExam(id);
                    }}
                    claimFormType="NON_TEACHING"
                    onUpdated={fetchExam}
                />
            </Card>

            {/* STEP 2: Staff Details */}
            {examId && (
                <StaffClaimsSection
                    examId={examId}
                    disabled={status !== "draft"}
                />
            )}

            {/* STEP 3: Bill Summary (After Submission) */}
            {examId && status === "submitted" && (
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
            )}

            {/* SUBMIT BUTTON */}
            {examId && status === "draft" && (
                <Card className="p-6 bg-yellow-50 border-yellow-200">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="declaration"
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="declaration" className="text-sm text-gray-700">
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
        </div>
    );
}
