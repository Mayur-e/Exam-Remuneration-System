import { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import BillSummary from "../faculty/BillSummary";
import PaymentModal from "./PaymentModal";

// Icons
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  FileTextIcon,
  CheckCircleIcon
} from "../../components/icons/logo";

export default function BillView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/accountant/claims/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentData) => {
    setProcessing(true);
    try {
      await api.post(`/accountant/claims/${id}/pay`, paymentData);
      alert("Payment processed successfully!");
      setShowPaymentModal(false);
      fetchDetails(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this claim? This will mark it as ready for payment.")) {
      return;
    }

    try {
      await api.post(`/accountant/claims/${id}/approve`);
      alert("Claim approved successfully!");
      fetchDetails(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve claim");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Claim not found</div>;

  const { exam, staff, payment } = data;
  const isPaid = exam.status === 'paid';
  const canPay = exam.status === 'submitted' || exam.status === 'approved';

  // Determine which bank details to show
  const isExternal = exam.claim_form_type === 'TEACHING_EXTERNAL';
  const showFacultyBank = !isExternal;

  // External Examiner Logic
  const examinerName = isExternal ? exam.external_examiner_name : exam.faculty_name;
  const examinerEmail = isExternal ? exam.external_examiner_email : exam.faculty_email;
  const bankName = isExternal ? exam.external_bank_name : exam.faculty_bank_name;
  const accNumber = isExternal ? exam.external_account_number : exam.faculty_account_number;
  const ifsc = isExternal ? exam.external_ifsc_code : exam.faculty_ifsc_code;
  const pan = isExternal ? exam.external_pan_number : exam.faculty_pan_number;
  const panUrl = isExternal ? exam.external_pan_url : exam.faculty_pan_url;
  const chequeUrl = isExternal ? exam.external_cheque_url : exam.faculty_cheque_url;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Claim #{exam.id} Details</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{exam.claim_form_type}</span>
            <span>•</span>
            <span className={`capitalize font-medium ${exam.status === 'paid' ? 'text-green-600' :
                exam.status === 'approved' ? 'text-blue-600' :
                  'text-orange-600'
              }`}>
              {exam.status}
            </span>
          </div>
        </div>

        <div className="ml-auto flex gap-3">
          {/* Approve button for submitted claims */}
          {exam.status === 'submitted' && (
            <Button
              onClick={handleApprove}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Approve Claim
            </Button>
          )}

          {/* Process Payment button for approved claims */}
          {exam.status === 'approved' && (
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Process Payment
            </Button>
          )}

          {/* Paid status badge */}
          {isPaid && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-semibold">Paid on {new Date(payment?.payment_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Exam & Bank Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-blue-600" />
              Exam Information
            </h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-gray-500">Subject</p>
                <p className="font-medium">{exam.subject_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Exam Type</p>
                <p className="font-medium">{exam.exam_type}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{new Date(exam.exam_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Students</p>
                <p className="font-medium">{exam.students_count}</p>
              </div>
              <div>
                <p className="text-gray-500">Program</p>
                <p className="font-medium">{exam.program}</p>
              </div>
            </div>
          </Card>

          {/* Payee Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Payee Details ({isExternal ? 'External Examiner' : 'Faculty'})
            </h3>

            <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{examinerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{examinerEmail}</p>
              </div>
              {isExternal && (
                <div>
                  <p className="text-gray-500">Institute</p>
                  <p className="font-medium">{exam.parent_institute}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <BuildingOfficeIcon className="w-4 h-4" />
                Bank Account Details
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Bank Name</p>
                  <p className="font-medium">{bankName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Number</p>
                  <p className="font-medium">{accNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-500">IFSC Code</p>
                  <p className="font-medium">{ifsc || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-500">PAN Number</p>
                  <p className="font-medium">{pan || 'Not provided'}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="mt-4 flex gap-4">
                {panUrl && (
                  <a href={`http://localhost:5000${panUrl}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                    View PAN Card
                  </a>
                )}
                {chequeUrl && (
                  <a href={`http://localhost:5000${chequeUrl}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                    View Cancelled Cheque
                  </a>
                )}
              </div>
            </div>

            {/* Travel Proofs for External */}
            {isExternal && !exam.is_local && (
              <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h4 className="font-medium text-amber-800 mb-2">Travel Allowance Proof</h4>
                <p className="text-sm text-amber-900 mb-2">
                  Examiner is creating claim for &gt; 25km travel amount: <b>₹{exam.travel_allowance}</b>
                </p>
                {exam.travel_proof_url ? (
                  <a href={`http://localhost:5000${exam.travel_proof_url}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
                    View Travel Tickets/Bills
                  </a>
                ) : (
                  <span className="text-sm text-red-500">No travel proof uploaded</span>
                )}
              </div>
            )}
          </Card>

          {/* Payment Record Display if Paid */}
          {isPaid && payment && (
            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                Payment Record
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Payment Date</p>
                  <p className="font-medium text-green-900">{new Date(payment.payment_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-green-700">Amount Paid</p>
                  <p className="font-medium text-green-900">₹{Number(payment.amount).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-green-700">Method</p>
                  <p className="font-medium text-green-900">{payment.payment_method}</p>
                </div>
                <div>
                  <p className="text-green-700">Reference No</p>
                  <p className="font-medium text-green-900">{payment.reference_number}</p>
                </div>
                {payment.notes && (
                  <div className="col-span-2">
                    <p className="text-green-700">Notes</p>
                    <p className="font-medium text-green-900">{payment.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Calculation Summary */}
        <div className="space-y-6">
          <BillSummary examId={id} billData={data.calculation} />

          {/* Staff Info for Non-Teaching */}
          {staff && staff.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Staff Allocation</h3>
              <div className="space-y-3">
                {staff.map((s, idx) => (
                  <div key={idx} className="text-sm border-b pb-2 last:border-0">
                    <div className="flex justify-between font-medium">
                      <span>{s.staff_name || s.staff_role}</span>
                      <span className="text-gray-500">{s.staff_role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePayment}
        amount={data.calculation?.net_amount || 0}
        loading={processing}
      />
    </div>
  );
}
