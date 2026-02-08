import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
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
  CheckCircleIcon,
  CurrencyRupeeIcon
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
  const [editingAllowances, setEditingAllowances] = useState(false);
  const [allowances, setAllowances] = useState({
    chairman_allowance: 0,
    conveyance_amount: 0
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/accountant/claims/${id}`);
      setData(res.data);

      // Initialize allowances from calculation data
      if (res.data.calculation) {
        setAllowances({
          chairman_allowance: res.data.calculation.chairman_allowance || 0,
          conveyance_amount: res.data.calculation.conveyance_amount || 0
        });
      }
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

  const handleUpdateAllowances = async () => {
    setProcessing(true);
    try {
      // Force chairman allowance to 0 for practical exams
      const updatedAllowances = {
        ...allowances,
        chairman_allowance: ['PR', 'OR', 'TW'].includes(exam.exam_type) ? 0 : allowances.chairman_allowance
      };

      await api.put(`/accountant/claims/${id}/allowances`, updatedAllowances);
      showToast("Allowances updated successfully!", "success");
      setEditingAllowances(false);
      fetchDetails(); // Refresh to get updated calculations
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update allowances", "error");
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                <p className="text-muted-foreground">Subject</p>
                <p className="font-medium">{exam.subject_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Exam Type</p>
                <p className="font-medium">{exam.exam_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(exam.exam_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Students</p>
                <p className="font-medium">{exam.students_count}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Program</p>
                <p className="font-medium">{exam.program}</p>
              </div>
              {exam.second_examiner && (
                <div className="col-span-2 mt-2 pt-2 border-t border-gray-100">
                  <p className="text-muted-foreground">Second Examiner</p>
                  <p className="font-medium text-card-foreground">{exam.second_examiner}</p>
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
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{examinerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{examinerEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mobile</p>
                <p className="font-medium">
                  {isExternal ? (exam.external_examiner_mobile || 'N/A') : (exam.faculty_mobile || 'N/A')}
                </p>
              </div>
              {isExternal && (
                <div>
                  <p className="text-muted-foreground">Institute</p>
                  <p className="font-medium">{exam.parent_institute}</p>
                </div>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg border border-gray-100">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <BuildingOfficeIcon className="w-4 h-4" />
                Bank Account Details
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{bankName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Number</p>
                  <p className="font-medium">{accNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IFSC Code</p>
                  <p className="font-medium">{ifsc || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">PAN Number</p>
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
          </Card>

          {/* Staff Table for Non-Teaching Claims */}
          {exam.claim_form_type === 'NON_TEACHING' && staff && staff.length > 0 && (
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Supporting Staff Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b-2 border-blue-200">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Designation</th>
                      <th className="px-4 py-3 text-right font-semibold text-foreground">Rate (₹)</th>
                      <th className="px-4 py-3 text-right font-semibold text-foreground">Prep & Clean Rs</th>
                      <th className="px-4 py-3 text-right font-semibold text-foreground">Batch Rs</th>
                      <th className="px-4 py-3 text-right font-semibold text-foreground">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {staff.map((s, idx) => {
                      const prepClean = Number(s.prep_clean_amount || 0);
                      const batch = Number(s.batch_amount || 0);
                      const total = Number(s.total_amount || 0);
                      const rate = Number(s.rate || 0);

                      return (
                        <tr key={idx} className="hover:bg-muted">
                          <td className="px-4 py-3 font-medium text-foreground">{s.staff_name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{s.staff_role}</td>
                          <td className="px-4 py-3 text-right text-foreground">₹{rate.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">
                            {prepClean > 0 ? `₹${prepClean.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right text-blue-600 font-medium">₹{batch.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-purple-600 font-bold">₹{total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-blue-50 border-t-2 border-blue-200 font-bold">
                      <td colSpan="5" className="px-4 py-3 text-right text-foreground">Grand Total:</td>
                      <td className="px-4 py-3 text-right text-blue-700 text-lg">
                        ₹{staff.reduce((sum, s) => sum + Number(s.total_amount || 0), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

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

          {/* Allowances Management - Only for non-paid claims */}
          {!isPaid && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                  <CurrencyRupeeIcon className="w-5 h-5 text-blue-600" />
                  Manage Allowances
                </h3>
                {!editingAllowances && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingAllowances(true)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Chairman Allowance */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Chairman Allowance (₹)
                    {['PR', 'OR', 'TW'].includes(exam.exam_type) && (
                      <span className="relative group cursor-help">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="absolute left-6 top-0 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          Not applicable for Practical exams
                        </span>
                      </span>
                    )}
                  </label>
                  {editingAllowances ? (
                    <Input
                      type="number"
                      value={allowances.chairman_allowance}
                      onChange={(e) => setAllowances({ ...allowances, chairman_allowance: e.target.value })}
                      placeholder="0"
                      min="0"
                      className={`bg-card ${['PR', 'OR', 'TW'].includes(exam.exam_type) ? 'border-2 border-red-400 bg-red-50 cursor-not-allowed' : ''}`}
                      disabled={['PR', 'OR', 'TW'].includes(exam.exam_type)}
                    />
                  ) : (
                    <div className={`p-3 rounded-lg border ${['PR', 'OR', 'TW'].includes(exam.exam_type) ? 'bg-red-50 border-red-200' : 'bg-card border-border'}`}>
                      <p className="font-semibold text-foreground">
                        {['PR', 'OR', 'TW'].includes(exam.exam_type)
                          ? 'N/A'
                          : `₹${Number(allowances.chairman_allowance).toFixed(2)}`
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Conveyance Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Conveyance Amount (₹)
                    {isExternal && (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        For External Examiner
                      </span>
                    )}
                  </label>
                  {editingAllowances ? (
                    <Input
                      type="number"
                      value={allowances.conveyance_amount}
                      onChange={(e) => setAllowances({ ...allowances, conveyance_amount: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="bg-card"
                    />
                  ) : (
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <p className="font-semibold text-foreground">
                        ₹{Number(allowances.conveyance_amount).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {editingAllowances && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleUpdateAllowances}
                      disabled={processing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {processing ? "Saving..." : "Save & Recalculate"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingAllowances(false);
                        // Reset to original values
                        if (data.calculation) {
                          setAllowances({
                            chairman_allowance: data.calculation.chairman_allowance || 0,
                            conveyance_amount: data.calculation.conveyance_amount || 0
                          });
                        }
                      }}
                      disabled={processing}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Info Notice */}
                <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">ℹ️ Note:</span> Updating allowances will automatically recalculate the total bill amount and update the payee's view.
                  </p>
                </div>
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
              <div key={idx} className="bg-card p-4 rounded-lg border border-red-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-foreground">{action.action_by_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(action.action_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-foreground text-sm">{action.comment}</p>
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
