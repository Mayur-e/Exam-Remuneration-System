import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { validateName, validateEmail, validatePassword, validateRequired } from "../../utils/validation";

// UI components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import GoogleSignupModal from "../../components/auth/GoogleSignupModal";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { useToast } from "../../hooks/useToast";

// Icons
import { MailIcon, LockIcon, UserIcon, BuildingOfficeIcon } from "../../components/icons/logo";
import { DEPARTMENTS } from "../../constants/departments";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(form.name, "Full name");
    if (nameError) newErrors.name = nameError;

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

      // Custom toast animation
      setToastMessage("Registered successfully! Redirecting to login...");
      setToastType("success");
      setSuccessMessage("Registered successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
        setSuccessMessage("");
        setForm({
          name: "",
          email: "",
          password: "",
          department: "",
          role: "FACULTY",
        });
        setToastMessage("");
      }, 2000);
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors({ general: "Email already exists. Please use a different email." });
      } else if (err.response?.status === 400) {
        setErrors({ general: "Invalid data. Please check your inputs." });
      } else if (err.response?.status === 403) {
        setErrors({ general: "Only @pccoepune.org email is allowed for registration" });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
      // Error toast
      setToastMessage(err.response?.data?.message || "Registration failed");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
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

      // Custom toast animation
      setToastMessage("Registration successful! Welcome.");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);

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
      setToastMessage("Registration failed");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
      setShowSignupModal(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-accent p-4">
      
      {/* Custom Toast Animation */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-16 px-4 py-2 rounded shadow-lg z-50 ${
              toastType === "success" 
                ? "bg-green-600 text-white" 
                : "bg-red-600 text-white"
            }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Toggle with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-4 right-4 z-40"
      >
        <ThemeToggle />
      </motion.div>

      <div className="w-full max-w-md">
        {/* Error Shake Animation */}
        <motion.div
          key={errors.general ? "error" : "normal"}
          initial={{ x: 0 }}
          animate={errors.general ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 dark:from-green-500/10 dark:via-transparent dark:to-blue-500/10 pointer-events-none" />

            <div className="relative p-8 space-y-6">
              {/* Header with fade-in animation */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-3"
              >
                <div className="flex justify-center mb-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <UserIcon className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Create Account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Join the billing management system
                </p>
              </motion.div>

              {/* Success message with animation */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800"
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* General error with animation */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800"
                  >
                    {errors.general}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Sign-In Button with animation */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex justify-center">
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

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">Or register with email</span>
                  </div>
                </div>
              </motion.div>

              {/* Form with staggered animations */}
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={submit} 
                className="space-y-5"
              >
                {/* Full Name field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-card-foreground">
                    Full Name
                  </label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.name ? "border-red-500 focus:ring-red-500" : "focus:border-green-500 focus:ring-green-500"}`}
                      required
                      disabled={isGoogleLoading}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 font-medium"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-card-foreground">
                    Email Address
                  </label>
                  <div className="relative group">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.email ? "border-red-500 focus:ring-red-500" : "focus:border-green-500 focus:ring-green-500"}`}
                      required
                      disabled={isGoogleLoading}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 font-medium"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Role selector */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-card-foreground">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-300 text-foreground"
                    disabled={isGoogleLoading}
                  >
                    <option value="FACULTY">Faculty</option>
                  </select>
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.55 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-card-foreground">
                    Password
                  </label>
                  <div className="relative group">
                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" />
                    <Input
                      type="password"
                      name="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={form.password}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.password ? "border-red-500 focus:ring-red-500" : "focus:border-green-500 focus:ring-green-500"}`}
                      required
                      disabled={isGoogleLoading}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 font-medium"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Department field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-card-foreground">
                    Department
                  </label>
                  <div className="relative group">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 group-focus-within:text-green-500 transition-colors duration-300" />
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-300 text-foreground appearance-none ${errors.department ? "border-red-500" : ""}`}
                      required
                      disabled={isGoogleLoading}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept, index) => (
                        <motion.option 
                          key={dept} 
                          value={dept}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          {dept}
                        </motion.option>
                      ))}
                    </select>
                  </div>
                  <AnimatePresence>
                    {errors.department && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 font-medium"
                      >
                        {errors.department}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.65 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Switch to Sign In */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="pt-4 text-center border-t border-border"
              >
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition-colors duration-300 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

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