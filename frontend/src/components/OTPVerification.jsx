import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mail, RefreshCw, Shield, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const OTPVerification = ({
  email,
  onVerify,
  onBack,
  onResend,
  isLoading = false,
  purpose = "signup", // "signup" or "login"
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or next empty one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-verify if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  // Verify OTP
  const handleVerify = async (otpValue = otp.join("")) => {
    if (otpValue.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setIsVerifying(true);
    try {
      await onVerify(otpValue);
    } catch (error) {
      console.error("OTP verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setTimeLeft(300);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    await onResend();
  };

  // Mask email
  const maskEmail = (email) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) return email;
    return `${localPart.slice(0, 3)}***@${domain}`;
  };

  return (
    <div className="min-h-screen w-full fixed flex items-center top-10 justify-center overflow-hidden font-sans text-primary">
      <div className="w-[90%] max-w-md bg-base-100 rounded-2xl shadow-2xl border border-neutral p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              purpose === "password reset" ? "bg-error/10" : "bg-secondary/10"
            }`}
          >
            <Shield
              className={`w-10 h-10 ${
                purpose === "password reset" ? "text-error" : "text-secondary"
              }`}
            />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            {purpose === "password reset"
              ? "Verify Reset Code"
              : "Verify Your Email"}
          </h1>
          <p className="text-sm text-base-content/70">
            {purpose === "password reset"
              ? "We've sent a 6-digit reset code to"
              : "We've sent a 6-digit verification code to"}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Mail
              className={`w-4 h-4 ${
                purpose === "password reset" ? "text-error" : "text-secondary"
              }`}
            />
            <span
              className={`font-medium ${
                purpose === "password reset" ? "text-error" : "text-secondary"
              }`}
            >
              {maskEmail(email)}
            </span>
          </div>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <div className="flex gap-3 justify-center mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) =>
                  handleOtpChange(index, e.target.value.replace(/\D/, ""))
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-neutral rounded-lg 
                          focus:border-primary focus:outline-none transition-colors
                          bg-base-100 text-primary"
                disabled={isVerifying || isLoading}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-base-content/70">
                Code expires in{" "}
                <span className="font-medium text-error">
                  {formatTime(timeLeft)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-error">Code has expired</p>
            )}
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={otp.some((digit) => !digit) || isVerifying || isLoading}
          className={`w-full btn h-12 text-neutral font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4 ${
            purpose === "password reset" ? "btn-error" : "btn-secondary"
          }`}
        >
          {isVerifying ? (
            <div className="flex items-center gap-2">
              <div className="loading loading-spinner loading-sm"></div>
              Verifying...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Verify & Continue
            </div>
          )}
        </button>

        {/* Resend Option */}
        <div className="text-center mb-6">
          <p className="text-sm text-base-content/70 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend && timeLeft > 0}
            className={`btn btn-ghost btn-sm hover:text-secondary-focus disabled:opacity-50 ${
              purpose === "password reset"
                ? "text-error hover:text-error-focus"
                : "text-secondary"
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {canResend || timeLeft === 0
              ? "Resend Code"
              : `Resend in ${formatTime(timeLeft)}`}
          </button>
        </div>

        {/* Back Option */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral">
          <button
            onClick={onBack}
            disabled={isVerifying || isLoading}
            className="btn btn-ghost btn-sm text-base-content/70 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {purpose}
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-3 bg-info/10 rounded-lg border border-info/20">
          <p className="text-xs text-info text-center">
            🔒 For your security, this code will expire automatically and can
            only be used once.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
