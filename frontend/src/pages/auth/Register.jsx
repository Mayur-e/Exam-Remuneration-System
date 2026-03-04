import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { validateName, validateEmail, validatePassword, validateRequired } from "../../utils/validation";

import GoogleSignupModal from "../../components/auth/GoogleSignupModal";
import { useToast } from "../../hooks/useToast";

// Icons
// Icons (Optional if not used anymore, but let's keep Mail/Lock just in case, though the new design uses Material Symbols)
import { PROGRAM_DEPARTMENTS } from "../../constants/departments";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    prn: "",
    email: "",
    password: "",
    department: "",
    role: "FACULTY",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Google Auth states
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [googleToken, setGoogleToken] = useState("");
  const [googleUserData, setGoogleUserData] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Toast hook
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(form.name, "Full name");
    if (nameError) newErrors.name = nameError;

    const prnError = validateRequired(form.prn, "Employee ID");
    if (prnError) newErrors.prn = prnError;

    const emailError = validateEmail(form.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(form.password, 6);
    if (passwordError) newErrors.password = passwordError;

    const departmentError = validateRequired(form.department, "Department");
    if (departmentError) newErrors.department = departmentError;

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await api.post("/auth/register", form);

      // Trigger unified global toast
      showToast("Registered successfully! Redirecting to login...", "success");
      setSuccessMessage("Registered successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
        setSuccessMessage("");
        setForm({
          name: "",
          prn: "",
          email: "",
          password: "",
          department: "",
          role: "FACULTY",
        });
      }, 2000);
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors({ general: err.response.data.message || "User or PRN already exists" });
      } else if (err.response?.status === 400) {
        setErrors({ general: "Invalid data. Please check your inputs." });
      } else if (err.response?.status === 403) {
        setErrors({ general: "Only @pccoepune.org email is allowed for registration" });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
      // Error toast
      showToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const token = credentialResponse.credential;

      // Check if user exists
      const res = await api.post("/auth/google/check", { token });

      if (res.data.exists) {
        // User exists - login directly
        // Custom toast animation
        setToastMessage("Google login successful!");
        setToastType("success");
        setTimeout(() => setToastMessage(""), 3000);

        const { token: authToken, user } = res.data;

        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(user));

        // Role-based redirect
        setTimeout(() => {
          if (user.role === "ADMIN") navigate("/admin");
          else if (user.role === "BILLING_INCHARGE") navigate("/accountant");
          else navigate("/faculty");
        }, 1500);
      } else {
        // New user - show signup modal
        setGoogleToken(token);
        setGoogleUserData({
          email: res.data.email,
          name: res.data.name
        });
        setShowSignupModal(true);
      }
    } catch (err) {
      console.error("Google auth error:", err);
      if (err.response?.status === 403) {
        setErrors({ general: "Only @pccoepune.org email addresses are allowed" });
      } else {
        setErrors({ general: "Google authentication failed. Please try again." });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ general: "Google Sign-In was cancelled or failed" });
  };

  const handleSignupSubmit = async ({ prn, department }) => {
    setIsGoogleLoading(true);

    try {
      const res = await api.post("/auth/google/register", {
        token: googleToken,
        prn,
        department
      });

      const { token: authToken, user, needsBankDetails } = res.data;

      // Trigger unified global toast
      showToast("Registration successful! Welcome.", "success");

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(user));

      setShowSignupModal(false);

      // Set flag for dashboard to show bank details notification
      if (needsBankDetails) {
        localStorage.setItem("showBankDetailsNotification", "true");
      }

      // Redirect immediately
      setTimeout(() => {
        if (user.role === "ADMIN") navigate("/admin");
        else if (user.role === "BILLING_INCHARGE") navigate("/accountant");
        else navigate("/faculty");
      }, 1500);

    } catch (err) {
      console.error("Google registration error:", err);
      if (err.response?.status === 409) {
        setErrors({ general: err.response.data.message || "User or PRN already exists" });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
      // Error toast
      showToast("Registration failed", "error");
      setShowSignupModal(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-background-light font-display text-slate-900 antialiased min-h-screen flex flex-col">
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">school</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">ExamPay</h2>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col md:flex-row h-[calc(100vh-73px)] overflow-hidden">
        {/* Left Banner Side */}
        <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 opacity-90"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
          <div className="relative z-10 mt-10">
            <div className="w-16 h-1 bg-white/30 mb-8 rounded-full"></div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">Empowering Faculty with Effortless Remuneration</h1>
            <p className="text-lg text-blue-100 max-w-md leading-relaxed">
              Streamline your examination duty claims, track payments, and manage your academic profile in one dedicated portal designed specifically for PCCOE staff.
            </p>
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mt-auto">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-blue-200">verified_user</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure &amp; Transparent</h3>
                <p className="text-sm text-blue-100">Your financial data is encrypted and every claim is transparently tracked.</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
          <div className="absolute top-1/4 -left-12 w-48 h-48 bg-indigo-400 rounded-full blur-3xl opacity-30 mix-blend-screen"></div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-7/12 lg:w-1/2 overflow-y-auto bg-white flex flex-col">
          <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
            <div className="w-full max-w-lg">

              <div className="mb-6 flex flex-col items-center justify-center text-center">
                <img alt="PCCOE Logo" className="h-20 w-auto object-contain mb-4" src="/pccoe-logo.png" />
                <div className="text-base font-bold text-slate-800 leading-tight">
                  Pimpri Chinchwad College of Engineering
                </div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-medium">
                  An Autonomous Institute
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Faculty Registration</h2>
                <p className="text-slate-600">Join the exam remuneration system to manage your claims.</p>
              </div>

              <div className="space-y-6">

                {/* Success message with animation */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: "1rem" }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200"
                    >
                      {successMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* General error with animation */}
                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: "1rem" }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200"
                    >
                      {errors.general}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Sign-In */}
                <div className="flex justify-center w-full">
                  <div className="w-full h-12 flex justify-center items-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      text="signup_with"
                      shape="rectangular"
                      size="large"
                      width="100%"
                      locale="en"
                    />
                  </div>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <form action="#" className="flex flex-col gap-5" onSubmit={submit}>

                  {/* Full Name field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="name">Full Name</label>
                    <div className="relative">
                      <input
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-slate-50 text-slate-900 outline-none transition-colors`}
                        id="name"
                        name="name"
                        placeholder="Dr. Jane Doe"
                        required
                        type="text"
                        value={form.name}
                        onChange={handleInputChange}
                        disabled={isGoogleLoading}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                      </div>
                    </div>
                    {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
                  </div>

                  {/* Employee ID field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="prn">Employee ID (PRN)</label>
                    <div className="relative">
                      <input
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.prn ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-slate-50 text-slate-900 outline-none transition-colors`}
                        id="prn"
                        name="prn"
                        placeholder="FAC-12345"
                        required
                        type="text"
                        value={form.prn}
                        onChange={handleInputChange}
                        disabled={isGoogleLoading}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">badge</span>
                      </div>
                    </div>
                    {errors.prn && <span className="text-xs text-red-500 mt-1 block">{errors.prn}</span>}
                  </div>

                  {/* Password & Department row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Role is hardcoded to FACULTY in form state, but we could add a disabled input here if needed.
                        For now, substituting the HTML template's EmployeeID with Password since it's required for auth. */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">Password</label>
                      <div className="relative">
                        <input
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-slate-50 text-slate-900 outline-none transition-colors`}
                          id="password"
                          name="password"
                          placeholder="••••••••"
                          required
                          type="password"
                          value={form.password}
                          onChange={handleInputChange}
                          disabled={isGoogleLoading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                        </div>
                      </div>
                      {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="department">Department</label>
                      <div className="relative">
                        <select
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.department ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-slate-50 text-slate-900 outline-none transition-colors appearance-none`}
                          id="department"
                          name="department"
                          required
                          value={form.department}
                          onChange={handleInputChange}
                          disabled={isGoogleLoading}
                        >
                          <option disabled value="">Select Dept</option>
                          {Object.entries(PROGRAM_DEPARTMENTS).map(([program, depts]) => (
                            <optgroup key={program} label={program} className="font-semibold text-slate-500">
                              {depts.map((dept) => (
                                <option key={`${program}-${dept}`} value={dept} className="font-normal text-slate-900">
                                  {dept}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">domain</span>
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
                        </div>
                      </div>
                      {errors.department && <span className="text-xs text-red-500 mt-1 block">{errors.department}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">Official Email Address</label>
                    <div className="relative">
                      <input
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-primary focus:ring-primary'} bg-slate-50 text-slate-900 outline-none transition-colors`}
                        id="email"
                        name="email"
                        placeholder="jane.doe@pccoepune.org"
                        required
                        type="email"
                        value={form.email}
                        onChange={handleInputChange}
                        disabled={isGoogleLoading}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                      </div>
                    </div>
                    {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
                    <p className="mt-1 text-[11px] text-slate-500">Please use your official @pccoepune.org email address.</p>
                  </div>

                  <div className="mt-2">
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={isLoading || isGoogleLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        <>
                          <span>Create Faculty Account</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>

              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="text-slate-600 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="font-semibold text-primary hover:text-blue-700 hover:underline transition-colors duration-300"
                  >
                    Sign In
                  </button>
                </p>
              </div>

            </div>
          </div>

          <div className="p-6 text-center md:text-left border-t border-slate-100">
            <p className="text-xs text-slate-400">© 2026 Pimpri Chinchwad College of Engineering. All rights reserved.</p>
          </div>
        </div>
      </main>

      {/* Google Signup Modal */}
      {showSignupModal && googleUserData && (
        <GoogleSignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          email={googleUserData.email}
          name={googleUserData.name}
          onSubmit={handleSignupSubmit}
          isLoading={isGoogleLoading}
        />
      )}
    </div>
  );
}