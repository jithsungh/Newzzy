import React, { useState } from "react";
import { Mail, Eye, EyeOff, CircleUserRound, LockKeyhole } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { login } from "../api/auth.js";
import { useAuth } from "../context/authContext.jsx";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

    const result = await login({ email, password }, setLogin);

    if (result.success) {
      toast.success("Login successful!");
      navigate("/home");
    } else {
      toast.error(result.error || "Login failed");
    }
    setLoading(false);
  };


  const togglePasswordVisibility = () => {
    setShowPassword((prev) => (prev === "password" ? "text" : "password"));
  };

  return (
    <div className="min-h-screen w-full fixed flex items-center justify-center overflow-hidden top-10 font-sans text-primary">
  <div className="w-[90%] max-w-4xl h-[80vh] md:h-[70vh] flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl border border-neutral">
    {/* Left Panel */}
    <div className="w-full md:w-2/5 bg-secondary text-primary-content flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-3xl font-bold">Welcome Back</h2>
      <p className="text-md font-mono text-center">
        Please enter your credentials to access your account.
      </p>
    </div>

    {/* Right Panel */}
    <div className="w-full md:w-3/5 bg-base-100 text-primary flex flex-col items-center justify-center gap-5 px-6 py-8">
      <h2 className="text-3xl font-bold">Sign In</h2>
      <p className="text-md font-mono text-secondary">Welcome to our platform.</p>

      <div className="relative w-full max-w-xs">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
        <input
          type="email"
          placeholder="Email"
          className="pl-10 w-full input input-bordered bg-neutral text-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="relative w-full max-w-xs">
        <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
        <input
          type={showPassword}
          placeholder="Password"
          className="pl-10 w-full input input-bordered bg-neutral text-primary"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

      {loading ? (
        <button className="btn btn-primary btn-disabled w-full max-w-xs mt-2">
          <span className="loading loading-spinner loading-sm"></span>
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="btn btn-primary w-full max-w-xs mt-2"
        >
          Sign In
        </button>
      )}

      <p className="text-sm mt-4 text-secondary">
        Don't have an account?{" "}
        <Link to="/signup" className="text-accent hover:underline">
          SIGN UP
        </Link>
      </p>
    </div>
  </div>
</div>

  );
};

export default LoginPage;
