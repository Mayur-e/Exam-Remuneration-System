import { useEffect, useState } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/card";

// Icons
import {
  ReceiptIcon,
  CurrencyRupeeIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  DownloadIcon,
  FileTextIcon
} from "../../components/icons/logo";

export default function BillSummary({ examId, refreshKey, billData }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(!billData);

  useEffect(() => {
    if (billData) {
      setBill(billData);
      setLoading(false);
      return;
    }

    if (!examId) return;

    setLoading(true);
    api
      .get(`/faculty/exams/${examId}/bill`)
      .then((res) => setBill(res.data))
      .catch(() => setBill(null))
      .finally(() => setLoading(false));
  }, [examId, refreshKey, billData]);

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600">Loading bill summary...</p>
      </Card>
    );
  }

  if (!bill) {
    return (
      <Card className="p-6 text-center">
        <AlertCircleIcon className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Bill not generated yet</p>
      </Card>
    );
  }

  const {
    examiner_amount_calculated,
    examiner_amount,
    staff_amount,
    chairman_allowance,
    conveyance_amount,
    total_amount,
    tds_amount,
    net_amount,
    min_applied
  } = bill;

  // Use backend values
  const finalTds = tds_amount !== null ? Number(tds_amount) : (total_amount * 0.1);
  const finalNet = net_amount !== null ? Number(net_amount) : (total_amount - finalTds);
  const requiresRevenueStamp = finalNet > 5000;

  return (
    <Card className="p-6 bg-white border-gray-200 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ReceiptIcon className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold">Bill Summary</h3>
          <p className="text-sm text-gray-600">Remuneration calculation</p>
        </div>
      </div>

      {/* Examiner Amount - Only show for teaching claims */}
      <div className="space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <CurrencyRupeeIcon className="w-4 h-4" />
          Amount Breakdown
        </h4>

        {examiner_amount_calculated > 0 && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Calculated Examiner Amount</span>
              <span className="font-medium">
                ₹{Number(examiner_amount_calculated).toFixed(2)}
              </span>
            </div>

            {min_applied && (
              <div className="flex items-center gap-2 text-blue-700 text-sm bg-blue-50 p-2 rounded">
                <CheckCircleIcon className="w-4 h-4" />
                Minimum payable applied (₹500)
              </div>
            )}

            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Final Examiner Amount</span>
              <span className="font-medium">
                ₹{Number(examiner_amount).toFixed(2)}
              </span>
            </div>
          </>
        )}

        {staff_amount > 0 && (
          <div className={`flex justify-between ${examiner_amount_calculated > 0 ? '' : 'pt-2 border-t'}`}>
            <span className="text-gray-600">Staff Allowance</span>
            <span>₹{Number(staff_amount).toFixed(2)}</span>
          </div>
        )}

        {chairman_allowance > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Chairman Allowance</span>
            <span>₹{Number(chairman_allowance).toFixed(2)}</span>
          </div>
        )}

        {conveyance_amount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Conveyance</span>
            <span>₹{Number(conveyance_amount).toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between pt-2 border-t font-semibold">
          <span>Total Amount</span>
          <span>₹{Number(total_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* TDS */}
      <div className="p-3 bg-red-50 border border-red-200 rounded">
        <div className="flex justify-between text-red-700">
          <span>TDS (10%)</span>
          <span>-₹{finalTds.toFixed(2)}</span>
        </div>
      </div>

      {/* Net Payable */}
      <div className="p-3 bg-green-50 border border-green-200 rounded">
        <div className="flex justify-between font-semibold text-green-700">
          <span>Net Payable</span>
          <span>₹{finalNet.toFixed(2)}</span>
        </div>
      </div>

      {/* Notices */}
      {requiresRevenueStamp && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded flex gap-2">
          <AlertCircleIcon className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">
            Revenue stamp required (amount exceeds ₹5,000)
          </p>
        </div>
      )}

      <div className="p-3 bg-gray-50 border rounded flex gap-2">
        <FileTextIcon className="w-5 h-5 text-gray-600" />
        <p className="text-xs text-gray-600">
          Payment will be processed after approval by accounts department.
        </p>
      </div>
    </Card>
  );
}
