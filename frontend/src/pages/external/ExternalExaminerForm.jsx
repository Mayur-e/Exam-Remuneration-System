import { useState } from "react";
import api from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";

// Icons
import { UserIcon, MailIcon, BuildingOfficeIcon } from "../../components/icons/logo";

export default function ExternalExaminerForm({ token }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    parent_institute: "",
    pan_number: "",
    bank_name: "",
    branch_name: "",
    account_number: "",
    ifsc_code: "",
    is_local: true, // Default: Within 25km
    journey_days: "1",
    user_entered_travel_amount: ""
  });

  const [panFile, setPanFile] = useState(null);
  const [chequeFile, setChequeFile] = useState(null);
  const [travelProofFile, setTravelProofFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!form.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";

    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile)) newErrors.mobile = "Invalid mobile number";

    if (!form.parent_institute.trim()) newErrors.parent_institute = "Institute name is required";
    if (!form.pan_number.trim()) newErrors.pan_number = "PAN number is required";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan_number)) newErrors.pan_number = "Invalid PAN format";

    if (!form.bank_name.trim()) newErrors.bank_name = "Bank name is required";
    if (!form.branch_name.trim()) newErrors.branch_name = "Branch name is required";
    if (!form.account_number.trim()) newErrors.account_number = "Account number is required";
    if (!form.ifsc_code.trim()) newErrors.ifsc_code = "IFSC code is required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code)) newErrors.ifsc_code = "Invalid IFSC format";

    if (!panFile) newErrors.panFile = "PAN card document is required";
    if (!chequeFile) newErrors.chequeFile = "Cancelled cheque document is required";

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Add text fields
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Add files
      data.append("pan_document", panFile);
      data.append("cancelled_cheque", chequeFile);

      // Add travel proof if outstation (beyond 25km)
      if (!form.is_local && travelProofFile) {
        data.append("travel_proof_document", travelProofFile);
      }

      await api.post(`/external/claim/${token}`, data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Claim submitted successfully!");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed. Please try again.");
      console.error(err);
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

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 border-gray-200">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">External Examiner Claim Form</h2>
          <p className="text-gray-600">Please fill in your details and upload the required documents</p>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`pl-10 ${errors.full_name ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.full_name && <p className="text-xs text-red-600">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mobile Number *</label>
                <Input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  className={errors.mobile ? "border-red-500" : ""}
                  maxLength="10"
                />
                {errors.mobile && <p className="text-xs text-red-600">{errors.mobile}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Institute Name *</label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    name="parent_institute"
                    value={form.parent_institute}
                    onChange={handleChange}
                    placeholder="Enter your institute name"
                    className={`pl-10 ${errors.parent_institute ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.parent_institute && <p className="text-xs text-red-600">{errors.parent_institute}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PAN Number *</label>
                <Input
                  name="pan_number"
                  value={form.pan_number}
                  onChange={handleChange}
                  placeholder="Enter PAN number (e.g., ABCDE1234F)"
                  className={errors.pan_number ? "border-red-500" : ""}
                  maxLength="10"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.pan_number && <p className="text-xs text-red-600">{errors.pan_number}</p>}
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Bank Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bank Name *</label>
                <Input
                  name="bank_name"
                  value={form.bank_name}
                  onChange={handleChange}
                  placeholder="Enter bank name"
                  className={errors.bank_name ? "border-red-500" : ""}
                />
                {errors.bank_name && <p className="text-xs text-red-600">{errors.bank_name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Branch Name *</label>
                <Input
                  name="branch_name"
                  value={form.branch_name}
                  onChange={handleChange}
                  placeholder="Enter branch name"
                  className={errors.branch_name ? "border-red-500" : ""}
                />
                {errors.branch_name && <p className="text-xs text-red-600">{errors.branch_name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Number *</label>
                <Input
                  name="account_number"
                  value={form.account_number}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  className={errors.account_number ? "border-red-500" : ""}
                />
                {errors.account_number && <p className="text-xs text-red-600">{errors.account_number}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">IFSC Code *</label>
                <Input
                  name="ifsc_code"
                  value={form.ifsc_code}
                  onChange={handleChange}
                  placeholder="Enter IFSC code"
                  className={errors.ifsc_code ? "border-red-500" : ""}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.ifsc_code && <p className="text-xs text-red-600">{errors.ifsc_code}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Travel Allowance */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Travel Allowance</h3>

          {/* Distance Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Institute Distance from PCCOE *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_local"
                  checked={form.is_local === true}
                  onChange={() => setForm({ ...form, is_local: true, user_entered_travel_amount: "" })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Within 25km (Local)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_local"
                  checked={form.is_local === false}
                  onChange={() => setForm({ ...form, is_local: false, journey_days: "1" })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Beyond 25km (Outstation)</span>
              </label>
            </div>
          </div>

          {/* Conditional Fields Based on Distance */}
          {form.is_local ? (
            // Local: Within 25km
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Local Conveyance Allowance (LCA)</p>
                  <p className="text-xs text-blue-600 mt-1">Rate: ₹500 per day/visit</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Number of Days/Visits *</label>
                <Input
                  type="number"
                  name="journey_days"
                  value={form.journey_days}
                  onChange={handleChange}
                  placeholder="Enter number of days"
                  min="1"
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-600">
                  Total LCA: ₹{500 * (parseInt(form.journey_days) || 0)}
                </p>
              </div>
            </div>
          ) : (
            // Outstation: Beyond 25km
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">Outstation Travel Allowance</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Includes: TA (Train/Bus fare) + DA + Auto charges (Max ₹200)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Total Travel Expense (₹) *</label>
                <Input
                  type="number"
                  name="user_entered_travel_amount"
                  value={form.user_entered_travel_amount}
                  onChange={handleChange}
                  placeholder="Enter total amount (TA + DA + Auto)"
                  min="0"
                  className="max-w-xs"
                />
              </div>

              {/* Travel Proof Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Upload Travel Proof (Tickets/Bills) *</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${errors.travelProofFile ? "border-red-500 bg-red-50" : "border-amber-300 hover:border-amber-400 bg-white"}`}>
                  <input
                    type="file"
                    id="travelProofFile"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange(setTravelProofFile, "travelProofFile")}
                    className="hidden"
                  />
                  <label htmlFor="travelProofFile" className="cursor-pointer block">
                    <div className="space-y-2">
                      <svg className="w-8 h-8 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {travelProofFile ? travelProofFile.name : "Click to upload travel proof"}
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG (Max 5MB)</p>
                    </div>
                  </label>
                </div>
                {errors.travelProofFile && <p className="text-xs text-red-600">{errors.travelProofFile}</p>}
              </div>

              <div className="bg-amber-100 border border-amber-300 rounded p-2">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">⚠️ Important:</span> Upload tickets, bills, and receipts for validation.
                  Accountant will verify against institutional norms.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Document Upload */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Document Upload</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">PAN Card Document *</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.panFile ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}>
                <input
                  type="file"
                  id="panFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange(setPanFile, "panFile")}
                  className="hidden"
                />
                <label htmlFor="panFile" className="cursor-pointer block">
                  <div className="space-y-2">
                    <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {panFile ? panFile.name : "Click to upload PAN card"}
                    </p>
                    <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG (Max 5MB)</p>
                  </div>
                </label>
              </div>
              {errors.panFile && <p className="text-xs text-red-600">{errors.panFile}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Cancelled Cheque *</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.chequeFile ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}>
                <input
                  type="file"
                  id="chequeFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange(setChequeFile, "chequeFile")}
                  className="hidden"
                />
                <label htmlFor="chequeFile" className="cursor-pointer block">
                  <div className="space-y-2">
                    <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {chequeFile ? chequeFile.name : "Click to upload cancelled cheque"}
                    </p>
                    <p className="text-xs text-gray-500">PDF, JPG, JPEG, PNG (Max 5MB)</p>
                  </div>
                </label>
              </div>
              {errors.chequeFile && <p className="text-xs text-red-600">{errors.chequeFile}</p>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              loading={loading}
            >
              Submit Claim
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Note:</span> Please ensure all information is accurate.
              Claims with incorrect bank details or missing documents will be rejected.
            </p>
          </div>
        </div>
      </Card >
    </div >
  );
}