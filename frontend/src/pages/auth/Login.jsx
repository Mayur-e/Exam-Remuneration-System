import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { validateEmail, validatePassword } from "../../utils/validation";

// Enhanced UI components
import GoogleSignupModal from "../../components/auth/GoogleSignupModal";
import { useToast } from "../../hooks/useToast";

// Icons
import { MailIcon, LockIcon } from "../../components/icons/logo";

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

      // Trigger unified global toast
      showToast("Login successful! Redirecting...", "success");

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
        setGeneralError(err.response.data.message || "Only @pccoepune.org email is allowed");
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
        setGeneralError(err.response.data.message || "Only @pccoepune.org email addresses are allowed");
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
        setGeneralError(err.response.data.message || "User or PRN already exists");
      } else {
        setGeneralError("Registration failed. Please try again.");
      }

      // Error toast
      showToast("Registration failed", "error");

      setShowSignupModal(false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Google Login Custom Button using useGoogleLogin hook is preferred, but here we can adapt the standard component
  // to be invisible over a custom button if needed. Given the HTML design has a custom button, we'll implement it.
  // Wait, let's look at the standard GoogleLogin component, it doesn't support custom children easily.
  // We'll wrap it or use the standard button. The design shows a custom button. Let's use @react-oauth/google's useGoogleLogin.
  // Actually, since useGoogleLogin is more complex for standard credential response, we can keep the custom button visual
  // by placing standard GoogleLogin with opacity-0 over it, OR just rely on standard GoogleLogin.
  // The user's HTML specifically styled a Google button. We should try to use the standard GoogleLogin but styled to match,
  // OR use useGoogleLogin. Let's stick to the standard one for reliability but use the new card design.

  return (
    <div className="bg-background-light text-slate-900 font-display min-h-screen flex flex-col transition-colors duration-200">

      <div className="bg-pattern relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden py-4 px-4">

        {/* Background Icons */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[5%] text-primary/10 rotate-12">
            <span className="material-symbols-outlined text-[120px]">school</span>
          </div>
          <div className="absolute bottom-[10%] right-[5%] text-primary/10 -rotate-12">
            <span className="material-symbols-outlined text-[120px]">calculate</span>
          </div>
          <div className="absolute top-[40%] right-[15%] text-primary/5 rotate-45">
            <span className="material-symbols-outlined text-[80px]">history_edu</span>
          </div>
          <div className="absolute bottom-[20%] left-[15%] text-primary/5 -rotate-6">
            <span className="material-symbols-outlined text-[60px]">account_balance</span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[440px]">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 h-24 w-24 overflow-hidden rounded-full shadow-soft bg-white p-1">
              <img
                alt="PCCOE Logo"
                className="h-full w-full object-contain"
                src="/pccoe-logo.png"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Exam Remuneration</h1>
            <p className="mt-1 text-sm text-slate-500">PCCOE Faculty & Staff Portal</p>
          </div>

          <motion.div
            key={generalError ? "error" : "normal"}
            initial={{ x: 0, opacity: 0, y: 20 }}
            animate={generalError ? { x: [0, -10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface-light rounded-xl shadow-card border border-slate-200 overflow-hidden"
          >
            <div className="p-6">

              {/* Error Alert */}
              <AnimatePresence>
                {generalError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: "1.5rem" }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200"
                  >
                    {generalError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Sign In Wrapper */}
              <div className="relative flex justify-center w-full">
                {/* Visual custom button as seen in HTML */}
                {/* <button className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700/50" type="button">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>Sign in with Google</span>
                </button> */}

                {/* Standard Google Login over custom styling if necessary, or just use standard */}
                <div className="w-full h-12 flex justify-center items-center">
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
              </div>

              <div className="my-5 relative flex items-center justify-center">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-surface-light px-4 text-slate-400 font-medium">or</span>
                </div>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">Email Address</span>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                    <input
                      className={`w-full rounded-lg border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-primary focus:ring-primary'} bg-white px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-shadow`}
                      placeholder="name@pccoepune.org"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      required
                    />
                  </div>
                  {emailError && <span className="text-xs text-red-500 mt-1">{emailError}</span>}
                </label>

                <label className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                    <input
                      className={`w-full rounded-lg border ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-primary focus:ring-primary'} bg-white px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-shadow`}
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      required
                    />
                    {/* <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" type="button">
                      <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                    </button> */}
                  </div>
                  {passwordError && <span className="text-xs text-red-500 mt-1">{passwordError}</span>}

                  <div className="flex justify-end mt-1">
                    <button type="button" onClick={() => showToast("Please contact Administrator to reset your password.", "info")} className="text-xs font-medium text-primary hover:text-primary-hover hover:underline transition-colors">Forgot Password?</button>
                  </div>
                </label>

                <button
                  className="hover-pulse mt-2 flex w-full items-center justify-center rounded-lg bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </button>
              </form>

              {/* Optional switch to signup if you want to keep it */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="text-primary hover:text-primary-hover font-semibold transition-colors hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>

            </div>
          </motion.div>
          <p className="mt-4 text-center text-xs text-slate-400">
            © 2026 PCCOE Exam Cell. All rights reserved.
          </p>
        </div>
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