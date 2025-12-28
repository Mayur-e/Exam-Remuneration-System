import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import ExternalExamHeader from "./ExternalExamHeader";
import ExternalExaminerForm from "./ExternalExaminerForm";

export default function ExternalTeachingForm() {
  const { token } = useParams();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .get(`/external/claim/${token}`)
      .then(res => setExam(res.data))
      .catch(() => alert("Invalid or expired link"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (!exam) return <p>Invalid link</p>;
  if (submitted) return <SuccessScreen />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">External Examiner Claim</h2>

      <Card className="p-6">
        <ExternalExamHeader exam={exam} />
      </Card>

      <Card className="p-6">
        <ExternalExaminerForm
          token={token}
          onSubmitted={() => setSubmitted(true)}
        />
      </Card>
    </div>
  );
}

function SuccessScreen() {
  return (
    <Card className="p-6 text-center">
      <h3 className="text-xl font-semibold">Claim Submitted</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Thank you. Your claim has been successfully submitted.
      </p>
    </Card>
  );
}
