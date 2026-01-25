import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import BillSummary from "../faculty/BillSummary";
import PaymentModal from "./PaymentModal";
import RejectModal from "./RejectModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

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
      showToast("Payment processed successfully!", "success");
      setShowPaymentModal(false);
      fetchDetails(); // Refresh
    } catch (err) {
      showToast(err.response?.data?.message || "Payment failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await api.post(`/accountant/claims/${id}/approve`);
      showToast("Claim approved successfully!", "success");
      setShowApproveConfirm(false);
      fetchDetails(); // Refresh
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve claim", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reason) => {
    setProcessing(true);
    try {
      await api.post(`/accountant/claims/${id}/reject`, { reason });
      showToast("Claim rejected successfully!", "success");
      setShowRejectModal(false);
      fetchDetails(); // Refresh
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject claim", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Claim not found</div>;

  const { exam, staff, payment, actions } = data;
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
              onClick={() => setShowApproveConfirm(true)}
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

          {/* Reject button for submitted/approved claims */}
          {(exam.status === 'submitted' || exam.status === 'approved') && (
            <Button
              onClick={() => setShowRejectModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Reject Claim
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
              {exam.second_examiner && (
                <div className="col-span-2 mt-2 pt-2 border-t border-gray-100">
                  <p className="text-gray-500">Second Examiner</p>
                  <p className="font-medium text-gray-800">{exam.second_examiner}</p>
                </div>
              )}
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
              <div>
                <p className="text-gray-500">Mobile</p>
                <p className="font-medium">
                  {isExternal ? (exam.external_examiner_mobile || 'N/A') : (exam.faculty_mobile || 'N/A')}
                </p>
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
                  <p className="font-medium">
                    {isExternal
                      ? (exam.external_pan_number || 'Not provided')
                      : (exam.faculty_pan_card || exam.faculty_pan_number || 'Not provided')}
                  </p>
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

      {/* Rejection History */}
      {actions && actions.filter(a => a.action_type === 'REJECTED').length > 0 && (
        <Card className="p-6 mt-6 bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-900 mb-3">Rejection History</h3>
          <div className="space-y-3">
            {actions.filter(a => a.action_type === 'REJECTED').map((action, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">{action.action_by_name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(action.action_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{action.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePayment}
        amount={data.calculation?.net_amount || 0}
        loading={processing}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onReject={handleReject}
        processing={processing}
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="Approve Claim"
        message="Are you sure you want to approve this claim? This will mark it as ready for payment processing."
        confirmText="Yes, Approve"
        cancelText="Cancel"
        confirmColor="blue"
        loading={processing}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
}
