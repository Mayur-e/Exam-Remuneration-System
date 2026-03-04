import { useState, useEffect } from "react";
import api from "../../services/api";

export default function ExternalExaminerForm({ token, onSubmitted, onNameChange }) {
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(true);
  const [rejections, setRejections] = useState([]);
  const [isResubmission, setIsResubmission] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    parent_institute: "",
    pan_number: "",
    bank_name: "",
    branch_name: "",
    account_number: "",
    ifsc_code: ""
  });

  const [panFile, setPanFile] = useState(null);
  const [chequeFile, setChequeFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClaimInfo();
  }, [token]);

  const fetchClaimInfo = async () => {
    try {
      const res = await api.get(`/external/claim/${token}/info`);
      const { exam, rejections: rejectionHistory, isResubmission: isResub } = res.data;

      setRejections(rejectionHistory || []);
      setIsResubmission(isResub);

      if (isResub && exam) {
        setForm({
          full_name: exam.full_name || "",
          email: exam.email || "",
          mobile: exam.mobile || "",
          parent_institute: exam.parent_institute || "",
          pan_number: exam.pan_number || "",
          bank_name: exam.bank_name || "",
          branch_name: exam.branch_name || "",
          account_number: exam.account_number || "",
          ifsc_code: exam.ifsc_code || ""
        });
        if (onNameChange && exam.full_name) {
          onNameChange(exam.full_name);
        }
      }
    } catch (err) {
      console.error("Failed to fetch claim info:", err);
    } finally {
      setFetchingInfo(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "full_name" && onNameChange) {
        onNameChange(value);
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = "Required";
    if (!form.email.trim()) newErrors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";

    if (!form.mobile.trim()) newErrors.mobile = "Required";
    else if (!/^[0-9]{10}$/.test(form.mobile)) newErrors.mobile = "Invalid mobile";

    if (!form.parent_institute.trim()) newErrors.parent_institute = "Required";

    if (!form.pan_number.trim()) newErrors.pan_number = "Required";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan_number)) newErrors.pan_number = "Invalid PAN";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.bank_name.trim()) newErrors.bank_name = "Required";
    if (!form.branch_name.trim()) newErrors.branch_name = "Required";
    if (!form.account_number.trim()) newErrors.account_number = "Required";
    if (!form.ifsc_code.trim()) newErrors.ifsc_code = "Required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code)) newErrors.ifsc_code = "Check IFSC format (5th character must be zero)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!isResubmission) {
      if (!panFile) newErrors.panFile = "Required";
      if (!chequeFile) newErrors.chequeFile = "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (panFile) data.append("pan_document", panFile);
      if (chequeFile) data.append("cancelled_cheque", chequeFile);

      await api.post(`/external/claim/${token}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (onSubmitted) onSubmitted();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (setter, fileType) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setter(file);
      if (errors[fileType]) {
        setErrors(prev => ({ ...prev, [fileType]: "" }));
      }
    }
  };

  if (fetchingInfo) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-[#1e3a8a] rounded-full animate-spin"></div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: "Personal Info", id: "Personal Info" },
    { num: 2, label: "Bank Details", id: "Bank Details" },
    { num: 3, label: "Documents & Review", id: "Documents" }
  ];

  return (
    <div className="w-full">
      {/* Stepper Header */}
      <div className="flex items-center justify-center py-6 mb-6">
        {stepsList.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          return (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center gap-3 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] transition-colors ${isActive ? 'bg-[#1e3a8a] text-white shadow-md' :
                    isCompleted ? 'bg-[#10b981] text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                  {isCompleted ? <span className="material-symbols-outlined text-[18px]">check</span> : step.num}
                </div>
                <span className={`text-[10px] font-bold tracking-widest absolute -bottom-6 whitespace-nowrap uppercase ${isActive ? 'text-[#1e3a8a]' : (isCompleted ? 'text-[#10b981]' : 'text-slate-400')
                  }`}>
                  {step.label}
                </span>
              </div>
              {idx < stepsList.length - 1 && (
                <div className={`w-16 sm:w-40 h-0.5 mx-4 transition-colors ${isCompleted ? 'bg-[#10b981]' : 'bg-slate-200'}`}></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

        {rejections && rejections.length > 0 && currentStep === 1 && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">error</span>
              Claim Sent Back for Correction
            </h3>
            {rejections.map((rejection, idx) => (
              <div key={idx} className="mb-3 text-sm">
                <p className="text-red-700 font-medium">Returned by: {rejection.rejected_by} on {new Date(rejection.action_at).toLocaleDateString()}</p>
                <div className="mt-1 p-3 bg-red-100/50 rounded-lg text-red-800 border border-red-200">
                  {rejection.comment}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="p-0">
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-[#eff6ff] text-[#1e3a8a] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">person</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">External Examiner Claim</h2>
                  <p className="text-slate-500">Step 1: Provide your personal and institutional details.</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-5">
                <h3 className="text-[#1e40af] font-bold flex items-center gap-2 mb-3 text-sm">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Step 1 Instructions
                </h3>
                <ul className="space-y-1.5 text-sm text-[#1e40af]/80 ml-7 list-disc">
                  <li>All fields marked with <span className="text-red-500">*</span> are mandatory for identity verification.</li>
                  <li>PAN number must be in format: <code className="bg-[#dbeafe] px-1.5 py-0.5 rounded text-[#1e3a8a] font-bold text-xs tracking-wider">ABCDE1234F</code>.</li>
                  <li>Please use your official institutional email address if available.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">person</span>
                    <input
                      type="text" name="full_name" value={form.full_name} onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${errors.full_name ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800`}
                      placeholder="e.g. John Doe"
                    />
                    {form.full_name && !errors.full_name && <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-[18px]">check_circle</span>}
                  </div>
                  {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">mail</span>
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${errors.email ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800`}
                      placeholder="john.doe@university.edu.in"
                    />
                    {form.email && !errors.email && <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-[18px]">check_circle</span>}
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">smartphone</span>
                    <input
                      type="tel" name="mobile" value={form.mobile} onChange={handleChange} maxLength={10}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${errors.mobile ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800`}
                      placeholder="9876543210"
                    />
                    {form.mobile && !errors.mobile && <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-[18px]">check_circle</span>}
                  </div>
                  {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Institute Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">account_balance</span>
                    <input
                      type="text" name="parent_institute" value={form.parent_institute} onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${errors.parent_institute ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800`}
                      placeholder="Start typing college name..."
                    />
                    {form.parent_institute && !errors.parent_institute && <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-[18px]">check_circle</span>}
                  </div>
                  {errors.parent_institute && <p className="text-xs text-red-500 mt-1">{errors.parent_institute}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">PAN Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">badge</span>
                    <input
                      type="text" name="pan_number" value={form.pan_number} onChange={handleChange} maxLength={10}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${errors.pan_number ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800 uppercase`}
                      placeholder="ABCDE1234F"
                    />
                    {form.pan_number && !errors.pan_number && <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 text-[18px]">check_circle</span>}
                  </div>
                  {errors.pan_number ? (
                    <p className="text-xs text-red-500 mt-1">{errors.pan_number}</p>
                  ) : (
                    <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]">done_all</span> Valid PAN format required
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium ml-2">Step 1 of 3: Identity & Institution</span>
              <button
                onClick={handleNext}
                className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-md"
              >
                Next: Bank Details <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="p-0">
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-[#eff6ff] text-[#1e3a8a] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">account_balance</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Bank Information</h2>
                  <p className="text-slate-500">Provide the bank account details where you wish to receive the payment.</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Bank Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">account_balance</span>
                    <input
                      type="text" name="bank_name" value={form.bank_name} onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.bank_name ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800`}
                      placeholder="State Bank of India"
                    />
                  </div>
                  {errors.bank_name && <p className="text-xs text-red-500 mt-1">{errors.bank_name}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Branch Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">location_on</span>
                    <input
                      type="text" name="branch_name" value={form.branch_name} onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.branch_name ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800`}
                      placeholder="Akurdi, Pune"
                    />
                  </div>
                  {errors.branch_name && <p className="text-xs text-red-500 mt-1">{errors.branch_name}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Account Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">payments</span>
                    <input
                      type="text" name="account_number" value={form.account_number} onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${errors.account_number ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800 tracking-widest`}
                      placeholder="••••••••••"
                    />
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">visibility</span>
                  </div>
                  {errors.account_number && <p className="text-xs text-red-500 mt-1">{errors.account_number}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">IFSC Code <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">qr_code</span>
                    <input
                      type="text" name="ifsc_code" value={form.ifsc_code} onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${errors.ifsc_code ? 'border-red-400' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm text-slate-800 uppercase`}
                      placeholder="SBIN0001045"
                    />
                    {errors.ifsc_code && <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 text-[18px]">error</span>}
                  </div>
                  {errors.ifsc_code && <p className="text-xs text-red-500 mt-1">{errors.ifsc_code}</p>}
                </div>
              </div>

              <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-5 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#d97706] mt-0.5">warning</span>
                <p className="text-[#92400e] text-sm leading-relaxed">
                  <strong>Note:</strong> Please ensure the Bank Account Number and IFSC code are accurate as per your bank passbook. Payments made to incorrect accounts cannot be recovered.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
              </button>
              <button
                onClick={handleNext}
                className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-md"
              >
                Next: Upload Documents <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="p-0">
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-[#eff6ff] text-[#1e3a8a] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">fact_check</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Final Review & Submission</h2>
                  <p className="text-slate-500">Please review your information and uploaded documents before final submission.</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-10">
              {/* Documents Block */}
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-lg">
                  <span className="material-symbols-outlined text-slate-400">cloud_upload</span> 1. Uploaded Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PAN Card */}
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">PAN Card Document</label>
                    <div className={`relative bg-slate-50 border ${errors.panFile ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded-xl p-4 flex items-center gap-4`}>
                      <div className="w-12 h-12 bg-[#eff6ff] text-[#1e3a8a] rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">badge</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{panFile ? panFile.name : (isResubmission ? "Existing file retained" : "No file selected")}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {panFile || isResubmission ? (
                            <>
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">Ready</span>
                              <span className="text-[10px] font-bold text-[#1e3a8a] tracking-wide uppercase cursor-pointer hover:underline">Select File</span>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-red-500 tracking-wide uppercase">Required</span>
                          )}
                        </div>
                      </div>
                      <input
                        type="file" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange(setPanFile, "panFile")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Upload PAN Card"
                      />
                      <span className="material-symbols-outlined text-slate-400 pointer-events-none">edit</span>
                    </div>
                    {errors.panFile && <p className="text-xs text-red-500 mt-1">{errors.panFile}</p>}
                  </div>

                  {/* Cheque */}
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Cancelled Cheque</label>
                    <div className={`relative bg-slate-50 border ${errors.chequeFile ? 'border-red-400 bg-red-50' : 'border-slate-200'} rounded-xl p-4 flex items-center gap-4`}>
                      <div className="w-12 h-12 bg-[#eff6ff] text-[#1e3a8a] rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">receipt_long</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{chequeFile ? chequeFile.name : (isResubmission ? "Existing file retained" : "No file selected")}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {chequeFile || isResubmission ? (
                            <>
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">Ready</span>
                              <span className="text-[10px] font-bold text-[#1e3a8a] tracking-wide uppercase cursor-pointer hover:underline">Select File</span>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-red-500 tracking-wide uppercase">Required</span>
                          )}
                        </div>
                      </div>
                      <input
                        type="file" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange(setChequeFile, "chequeFile")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Upload Cancelled Cheque"
                      />
                      <span className="material-symbols-outlined text-slate-400 pointer-events-none">edit</span>
                    </div>
                    {errors.chequeFile && <p className="text-xs text-red-500 mt-1">{errors.chequeFile}</p>}
                  </div>
                </div>
              </div>

              {/* Final Review Data View */}
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <span className="material-symbols-outlined text-slate-400">summarize</span> 2. Final Review
                  </h3>
                  <button onClick={() => setCurrentStep(1)} className="text-[#1e3a8a] text-sm font-bold flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">Personal Information</p>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Full Name</p>
                      <p className="text-sm font-bold text-slate-800">{form.full_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email & Contact</p>
                      <p className="text-[13px] font-bold text-slate-800">{form.email || '-'}</p>
                      <p className="text-[13px] text-slate-600 font-medium">+91 {form.mobile || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Affiliated Institute</p>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{form.parent_institute || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">PAN Number</p>
                      <p className="text-sm font-bold text-slate-800">{form.pan_number || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">Bank Information</p>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Bank & Branch</p>
                      <p className="text-sm font-bold text-slate-800">{form.bank_name || '-'}</p>
                      <p className="text-[13px] text-slate-600 font-medium">{form.branch_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Number</p>
                      <p className="text-[13px] font-mono font-bold tracking-widest text-slate-800">
                        {form.account_number ? '••••••' + form.account_number.slice(-4) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">IFSC Code</p>
                      <p className="text-[13px] font-mono font-bold tracking-wider text-slate-800 uppercase">{form.ifsc_code || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-5 flex items-start gap-3 mt-8">
                <span className="material-symbols-outlined text-[#d97706] mt-0.5">warning</span>
                <p className="text-[#92400e] text-sm leading-relaxed">
                  <strong>Note:</strong> Please ensure all information is accurate. Claims with incorrect bank details or missing documents will be rejected by the accounts department and may cause significant payment delays. By clicking submit, you certify that the above information is correct.
                </p>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Back to bank details
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                >
                  {loading ? 'Submitting...' : 'Submit Final Claim Request'} <span className="material-symbols-outlined text-[18px]">{loading ? 'sync' : 'verified'}</span>
                </button>
              </div>
              <p className="text-center text-[10px] font-medium text-slate-400 tracking-wider">Submission ID: CL - {new Date().getFullYear()} - 8842 - X • IP logged for security</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}