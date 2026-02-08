import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { validateEmail, validatePassword } from "../../utils/validation";

// Enhanced UI components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import GoogleSignupModal from "../../components/auth/GoogleSignupModal";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { useToast } from "../../hooks/useToast";

// Icons
import { LogoIcon, MailIcon, LockIcon } from "../../components/icons/logo";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Google Auth states
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [googleToken, setGoogleToken] = useState("");
  const [googleUserData, setGoogleUserData] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Toast hook
  const { showToast } = useToast();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    // Frontend validation
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);

    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Custom toast animation
      setToastMessage("Login successful! Redirecting...");
      setToastType("success");
      setTimeout(() => setToastMessage(""), 3000);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Role-based redirect
      setTimeout(() => {
        if (user.role === "ADMIN") navigate("/admin");
        else if (user.role === "BILLING_INCHARGE") navigate("/accountant");
        else navigate("/faculty");
      }, 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        setGeneralError("Invalid email or password");
      } else if (err.response?.status === 403) {
        setGeneralError("Only @pccoepune.org email is allowed");
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    setGeneralError("");

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
        setGeneralError("Only @pccoepune.org email addresses are allowed");
      } else {
        setGeneralError("Google authentication failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGeneralError("Google Sign-In was cancelled or failed");
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
        setGeneralError(err.response.data.message || "User or PRN already exists");
      } else {
        setGeneralError("Registration failed. Please try again.");
      }
      
      // Custom toast animation for error
      setToastMessage("Registration failed");
      setToastType("error");
      setTimeout(() => setToastMessage(""), 3000);
      
      setShowSignupModal(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-accent p-4">
      
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
          key={generalError ? "error" : "normal"}
          initial={{ x: 0 }}
          animate={generalError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:via-transparent dark:to-purple-500/10 pointer-events-none" />

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
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <LogoIcon className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Staff Billing
                </h1>
                <p className="text-sm text-muted-foreground">
                  Professional Billing Management System
                </p>
              </motion.div>

              {/* Error message with animation */}
              <AnimatePresence>
                {generalError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800"
                  >
                    {generalError}
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
                    useOneTap
                    text="signin_with"
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
                    <span className="px-2 bg-card text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
              </motion.div>

              {/* Form with staggered animations */}
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleLogin} 
                className="space-y-5"
              >
                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-card-foreground">
                    Email Address
                  </label>
                  <div className="relative group">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-300" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      className={`pl-10 ${emailError ? "border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                  </div>
                  <AnimatePresence>
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 font-medium"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-card-foreground">
                    Password
                  </label>
                  <div className="relative group">
                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-300" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      className={`pl-10 ${passwordError ? "border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500"}`}
                      required
                    />
                  </div>
                  <AnimatePresence>
                    {passwordError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-600 font-medium"
                      >
                        {passwordError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Switch to Sign Up */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="pt-4 text-center border-t border-border"
              >
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-300 hover:underline"
                  >
                    Sign Up
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