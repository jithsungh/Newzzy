const crypto = require("crypto");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const User = require("../models/users.js");
const bcrypt = require("bcryptjs");

// Configure Brevo client
const brevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevoClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate hash for OTP verification
const generateHash = (email, otp) => {
  return crypto
    .createHash("sha256")
    .update(`${email}:${otp}:${process.env.JWT_SECRET}`)
    .digest("hex");
};

// Send OTP Email
const sendOtpEmail = async (toEmail, otp) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      to: [{ email: toEmail }],
      sender: { name: "Newzzy", email: "no.reply.newzzy@gmail.com" },
      subject: "Your OTP Code - Newzzy",
      htmlContent: `
          <html>
            <head>
              <title>OTP Verification</title>
            </head>
            <body style="margin:0; padding:0; font-family:Segoe UI,Tahoma,Geneva,sans-serif; background:#f5f5f5;">
              <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:30px; text-align:center;">
                    <h1 style="margin:0; font-size:28px; font-weight:600; color:#fff;">🔐 OTP Verification</h1>
                    <p style="margin:10px 0 0; font-size:16px; color:#eee;">Secure access to your Newzzy account</p>
                  </td>
                </tr>
      
                <!-- OTP Section -->
                <tr>
                  <td style="padding:30px; text-align:center;">
                    <div style="display:inline-block; background:#f8f9ff; border:2px dashed #667eea; border-radius:12px; padding:20px 30px;">
                      <p style="margin:0 0 10px; font-size:14px; color:#666; font-weight:600; text-transform:uppercase;">Your OTP Code</p>
                      <h2 style="margin:0; font-size:36px; font-weight:700; color:#667eea; letter-spacing:4px; font-family:Courier New,monospace;">${otp}</h2>
                    </div>
      
                    <div style="margin-top:30px; background:#fff5f5; border-left:4px solid #f56565; padding:15px 20px; border-radius:6px;">
                      <p style="margin:0; color:#c53030; font-size:14px; font-weight:500;">
                        ⚡ This OTP will expire in 5 minutes for security reasons.
                      </p>
                    </div>
      
                    <p style="margin-top:30px; font-size:16px; color:#666;">Enter this code in your Newzzy app to complete verification.</p>
                  </td>
                </tr>
      
                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#3d0079; border-top:1px solid #e9ecef;">
                    <p style="margin:0;">If you didn't request this OTP, ignore this email or contact support.</p>
                    <p style="margin:5px 0 0;">© 2025 Newzzy. All rights reserved.</p>
                  </td>
                </tr>
      
              </table>
            </body>
          </html>
        `,
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("OTP Email sent successfully. Message ID:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: error.message };
  }
};

// Send Password Reset OTP Email
const sendPasswordResetOtpEmail = async (toEmail, otp) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      to: [{ email: toEmail }],
      sender: { name: "Newzzy", email: "no.reply.newzzy@gmail.com" },
      subject: "🔐 Password Reset OTP - Newzzy",
      htmlContent: `
          <html>
            <head>
              <title>Password Reset OTP</title>
            </head>
            <body style="margin:0; padding:0; font-family:Segoe UI,Tahoma,Geneva,sans-serif; background:#f5f5f5;">
              <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%); padding:30px; text-align:center;">
                    <h1 style="margin:0; font-size:28px; font-weight:600; color:#fff;">🔐 Password Reset</h1>
                    <p style="margin:10px 0 0; font-size:16px; color:#eee;">Secure password reset for your Newzzy account</p>
                  </td>
                </tr>
      
                <!-- OTP Section -->
                <tr>
                  <td style="padding:30px; text-align:center;">
                    <div style="margin-bottom:20px;">
                      <p style="margin:0; font-size:18px; color:#333; font-weight:500;">Password Reset Requested</p>
                      <p style="margin:10px 0 0; font-size:14px; color:#666;">We received a request to reset your password. Use the code below to proceed.</p>
                    </div>

                    <div style="display:inline-block; background:#fff5f5; border:2px dashed #f5576c; border-radius:12px; padding:20px 30px;">
                      <p style="margin:0 0 10px; font-size:14px; color:#666; font-weight:600; text-transform:uppercase;">Your Reset Code</p>
                      <h2 style="margin:0; font-size:36px; font-weight:700; color:#f5576c; letter-spacing:4px; font-family:Courier New,monospace;">${otp}</h2>
                    </div>
      
                    <div style="margin-top:30px; background:#fff3cd; border-left:4px solid #ffc107; padding:15px 20px; border-radius:6px;">
                      <p style="margin:0; color:#856404; font-size:14px; font-weight:500;">
                        ⏰ This code will expire in 10 minutes for security reasons.
                      </p>
                    </div>

                    <div style="margin-top:20px; background:#d1ecf1; border-left:4px solid #bee5eb; padding:15px 20px; border-radius:6px;">
                      <p style="margin:0; color:#0c5460; font-size:14px; font-weight:500;">
                        🔒 If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                      </p>
                    </div>
      
                    <p style="margin-top:30px; font-size:16px; color:#666;">Enter this code in your Newzzy app to reset your password.</p>
                  </td>
                </tr>
      
                <!-- Footer -->
                <tr>
                  <td style="background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#3d0079; border-top:1px solid #e9ecef;">
                    <p style="margin:0;">For security reasons, this code can only be used once and will expire automatically.</p>
                    <p style="margin:5px 0 0;">© 2025 Newzzy. All rights reserved.</p>
                  </td>
                </tr>
      
              </table>
            </body>
          </html>
        `,
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      "Password Reset OTP Email sent successfully. Message ID:",
      result.messageId
    );
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    return { success: false, error: error.message };
  }
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate OTP and hash
    const otp = generateOTP();
    const hash = generateHash(email, otp);

    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      hash,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });

    // Send email
    const emailResult = await sendOtpEmail(email, otp);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        hash,
        email: email.replace(/(.{3})(.*)(@.*)/, "$1***$3"), // Mask email for security
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, hash } = req.body;

    if (!email || !otp || !hash) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and hash are required",
      });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    // For login flow, check if credentials were pre-verified (if this field exists, it means we're in login flow)
    // This is just a safety check - not strictly necessary since we have separate endpoints

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Check attempts (max 3)
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify hash
    const expectedHash = generateHash(email, otp);
    if (hash !== storedData.hash) {
      return res.status(400).json({
        success: false,
        message: "Invalid hash",
      });
    }

    // Verify OTP
    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsLeft: 3 - storedData.attempts,
      });
    }

    // OTP verified successfully
    otpStore.delete(email);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify credentials and send OTP
const verifyCredentialsAndSendOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user exists and verify password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Credentials are valid, now send OTP
    const otp = generateOTP();
    const hash = generateHash(email, otp);

    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      hash,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
      credentialsVerified: true, // Mark that credentials were verified
    });

    // Send email
    const emailResult = await sendOtpEmail(email, otp);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: "Credentials verified. OTP sent successfully",
        hash,
        email: email.replace(/(.{3})(.*)(@.*)/, "$1***$3"), // Mask email for security
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
  } catch (error) {
    console.error("Verify credentials and send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Forgot Password - Send OTP
const forgotPasswordSendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Generate OTP and hash
    const otp = generateOTP();
    const hash = generateHash(email, otp);

    // Store OTP with expiration (10 minutes for password reset)
    otpStore.set(email, {
      otp,
      hash,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes for password reset
      attempts: 0,
      type: "password_reset", // Mark as password reset OTP
    });

    // Send email with different template
    const emailResult = await sendPasswordResetOtpEmail(email, otp);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: "Password reset OTP sent successfully",
        hash,
        email: email.replace(/(.{3})(.*)(@.*)/, "$1***$3"), // Mask email for security
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send password reset OTP email",
      });
    }
  } catch (error) {
    console.error("Forgot password send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify Password Reset OTP
const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp, hash } = req.body;

    if (!email || !otp || !hash) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and hash are required",
      });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    // Check if this is a password reset OTP
    if (storedData.type !== "password_reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP type",
      });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Check attempts (max 3)
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify hash
    const expectedHash = generateHash(email, otp);
    if (hash !== storedData.hash) {
      return res.status(400).json({
        success: false,
        message: "Invalid hash",
      });
    }

    // Verify OTP
    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsLeft: 3 - storedData.attempts,
      });
    }

    // OTP verified successfully - generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Store reset token
    otpStore.set(`reset_${email}`, {
      token: resetToken,
      expiresAt: resetTokenExpiry,
      email: email,
    });

    // Clear OTP data
    otpStore.delete(email);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Verify password reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({
        success: false,
        message: "Email, new password, and reset token are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check reset token
    const resetData = otpStore.get(`reset_${email}`);
    if (!resetData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Check token expiry
    if (Date.now() > resetData.expiresAt) {
      otpStore.delete(`reset_${email}`);
      return res.status(400).json({
        success: false,
        message: "Reset token expired",
      });
    }

    // Verify token
    if (resetData.token !== resetToken || resetData.email !== email) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Clear reset token
    otpStore.delete(`reset_${email}`);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Password validation function
const validatePassword = (password) => {
  const validations = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValid = Object.values(validations).every(Boolean);

  return {
    isValid,
    validations,
    errors: []
      .concat(
        !validations.minLength
          ? ["Password must be at least 6 characters long"]
          : []
      )
      .concat(
        !validations.hasUppercase
          ? ["Password must contain at least one uppercase letter"]
          : []
      )
      .concat(
        !validations.hasLowercase
          ? ["Password must contain at least one lowercase letter"]
          : []
      )
      .concat(
        !validations.hasNumber
          ? ["Password must contain at least one number"]
          : []
      )
      .concat(
        !validations.hasSpecialChar
          ? ["Password must contain at least one special character"]
          : []
      ),
  };
};

// Clear expired OTPs (cleanup function)
const clearExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
};

// Run cleanup every 10 minutes
setInterval(clearExpiredOTPs, 10 * 60 * 1000);

module.exports = {
  sendOTP,
  verifyOTP,
  verifyCredentialsAndSendOTP,
  forgotPasswordSendOTP,
  verifyPasswordResetOTP,
  resetPassword,
  validatePassword,
};
