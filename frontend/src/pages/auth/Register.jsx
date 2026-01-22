import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import api from "../../services/api";
import { validateName, validateEmail, validatePassword, validateRequired } from "../../utils/validation";

// UI components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import GoogleSignupModal from "../../components/auth/GoogleSignupModal";
import { useToast } from "../../hooks/useToast";

// Icons
import { MailIcon, LockIcon, UserIcon, BuildingOfficeIcon } from "../../components/icons/logo";

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

      showToast("Registered successfully! Redirecting to login...", "success");
      setSuccessMessage("Registered successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/")
        setSuccessMessage("");
        setForm({
          name: "",
          email: "",
          password: "",
          department: "",
          role: "FACULTY",
        });
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
        showToast("Google login successful!", "success");
        const { token: authToken, user } = res.data;

        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(user));

        // Role-based redirect
        if (user.role === "ADMIN") navigate("/admin");
        else if (user.role === "ACCOUNTANT") navigate("/accountant");
        else navigate("/faculty");
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

      showToast("Registration successful! Welcome.", "success");

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(user));

      setShowSignupModal(false);

      // Set flag for dashboard to show bank details notification
      if (needsBankDetails) {
        localStorage.setItem("showBankDetailsNotification", "true");
      }

      // Redirect immediately
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "ACCOUNTANT") navigate("/accountant");
      else navigate("/faculty");

    } catch (err) {
      console.error("Google registration error:", err);
      if (err.response?.status === 409) {
        setErrors({ general: err.response.data.message || "User or PRN already exists" });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
        setErrors({ general: "Registration failed. Please try again." });
      }
      showToast("Registration failed", "error");
      setShowSignupModal(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 pointer-events-none" />

          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-sm text-gray-500">
                Join the billing management system
              </p>
            </div>

            {/* Success message */}
            {successMessage && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 animate-in">
                {successMessage}
              </div>
            )}

            {/* General error */}
            {errors.general && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200 animate-in">
                {errors.general}
              </div>
            )}

            {/* Google Sign-In Button */}
            <div className="space-y-3">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  shape="rectangular"
                  size="large"
                  width="100%"
                />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or register with email</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-5">
              {/* Full Name field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                    required
                    disabled={isGoogleLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                    required
                    disabled={isGoogleLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Role selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-300 text-gray-700"
                  disabled={isGoogleLoading}
                >
                  <option value="FACULTY">Faculty</option>

                </select>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={form.password}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                    required
                    disabled={isGoogleLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Department field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    name="department"
                    placeholder="Enter your department"
                    value={form.department}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.department ? "border-red-500 focus:ring-red-500" : ""}`}
                    required
                    disabled={isGoogleLoading}
                  />
                </div>
                {errors.department && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Submit button */}
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
            </form>

            {/* Switch to Sign In */}
            <div className="pt-4 text-center border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-300 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </Card>
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
