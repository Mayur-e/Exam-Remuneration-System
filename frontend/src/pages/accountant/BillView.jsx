import { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function BillView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    api.get(`/accountant/claims/${id}`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <p>Loading...</p>;

  const { exam, calculation } = data;

  const approve = async () => {
    await api.post(`/accountant/claims/${id}/approve`);
    alert("Approved");
  };

  const reject = async () => {
    await api.post(`/accountant/claims/${id}/reject`, { remarks });
    alert("Rejected");
  };

  const pay = async () => {
    await api.post(`/accountant/claims/${id}/pay`, {
      transaction_ref: "UTR123",
      method: "NEFT",
      payment_date: new Date().toISOString().slice(0, 10)
    });
    alert("Paid");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Claim Details</h2>

      <Card className="p-4 space-y-2">
        <p><b>Faculty:</b> {exam.name}</p>
        <p><b>Exam:</b> {exam.exam_type}</p>
        <p><b>Status:</b> {exam.status}</p>
        <p><b>Total:</b> ₹ {calculation.total_amount}</p>
      </Card>

      {exam.status === "submitted" && (
        <div className="space-x-2">
          <Button onClick={approve}>Approve</Button>
          <Button variant="destructive" onClick={reject}>Reject</Button>
        </div>
      )}

      {exam.status === "approved" && (
        <Button onClick={pay}>Mark as Paid</Button>
      )}

      <textarea
        placeholder="Rejection remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        className="border w-full p-2"
      />
    </div>
  );
}
