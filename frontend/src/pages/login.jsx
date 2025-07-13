import React, { useState } from "react";
import { Mail, Eye, EyeOff, CircleUserRound, LockKeyhole } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { login, verifyCredentialsAndSendOTP, verifyOTP } from "../api/auth.js";
import { useAuth } from "../context/authContext.jsx";
import OTPVerification from "../components/OTPVerification.jsx";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpHash, setOtpHash] = useState("");
  const navigate = useNavigate();

  const { user, setLogin } = useAuth();

  if (user) {
    return <Navigate to="/home" />;
  }

  // Update the handleLogin function:
  const handleLogin = async () => {
    setLoading(true);
    if (!email || !password) {
      toast.error("All fields are required.");
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

    // Verify credentials and send OTP
    const otpResult = await verifyCredentialsAndSendOTP(email, password);
    if (otpResult.success) {
      setOtpHash(otpResult.data.hash);
      setShowOTP(true);
      toast.success("Credentials verified! OTP sent to your email.");
    } else {
      toast.error(otpResult.error || "Failed to verify credentials");
    }
    setLoading(false);
  };

  const handleOTPVerify = async (otp) => {
    const verifyResult = await verifyOTP(email, otp, otpHash);
    if (verifyResult.success) {
      // OTP verified, now proceed with login
      const result = await login({ email, password }, setLogin);
      if (result.success) {
        toast.success("Login successful!");
        navigate("/home");
      } else {
        toast.error(result.error || "Login failed");
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
    const otpResult = await verifyCredentialsAndSendOTP(email, password);
    if (otpResult.success) {
      setOtpHash(otpResult.data.hash);
      toast.success("New OTP sent to your email!");
    } else {
      toast.error(otpResult.error || "Failed to resend OTP");
    }
  };

  const handleBackToLogin = () => {
    setShowOTP(false);
    setOtpHash("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => (prev === "password" ? "text" : "password"));
  };

  // Show OTP verification if needed
  if (showOTP) {
    return (
      <OTPVerification
        email={email}
        onVerify={handleOTPVerify}
        onBack={handleBackToLogin}
        onResend={handleOTPResend}
        isLoading={loading}
        purpose="login"
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-auto font-sans text-primary py-10 pt-20">
      <div className="w-[90%] max-w-lg bg-base-100 rounded-2xl shadow-2xl border border-neutral p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CircleUserRound className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-sm text-base-content/70">
            Please enter your credentials to access your account.
          </p>
        </div>

        {/* Form */}
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

          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
            <input
              type={showPassword}
              placeholder="Enter your password"
              className="pl-10 pr-10 w-full input input-bordered bg-neutral text-primary h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {showPassword === "password" ? (
              <EyeOff
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5 cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <Eye
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5 cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full btn btn-primary h-12 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                Signing In...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CircleUserRound className="w-5 h-5" />
                Sign In
              </div>
            )}
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-3">
          <Link
            to="/forgot-password"
            className="text-sm text-accent hover:underline block"
          >
            Forgot your password?
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-base-300"></div>
            <span className="text-xs text-base-content/50">OR</span>
            <div className="flex-1 border-t border-base-300"></div>
          </div>

          <p className="text-sm text-base-content/70">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-accent hover:underline font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
