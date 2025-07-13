import React, { useState, useRef } from "react";
import {
  Mail,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  forgotPasswordSendOTP,
  verifyPasswordResetOTP,
  resetPassword,
} from "../api/auth.js";
import OTPVerification from "../components/OTPVerification.jsx";
import PasswordValidatorPopup from "../components/PasswordValidatorPopup.jsx";
import { validatePassword } from "../components/PasswordValidator.jsx";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otpHash, setOtpHash] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPasswordValidator, setShowPasswordValidator] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [hasClickedPassword, setHasClickedPassword] = useState(false);
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleSendOTP = async () => {
    setLoading(true);
    if (!email) {
      toast.error("Email is required.");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const result = await forgotPasswordSendOTP(email);
    if (result.success) {
      setOtpHash(result.data.hash);
      setStep(2);
      toast.success("Password reset OTP sent to your email!");
    } else {
      toast.error(result.error || "Failed to send OTP");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleOTPVerify = async (otp) => {
    const verifyResult = await verifyPasswordResetOTP(email, otp, otpHash);
    if (verifyResult.success) {
      setResetToken(verifyResult.data.resetToken);
      setStep(3);
      toast.success("OTP verified! Now set your new password.");
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
          setStep(1);
        }
      }
    }
  };

  // Step 2: Resend OTP
  const handleOTPResend = async () => {
    const result = await forgotPasswordSendOTP(email);
    if (result.success) {
      setOtpHash(result.data.hash);
      toast.success("New OTP sent to your email!");
    } else {
      toast.error(result.error || "Failed to resend OTP");
    }
  };

  // Step 2: Back to email step
  const handleBackToEmail = () => {
    setStep(1);
    setOtpHash("");
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      toast.error("Both password fields are required.");
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast.error("Password does not meet all requirements.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = await resetPassword(email, newPassword, resetToken);
    if (result.success) {
      toast.success(
        "Password reset successfully! You can now login with your new password."
      );
      navigate("/login");
    } else {
      toast.error(result.error || "Failed to reset password");
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Popup handlers
  const handlePasswordFocus = () => {
    if (!hasClickedPassword) {
      setHasClickedPassword(true);
      setShowPasswordValidator(true);
    }
  };

  const handlePasswordBlur = (e) => {
    // Don't hide the popup once it's been shown in password reset
    // It will only close after successful password reset
  };

  // Render OTP verification step
  if (step === 2) {
    return (
      <OTPVerification
        email={email}
        onVerify={handleOTPVerify}
        onBack={handleBackToEmail}
        onResend={handleOTPResend}
        isLoading={loading}
        purpose="password reset"
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-auto font-sans text-primary py-10 pt-20">
      {/* Password Validator Popup - Only show in step 3 (new password) */}
      {step === 3 && (
        <PasswordValidatorPopup
          password={newPassword}
          confirmPassword={confirmPassword}
          showConfirmMatch={confirmPassword.length > 0}
          isOpen={showPasswordValidator && newPassword}
          onClose={() => setShowPasswordValidator(false)}
          position={popupPosition}
          isSticky={true}
        />
      )}

      <div className="w-[90%] max-w-lg bg-base-100 rounded-2xl shadow-2xl border border-neutral p-8">
        {step === 1 && (
          <>
            {/* Step 1: Email Input */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-10 h-10 text-error" />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">
                Forgot Password?
              </h1>
              <p className="text-sm text-base-content/70">
                No worries! Enter your email address and we'll send you a code
                to reset your password.
              </p>
            </div>

            <div className="space-y-6">
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

              <button
                onClick={handleSendOTP}
                disabled={loading || !email}
                className="w-full btn btn-error h-12 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loading loading-spinner loading-sm"></div>
                    Sending OTP...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Send Reset Code
                  </div>
                )}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Step 3: New Password */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">
                Create New Password
              </h1>
              <p className="text-sm text-base-content/70">
                Please enter your new password. Make sure it's strong and
                secure.
              </p>
            </div>

            <div className="space-y-6">
              {/* New Password Input */}
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  className="pl-10 pr-16 w-full input input-bordered bg-neutral text-primary h-12"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Info
                    className="w-4 h-4 text-info cursor-pointer hover:text-info-focus transition-colors"
                    onClick={handlePasswordFocus}
                    title="Show password requirements"
                  />
                  {showPassword ? (
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
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="pl-10 w-full input input-bordered bg-neutral text-primary h-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleResetPassword}
                disabled={
                  loading ||
                  !validatePassword(newPassword).isValid ||
                  newPassword !== confirmPassword
                }
                className="w-full btn btn-success h-12 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loading loading-spinner loading-sm"></div>
                    Resetting Password...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Reset Password
                  </div>
                )}
              </button>
            </div>
          </>
        )}

        {/* Back to Login */}
        <div className="flex items-center justify-center gap-4 pt-6 mt-6 border-t border-neutral">
          <Link
            to="/login"
            className="btn btn-ghost btn-sm text-base-content/70 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-3 bg-info/10 rounded-lg border border-info/20">
          <p className="text-xs text-info text-center">
            🔒 For your security, reset codes expire automatically and can only
            be used once.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
