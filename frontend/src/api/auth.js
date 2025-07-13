import api from "./axios";

const signup = async (userData, setLogin) => {
  try {
    const response = await api.post("/auth/signup", userData);

    if (response.status === 201) {
      console.log("Signup successful:", response.message);
      const { AccessToken, newUser } = response.data;
      setLogin(newUser, AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Signup failed",
    };
  }
};

const login = async (credentials, setLogin) => {
  try {
    const response = await api.post("/auth/login", credentials);

    if (response.status === 200) {
      console.log("Login successful:", response.data);
      const { AccessToken, user } = response.data;
      setLogin(user, AccessToken);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Login failed",
    };
  }
};

const logout = async (setLogout) => {
  try {
    const response = await api.post("/auth/logout");

    if (response.status === 200) {
      setLogout();
      return { success: true };
    }
    return { success: false, error: response.data.error };
  } catch (error) {
    console.error("Logout error:", error);
    // Even if the server logout fails, clear local storage
    setLogout();
    return {
      success: false,
      error: error.response?.data?.message || "Logout failed",
    };
  }
};

// OTP Functions
const sendOTP = async (email) => {
  try {
    const response = await api.post("/auth/send-otp", { email });

    if (response.status === 200) {
      console.log("OTP sent successfully:", response.data);
      return {
        success: true,
        data: response.data,
      };
    }
    return { success: false, error: response.data.message };
  } catch (error) {
    console.error("Send OTP error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to send OTP",
    };
  }
};

const verifyCredentialsAndSendOTP = async (email, password) => {
  try {
    const response = await api.post("/auth/verify-credentials-send-otp", {
      email,
      password,
    });

    if (response.status === 200) {
      console.log("Credentials verified and OTP sent:", response.data);
      return {
        success: true,
        data: response.data,
      };
    }
    return { success: false, error: response.data.message };
  } catch (error) {
    console.error("Verify credentials and send OTP error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to verify credentials or send OTP",
    };
  }
};

const verifyOTP = async (email, otp, hash) => {
  try {
    const response = await api.post("/auth/verify-otp", { email, otp, hash });

    if (response.status === 200) {
      console.log("OTP verified successfully:", response.data);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message };
  } catch (error) {
    console.error("Verify OTP error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "OTP verification failed",
      attemptsLeft: error.response?.data?.attemptsLeft,
    };
  }
};

// Password Reset Functions
const forgotPasswordSendOTP = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });

    if (response.status === 200) {
      console.log("Password reset OTP sent:", response.data);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message };
  } catch (error) {
    console.error("Forgot password send OTP error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to send password reset OTP",
    };
  }
};

const verifyPasswordResetOTP = async (email, otp, hash) => {
  try {
    const response = await api.post("/auth/verify-password-reset-otp", {
      email,
      otp,
      hash,
    });

    if (response.status === 200) {
      console.log("Password reset OTP verified:", response.data);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message };
  } catch (error) {
    console.error("Verify password reset OTP error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Password reset OTP verification failed",
      attemptsLeft: error.response?.data?.attemptsLeft,
    };
  }
};

const resetPassword = async (email, newPassword, resetToken) => {
  try {
    const response = await api.post("/auth/reset-password", {
      email,
      newPassword,
      resetToken,
    });

    if (response.status === 200) {
      console.log("Password reset successful:", response.data);
      return { success: true, data: response.data };
    }
    return { success: false, error: response.data.message };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Password reset failed",
    };
  }
};

export {
  signup,
  login,
  logout,
  sendOTP,
  verifyOTP,
  verifyCredentialsAndSendOTP,
  forgotPasswordSendOTP,
  verifyPasswordResetOTP,
  resetPassword,
};
