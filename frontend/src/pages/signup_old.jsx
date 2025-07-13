import React, { useState } from "react";
import { Mail, Eye, EyeOff, CircleUserRound, LockKeyhole } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { signup, sendOTP, verifyOTP } from "../api/auth.js";
import { useAuth } from "../context/authContext.jsx";
import OTPVerification from "../components/OTPVerification.jsx";
import PasswordValidator, { validatePassword } from "../components/PasswordValidator.jsx";

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

  const { user, setLogin } = useAuth();

  if (user) {
    return <Navigate to="/home" />;
  }

  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
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

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error("Password does not meet all requirements.");
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Send OTP first
    const otpResult = await sendOTP(email);
    if (otpResult.success) {
      setOtpHash(otpResult.data.hash);
      setShowOTP(true);
      toast.success("OTP sent to your email!");
    } else {
      toast.error(otpResult.error || "Failed to send OTP");
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
        toast.error(`${verifyResult.error}. ${verifyResult.attemptsLeft} attempts left.`);
      } else {
        toast.error(verifyResult.error || "OTP verification failed");
        if (verifyResult.error?.includes("expired") || verifyResult.error?.includes("Too many")) {
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => (prev === "password" ? "text" : "password"));
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
    <div className="min-h-screen w-full fixed flex items-center top-0 justify-center overflow-auto font-sans text-primary py-10">
      <div className="w-[95%] max-w-6xl bg-base-100 rounded-2xl shadow-2xl border border-neutral overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[80vh]">
          
          {/* Left Panel - Form */}
          <div className="w-full lg:w-3/5 p-8 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl font-bold text-center mb-2">Sign Up</h2>
              <p className="text-md font-mono text-secondary text-center mb-8">
                Welcome to our platform.
              </p>

              <div className="space-y-4">
                {/* Name Input */}
                <div className="relative">
                  <CircleUserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Name"
                    className="pl-10 w-full input input-bordered bg-neutral text-primary h-12"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email Input */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="pl-10 w-full input input-bordered bg-neutral text-primary h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                  <input
                    type={showPassword}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setShowPasswordValidator(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowPasswordValidator(true)}
                    className="pl-10 pr-10 w-full input input-bordered bg-neutral text-primary h-12"
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

                {/* Confirm Password Input */}
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 w-full input input-bordered bg-neutral text-primary h-12"
                  />
                </div>

                {/* Password Validator */}
                {showPasswordValidator && (
                  <div className="mt-4">
                    <PasswordValidator 
                      password={password} 
                      confirmPassword={confirmPassword}
                      showConfirmMatch={confirmPassword.length > 0}
                    />
                  </div>
                )}

                {/* Submit Button */}
                {loading ? (
                  <button className="btn btn-primary btn-disabled w-full h-12 mt-6">
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  </button>
                ) : (
                  <button
                    onClick={handleSignup}
                    disabled={!validatePassword(password).isValid || password !== confirmPassword}
                    className="btn btn-primary w-full h-12 mt-6 disabled:opacity-50"
                  >
                    Sign Up
                  </button>
                )}

                {/* Login Link */}
                <p className="text-sm text-center text-secondary mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-accent hover:underline">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-2/5 bg-secondary text-primary-content flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold text-center mb-4">Glad to see you!</h2>
            <p className="text-md font-mono text-center">
              Create an account to get started with personalized news and recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
