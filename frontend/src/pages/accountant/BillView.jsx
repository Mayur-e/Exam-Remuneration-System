import { useEffect, useState } from "react";
import { useToast } from "../../hooks/useToast";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import BillSummary from "../faculty/BillSummary";
import PaymentModal from "./PaymentModal";
import RejectModal from "./RejectModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

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
      fetchDetails();
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
      fetchDetails();
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
      fetchDetails();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject claim", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateAllowances = async () => {
    setProcessing(true);
    try {
      const isPractical = ['PR', 'OR', 'TW'].includes(data.exam.exam_type);
      const updatedAllowances = {
        ...allowances,
        chairman_allowance: (isPractical || !data.exam.is_coordinator) ? 0 : allowances.chairman_allowance
      };

      await api.put(`/accountant/claims/${id}/allowances`, updatedAllowances);
      showToast("Allowances updated successfully!", "success");
      setEditingAllowances(false);
      fetchDetails();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update allowances", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading claim details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light">
        <span className="material-symbols-outlined text-6xl text-red-300 mb-4">error</span>
        <h3 className="text-xl font-bold text-slate-800">Claim Not Found</h3>
        <p className="text-slate-500 mt-2">The requested claim could not be found.</p>
        <button onClick={() => navigate(-1)} className="mt-6 text-primary hover:underline font-medium inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Go Back
        </button>
      </div>
    );
  }

  const { exam, staff, payment, actions } = data;
  const isPaid = exam.status === 'paid';
  const canPay = exam.status === 'submitted' || exam.status === 'approved' || exam.status === 'SENT_TO_BILLING';
  const isExternal = exam.claim_form_type === 'TEACHING_EXTERNAL';

  const examinerName = isExternal ? exam.external_examiner_name : exam.faculty_name;
  const examinerEmail = isExternal ? exam.external_examiner_email : exam.faculty_email;
  const bankName = isExternal ? exam.external_bank_name : exam.faculty_bank_name;
  const accNumber = isExternal ? exam.external_account_number : exam.faculty_account_number;
  const ifsc = isExternal ? exam.external_ifsc_code : exam.faculty_ifsc_code;
  const panUrl = isExternal ? exam.external_pan_url : exam.faculty_pan_url;
  const chequeUrl = isExternal ? exam.external_cheque_url : exam.faculty_cheque_url;
  const pan = isExternal ? exam.external_pan_number : (exam.faculty_pan_card || exam.faculty_pan_number);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 font-display bg-background-light min-h-[calc(100vh-4rem)] pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claim #{exam.id}</h1>
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md ${exam.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                exam.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  exam.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                {exam.status === 'submitted' || exam.status === 'SENT_TO_BILLING' ? 'Pending' : exam.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">category</span>
                {exam.claim_form_type.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {(exam.status === 'submitted' || exam.status === 'SENT_TO_BILLING') && (
            <button
              onClick={() => setShowApproveConfirm(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 border border-blue-700 text-white hover:bg-blue-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Approve
            </button>
          )}

          {exam.status === 'approved' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 border border-emerald-700 text-white hover:bg-emerald-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">credit_card</span>
              Process Payment
            </button>
          )}

          {(canPay || exam.status === 'approved' || exam.status === 'review') && exam.status !== 'rejected' && exam.status !== 'paid' && (
            <button
              onClick={() => setShowRejectModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Reject
            </button>
          )}

          {isPaid && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="font-semibold text-sm">Paid on {new Date(payment?.payment_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Exam Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">description</span>
              <h2 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Exam Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject</p>
                <p className="text-sm font-bold text-slate-800">{exam.subject_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Exam Type</p>
                <p className="text-sm font-bold text-slate-800 uppercase">{exam.exam_type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</p>
                <p className="text-sm font-bold text-slate-800">
                  {new Date(exam.exam_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Students Count</p>
                <p className="text-sm font-bold text-slate-800">{exam.students_count}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Program</p>
                <p className="text-sm font-bold text-slate-800">{exam.program}</p>
              </div>
              {exam.second_examiner && (
                <div className="sm:col-span-2 pt-4 border-t border-slate-100 mt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Second Examiner</p>
                  <p className="text-sm font-bold text-slate-800">{exam.second_examiner}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payee Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">person</span>
              <h2 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Payee Details ({isExternal ? 'External Examiner' : 'Faculty'})</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Name</p>
                  <p className="text-sm font-bold text-slate-800">{examinerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email</p>
                  <p className="text-sm font-bold text-slate-800">{examinerEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mobile</p>
                  <p className="text-sm font-bold text-slate-800">
                    {isExternal ? (exam.external_examiner_mobile || 'N/A') : (exam.faculty_mobile || 'N/A')}
                  </p>
                </div>
                {isExternal && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Institute</p>
                    <p className="text-sm font-bold text-slate-800">{exam.parent_institute || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mt-4">
                <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2 mb-4 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  Bank Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                    <p className="text-sm font-bold text-slate-800">{bankName || 'NOT PROVIDED'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                    <p className="text-sm font-mono font-bold text-slate-800">{accNumber || 'NOT PROVIDED'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">IFSC Code</p>
                    <p className="text-sm font-mono font-bold text-slate-800">{ifsc || 'NOT PROVIDED'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PAN Number</p>
                    <p className="text-sm font-mono font-bold text-slate-800">{pan || 'NOT PROVIDED'}</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-200 flex gap-4">
                  {panUrl && (
                    <a href={`http://localhost:5000${panUrl}`} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      View PAN
                    </a>
                  )}
                  {chequeUrl && (
                    <a href={`http://localhost:5000${chequeUrl}`} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      View Cheque
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Staff Table */}
          {exam.claim_form_type === 'NON_TEACHING' && staff && staff.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">group</span>
                <h2 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Supporting Staff</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Rate</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Prep/Clean</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Batch</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right text-primary">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staff.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-700">{s.staff_name}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{s.staff_role}</td>
                        <td className="px-6 py-4 text-right text-slate-700">₹{Number(s.rate || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-medium">₹{Number(s.prep_clean_amount || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-blue-600 font-medium">₹{Number(s.batch_amount || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-primary font-black">₹{Number(s.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                      <td colSpan="5" className="px-6 py-4 text-right text-slate-600 uppercase tracking-widest text-[10px]">Grand Total</td>
                      <td className="px-6 py-4 text-right text-primary text-base font-black tracking-tight">
                        ₹{staff.reduce((sum, s) => sum + Number(s.total_amount || 0), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Record Display if Paid */}
          {isPaid && payment && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[100px] text-emerald-500">task_alt</span>
              </div>
              <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                <h2 className="font-bold text-emerald-800 uppercase tracking-wide text-sm">Payment Record</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Payment Date</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(payment.payment_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount Paid</p>
                  <p className="text-lg font-black text-emerald-600">₹{Number(payment.amount).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Method</p>
                  <p className="text-sm font-bold text-slate-800">{payment.payment_method}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reference No</p>
                  <p className="text-sm font-mono font-bold text-slate-800">{payment.reference_number}</p>
                </div>
                {payment.notes && (
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes</p>
                    <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{payment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <BillSummary examId={id} billData={data.calculation} />

          {/* Allowances */}
          {!isPaid && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500 text-xl">price_change</span>
                  <h2 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Manage Allowances</h2>
                </div>
                {!editingAllowances && (
                  <button
                    onClick={() => setEditingAllowances(true)}
                    className="text-xs font-bold text-primary hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Chairman Allowance (₹)
                    {(['PR', 'OR', 'TW'].includes(exam.exam_type) || !exam.is_coordinator) && (
                      <div className="relative group flex items-center">
                        <span className="material-symbols-outlined text-[15px] text-red-400 cursor-help transition-transform group-hover:scale-110">info</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] p-2.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 transition-all pointer-events-none z-50 font-medium normal-case tracking-normal text-center leading-snug">
                          Not applicable for Practical exams or non-coordinators
                          <div className="border-[6px] border-transparent border-t-slate-800 absolute top-full left-1/2 -translate-x-1/2"></div>
                        </div>
                      </div>
                    )}
                  </label>
                  {editingAllowances ? (
                    <input
                      type="number"
                      value={allowances.chairman_allowance}
                      onChange={(e) => setAllowances({ ...allowances, chairman_allowance: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${(['PR', 'OR', 'TW'].includes(exam.exam_type) || !exam.is_coordinator) ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed' : 'border-slate-200 text-slate-800'}`}
                      disabled={['PR', 'OR', 'TW'].includes(exam.exam_type) || !exam.is_coordinator}
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-800">
                      {(['PR', 'OR', 'TW'].includes(exam.exam_type) || !exam.is_coordinator)
                        ? 'N/A'
                        : `₹${Number(allowances.chairman_allowance).toFixed(2)}`
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Conveyance Amount (₹)
                    {!isExternal && (
                      <div className="relative group flex items-center">
                        <span className="material-symbols-outlined text-[15px] text-red-400 cursor-help transition-transform group-hover:scale-110">info</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] p-2.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 transition-all pointer-events-none z-50 font-medium normal-case tracking-normal text-center leading-snug">
                          Only applicable for External claims
                          <div className="border-[6px] border-transparent border-t-slate-800 absolute top-full left-1/2 -translate-x-1/2"></div>
                        </div>
                      </div>
                    )}
                  </label>
                  {editingAllowances ? (
                    <input
                      type="number"
                      value={allowances.conveyance_amount}
                      onChange={(e) => setAllowances({ ...allowances, conveyance_amount: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${!isExternal ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed' : 'border-slate-200 text-slate-800'}`}
                      disabled={!isExternal}
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-800">
                      {!isExternal
                        ? 'N/A'
                        : `₹${Number(allowances.conveyance_amount).toFixed(2)}`
                      }
                    </p>
                  )}
                </div>

                {editingAllowances && (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={handleUpdateAllowances}
                      disabled={processing}
                      className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      {processing ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAllowances(false);
                        if (data.calculation) {
                          setAllowances({
                            chairman_allowance: data.calculation.chairman_allowance || 0,
                            conveyance_amount: data.calculation.conveyance_amount || 0
                          });
                        }
                      }}
                      disabled={processing}
                      className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejections */}
          {actions && actions.filter(a => a.action_type === 'REJECTED').length > 0 && (
            <div className="bg-red-50 rounded-2xl shadow-sm border border-red-200 overflow-hidden">
              <div className="px-6 py-4 bg-red-100/50 border-b border-red-200 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600 text-xl">history</span>
                <h2 className="font-bold text-red-800 uppercase tracking-wide text-sm">Rejection History</h2>
              </div>
              <div className="p-6 space-y-4">
                {actions.filter(a => a.action_type === 'REJECTED').map((action, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-800 text-sm">{action.action_by_name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {new Date(action.action_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">{action.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePayment}
        amount={data.calculation?.net_amount || 0}
        loading={processing}
      />
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onReject={handleReject}
        processing={processing}
      />
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
      />
    </div>
  );
}
