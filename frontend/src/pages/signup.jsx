import React, { useState, useRef } from "react";
import {
  Mail,
  Eye,
  EyeOff,
  CircleUserRound,
  LockKeyhole,
  Info,
} from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toastManager } from "../utils/toastManager";
import { signup, sendOTP, verifyOTP } from "../api/auth.js";
import { useAuth } from "../context/authContext.jsx";
import OTPVerification from "../components/OTPVerification.jsx";
import PasswordValidatorPopup from "../components/PasswordValidatorPopup.jsx";
import { validatePassword } from "../components/PasswordValidator.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState("password");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpHash, setOtpHash] = useState("");
  const [showPasswordValidator, setShowPasswordValidator] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [hasClickedPassword, setHasClickedPassword] = useState(false);
  const passwordInputRef = useRef(null);

  const navigate = useNavigate();
  const { user, setLogin } = useAuth();

  if (user) {
    return <Navigate to="/home" />;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(showPassword === "password" ? "text" : "password");
  };

  const handlePasswordFocus = () => {
    if (!hasClickedPassword) {
      setHasClickedPassword(true);
      setShowPasswordValidator(true);
    }
  };

  const handlePasswordBlur = (e) => {
    // Don't hide the popup once it's been shown in signup
    // It will only close after successful signup
  };

  const handleSignup = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toastManager.error("All fields are required.");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toastManager.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toastManager.error("Password does not meet all requirements.");
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toastManager.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Send OTP first
    const otpResult = await sendOTP(email);
    if (otpResult.success) {
      setOtpHash(otpResult.data.hash);
      setShowOTP(true);
      toastManager.success("OTP sent to your email!");
    } else {
      toastManager.error(otpResult.error || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleOTPVerify = async (otp) => {
    const verifyResult = await verifyOTP(email, otp, otpHash);
    if (verifyResult.success) {
      // OTP verified, now proceed with signup
      const result = await signup({ name, email, password }, setLogin);
      if (result.success) {
        toast.success("Signup successful!");
        console.log("Signup successful:", result.data);
        navigate("/preferences", { state: { fromReset: true } });
        console.log("navigate to preferences");
      } else {
        toast.error(result.error || "Signup failed");
        setShowOTP(false);
      }
    } else {
      if (verifyResult.attemptsLeft !== undefined) {
        toast.error(
          `${verifyResult.error}. ${verifyResult.attemptsLeft} attempts left.`
        );
      } else {
        toast.error(verifyResult.error || "OTP verification failed");
        if (
          verifyResult.error?.includes("expired") ||
          verifyResult.error?.includes("Too many")
        ) {
          setShowOTP(false);
        }
      }
    }
  };

  const handleOTPResend = async () => {
    const otpResult = await sendOTP(email);
    if (otpResult.success) {
      setOtpHash(otpResult.data.hash);
      toast.success("New OTP sent to your email!");
    } else {
      toast.error(otpResult.error || "Failed to resend OTP");
    }
  };

  const handleBackToSignup = () => {
    setShowOTP(false);
    setOtpHash("");
  };

  // Show OTP verification if needed
  if (showOTP) {
    return (
      <OTPVerification
        email={email}
        onVerify={handleOTPVerify}
        onBack={handleBackToSignup}
        onResend={handleOTPResend}
        isLoading={loading}
        purpose="signup"
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-auto font-sans text-primary py-10 pt-20">
      {/* Password Validator Popup - Sticky on left side */}
      <PasswordValidatorPopup
        password={password}
        confirmPassword={confirmPassword}
        showConfirmMatch={confirmPassword.length > 0}
        isOpen={showPasswordValidator && password}
        onClose={() => setShowPasswordValidator(false)}
        position={popupPosition}
        isSticky={true}
      />

      <div className="w-[90%] max-w-lg bg-base-100 rounded-2xl shadow-2xl border border-neutral p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CircleUserRound className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            Create Account
          </h1>
          <p className="text-sm text-base-content/70">
            Join our platform to get personalized news and recommendations.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name Input */}
          <div className="relative">
            <CircleUserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
            <input
              type="text"
              placeholder="Enter your full name"
              className="pl-10 w-full input input-bordered bg-neutral text-primary h-12"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email address"
              className="pl-10 w-full input input-bordered bg-neutral text-primary h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
            <input
              ref={passwordInputRef}
              type={showPassword}
              placeholder="Create a password"
              className="pl-10 pr-16 w-full input input-bordered bg-neutral text-primary h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handlePasswordFocus}
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Info
                className="w-4 h-4 text-info cursor-pointer hover:text-info-focus transition-colors"
                onClick={handlePasswordFocus}
                title="Show password requirements"
              />
              {showPassword === "password" ? (
                <EyeOff
                  className="w-5 h-5 text-secondary cursor-pointer hover:text-primary transition-colors"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <Eye
                  className="w-5 h-5 text-secondary cursor-pointer hover:text-primary transition-colors"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
            <input
              type="password"
              placeholder="Confirm your password"
              className="pl-10 w-full input input-bordered bg-neutral text-primary h-12"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSignup}
            disabled={
              loading ||
              !name ||
              !email ||
              !password ||
              !confirmPassword ||
              !validatePassword(password).isValid ||
              password !== confirmPassword
            }
            className="w-full btn btn-success h-12 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                Creating Account...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CircleUserRound className="w-5 h-5" />
                Create Account
              </div>
            )}
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 border-t border-base-300"></div>
            <span className="text-xs text-base-content/50">
              ALREADY HAVE AN ACCOUNT?
            </span>
            <div className="flex-1 border-t border-base-300"></div>
          </div>

          <p className="text-sm text-base-content/70">
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
