import { useEffect, useState } from "react";
import api from "../../services/api";

export default function BillSummary({ examId }) {
  const [bill, setBill] = useState(null);

  useEffect(() => {
    api.get(`/faculty/exams/${examId}/bill`)
      .then(res => setBill(res.data))
      .catch(() => setBill(null));
  }, [examId]);

  if (!bill) return <p>Loading bill summary...</p>;

  return (
    <div className="space-y-2 text-sm">
      <h3 className="font-semibold">Bill Summary</h3>

      <div className="flex justify-between">
        <span>Examiner Amount</span>
        <span>₹ {bill.examiner_amount}</span>
      </div>

      <div className="flex justify-between">
        <span>Staff Amount</span>
        <span>₹ {bill.staff_amount}</span>
      </div>

      <div className="flex justify-between">
        <span>Conveyance</span>
        <span>₹ {bill.conveyance_amount}</span>
      </div>

      <hr />

      <div className="flex justify-between font-bold">
        <span>Total Payable</span>
        <span>₹ {bill.total_amount}</span>
      </div>

      {bill.total_amount > 5000 && (
        <p className="text-xs text-muted-foreground">
          Revenue stamp required (Amount &gt; ₹5,000)
        </p>
      )}
    </div>
  );
}
