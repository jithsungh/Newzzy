const crypto = require("crypto");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const User = require("../models/users.js");
const bcrypt = require("bcryptjs");

// ─── Logger ───────────────────────────────────────────────────────────────────
const log = {
  info:  (fn, msg, meta = {}) => console.log(JSON.stringify({ level: "INFO",  fn, msg, ...meta, ts: new Date().toISOString() })),
  warn:  (fn, msg, meta = {}) => console.warn(JSON.stringify({ level: "WARN",  fn, msg, ...meta, ts: new Date().toISOString() })),
  error: (fn, msg, meta = {}) => console.error(JSON.stringify({ level: "ERROR", fn, msg, ...meta, ts: new Date().toISOString() })),
  debug: (fn, msg, meta = {}) => console.log(JSON.stringify({ level: "DEBUG", fn, msg, ...meta, ts: new Date().toISOString() })),
};

// ─── Brevo Setup ──────────────────────────────────────────────────────────────
const brevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevoClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

if (!process.env.BREVO_API_KEY) {
  log.warn("init", "BREVO_API_KEY is not set — emails will fail");
}
if (!process.env.JWT_SECRET) {
  log.warn("init", "JWT_SECRET is not set — OTP hashing will fail");
}

// ─── OTP Store ────────────────────────────────────────────────────────────────
const otpStore = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────
// TODO: remove before production — bypasses email sending for local dev
const DEV_OTP = "123456";

const generateOTP = () => {
  log.warn("generateOTP", "DEV MODE: OTP hardcoded to 123456");
  return DEV_OTP;
};

const generateHash = (email, otp) => {
  const hash = crypto
    .createHash("sha256")
    .update(`${email}:${otp}:${process.env.JWT_SECRET}`)
    .digest("hex");
  log.debug("generateHash", "Hash generated", { email });
  return hash;
};

// ─── Email Senders ────────────────────────────────────────────────────────────
const sendOtpEmail = async (toEmail, otp) => {
  log.info("sendOtpEmail", "Attempting to send OTP email", { toEmail });
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      to: [{ email: toEmail }],
      sender: { name: "Jithsungh", email: "jithsungh@gmail.com" },
      subject: "Your OTP Code - Newzzy",
      htmlContent: `
          <html>
            <head>
              <title>OTP Verification</title>
            </head>
            <body style="margin:0; padding:0; font-family:Segoe UI,Tahoma,Geneva,sans-serif; background:#f5f5f5;">
              <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:30px; text-align:center;">
                    <h1 style="margin:0; font-size:28px; font-weight:600; color:#fff;">🔐 OTP Verification</h1>
                    <p style="margin:10px 0 0; font-size:16px; color:#eee;">Secure access to your Newzzy account</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px; text-align:center;">
                    <div style="display:inline-block; background:#f8f9ff; border:2px dashed #667eea; border-radius:12px; padding:20px 30px;">
                      <p style="margin:0 0 10px; font-size:14px; color:#666; font-weight:600; text-transform:uppercase;">Your OTP Code</p>
                      <h2 style="margin:0; font-size:36px; font-weight:700; color:#667eea; letter-spacing:4px; font-family:Courier New,monospace;">${otp}</h2>
                    </div>
                    <div style="margin-top:30px; background:#fff5f5; border-left:4px solid #f56565; padding:15px 20px; border-radius:6px;">
                      <p style="margin:0; color:#c53030; font-size:14px; font-weight:500;">⚡ This OTP will expire in 5 minutes for security reasons.</p>
                    </div>
                    <p style="margin-top:30px; font-size:16px; color:#666;">Enter this code in your Newzzy app to complete verification.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#3d0079; border-top:1px solid #e9ecef;">
                    <p style="margin:0;">If you didn't request this OTP, ignore this email or contact support.</p>
                    <p style="margin:5px 0 0;">© 2025 Newzzy. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </body>
          </html>`,
    };

    // DEV MODE: skip actual email send
    log.warn("sendOtpEmail", "DEV MODE: skipping Brevo call, OTP is 123456", { toEmail });
    return { success: true, messageId: "dev-mock-id" };
  } catch (error) {
    log.error("sendOtpEmail", "Failed to send OTP email", {
      toEmail,
      errorMessage: error.message,
      statusCode: error.status ?? error.statusCode ?? null,
      brevoResponse: error.response?.body ?? null,  // <-- Brevo error detail
    });
    return { success: false, error: error.message };
  }
};

const sendPasswordResetOtpEmail = async (toEmail, otp) => {
  log.info("sendPasswordResetOtpEmail", "Attempting to send password reset OTP email", { toEmail });
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      to: [{ email: toEmail }],
      sender: { name: "Jithsungh", email: "jithsungh@gmail.com" },
      subject: "🔐 Password Reset OTP - Newzzy",
      htmlContent: `
          <html>
            <head><title>Password Reset OTP</title></head>
            <body style="margin:0; padding:0; font-family:Segoe UI,Tahoma,Geneva,sans-serif; background:#f5f5f5;">
              <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px; background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%); padding:30px; text-align:center;">
                    <h1 style="margin:0; font-size:28px; font-weight:600; color:#fff;">🔐 Password Reset</h1>
                    <p style="margin:10px 0 0; font-size:16px; color:#eee;">Secure password reset for your Newzzy account</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px; text-align:center;">
                    <div style="margin-bottom:20px;">
                      <p style="margin:0; font-size:18px; color:#333; font-weight:500;">Password Reset Requested</p>
                      <p style="margin:10px 0 0; font-size:14px; color:#666;">Use the code below to proceed.</p>
                    </div>
                    <div style="display:inline-block; background:#fff5f5; border:2px dashed #f5576c; border-radius:12px; padding:20px 30px;">
                      <p style="margin:0 0 10px; font-size:14px; color:#666; font-weight:600; text-transform:uppercase;">Your Reset Code</p>
                      <h2 style="margin:0; font-size:36px; font-weight:700; color:#f5576c; letter-spacing:4px; font-family:Courier New,monospace;">${otp}</h2>
                    </div>
                    <div style="margin-top:30px; background:#fff3cd; border-left:4px solid #ffc107; padding:15px 20px; border-radius:6px;">
                      <p style="margin:0; color:#856404; font-size:14px; font-weight:500;">⏰ This code will expire in 10 minutes for security reasons.</p>
                    </div>
                    <div style="margin-top:20px; background:#d1ecf1; border-left:4px solid #bee5eb; padding:15px 20px; border-radius:6px;">
                      <p style="margin:0; color:#0c5460; font-size:14px; font-weight:500;">🔒 If you didn't request this, ignore this email — your password won't change.</p>
                    </div>
                    <p style="margin-top:30px; font-size:16px; color:#666;">Enter this code in your Newzzy app to reset your password.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8f9fa; padding:20px; text-align:center; font-size:12px; color:#3d0079; border-top:1px solid #e9ecef;">
                    <p style="margin:0;">This code can only be used once and will expire automatically.</p>
                    <p style="margin:5px 0 0;">© 2025 Newzzy. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </body>
          </html>`,
    };

    // DEV MODE: skip actual email send
    log.warn("sendPasswordResetOtpEmail", "DEV MODE: skipping Brevo call, OTP is 123456", { toEmail });
    return { success: true, messageId: "dev-mock-id" };
  } catch (error) {
    log.error("sendPasswordResetOtpEmail", "Failed to send password reset OTP email", {
      toEmail,
      errorMessage: error.message,
      statusCode: error.status ?? error.statusCode ?? null,
      brevoResponse: error.response?.body ?? null,
    });
    return { success: false, error: error.message };
  }
};

// ─── Controllers ──────────────────────────────────────────────────────────────

const sendOTP = async (req, res) => {
  const fn = "sendOTP";
  log.info(fn, "Request received", { email: req.body.email });
  try {
    const { email } = req.body;
    if (!email) {
      log.warn(fn, "Missing email in request body");
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = generateOTP();
    const hash = generateHash(email, otp);

    otpStore.set(email, { otp, hash, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
    log.debug(fn, "OTP stored", { email, expiresIn: "5m", otpStoreSize: otpStore.size });

    const emailResult = await sendOtpEmail(email, otp);

    if (emailResult.success) {
      log.info(fn, "OTP flow completed successfully", { email });
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        hash,
        email: email.replace(/(.{3})(.*)(@.*)/, "$1***$3"),
      });
    } else {
      log.error(fn, "Email send failed", { email, error: emailResult.error });
      return res.status(500).json({ success: false, message: "Failed to send OTP email" });
    }
  } catch (error) {
    log.error(fn, "Unhandled exception", { errorMessage: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const verifyOTP = async (req, res) => {
  const fn = "verifyOTP";
  log.info(fn, "Request received", { email: req.body.email });
  try {
    const { email, otp, hash } = req.body;

    if (!email || !otp || !hash) {
      log.warn(fn, "Missing required fields", { hasEmail: !!email, hasOtp: !!otp, hasHash: !!hash });
      return res.status(400).json({ success: false, message: "Email, OTP, and hash are required" });
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      log.warn(fn, "No OTP found in store for email", { email, otpStoreSize: otpStore.size });
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    log.debug(fn, "OTP entry found", { email, attempts: storedData.attempts, expiresAt: new Date(storedData.expiresAt).toISOString() });

    if (Date.now() > storedData.expiresAt) {
      log.warn(fn, "OTP expired", { email, expiredAt: new Date(storedData.expiresAt).toISOString() });
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (storedData.attempts >= 3) {
      log.warn(fn, "Max OTP attempts reached", { email, attempts: storedData.attempts });
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }

    const expectedHash = generateHash(email, otp);
    if (hash !== expectedHash) {   // ← bug fix: compare against expectedHash
      log.warn(fn, "Hash mismatch", { email });
      return res.status(400).json({ success: false, message: "Invalid hash" });
    }

    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      log.warn(fn, "OTP mismatch", { email, attempts: storedData.attempts, attemptsLeft: 3 - storedData.attempts });
      return res.status(400).json({ success: false, message: "Invalid OTP", attemptsLeft: 3 - storedData.attempts });
    }

    otpStore.delete(email);
    log.info(fn, "OTP verified successfully", { email });
    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    log.error(fn, "Unhandled exception", { errorMessage: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const verifyCredentialsAndSendOTP = async (req, res) => {
  const fn = "verifyCredentialsAndSendOTP";
  log.info(fn, "Request received", { email: req.body.email });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      log.warn(fn, "Missing email or password");
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    log.debug(fn, "Looking up user in DB", { email });
    const user = await User.findOne({ email }).hint({ email: 1 });
    if (!user) {
      log.warn(fn, "User not found", { email });
      return res.status(404).json({ success: false, message: "Invalid credentials" });
    }

    log.debug(fn, "User found, comparing password", { email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      log.warn(fn, "Password mismatch", { email });
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const otp = generateOTP();
    const hash = generateHash(email, otp);
    otpStore.set(email, { otp, hash, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0, credentialsVerified: true });
    log.debug(fn, "OTP stored with credentialsVerified=true", { email });

    const emailResult = await sendOtpEmail(email, otp);
    if (emailResult.success) {
      log.info(fn, "Credentials verified and OTP sent", { email });
      return res.status(200).json({
        success: true,
        message: "Credentials verified. OTP sent successfully",
        hash,
        email: email.replace(/(.{3})(.*)(@.*)/, "$1***$3"),
      });
    } else {
      log.error(fn, "Email send failed after credential verification", { email, error: emailResult.error });
      return res.status(500).json({ success: false, message: "Failed to send OTP email" });
    }
  } catch (error) {
    log.error(fn, "Unhandled exception", { errorMessage: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const forgotPasswordSendOTP = async (req, res) => {
  const fn = "forgotPasswordSendOTP";
  log.info(fn, "Request received", { email: req.body.email });
  try {
    const { email } = req.body;

    if (!email) {
      log.warn(fn, "Missing email");
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    log.debug(fn, "Looking up user in DB", { email });
    const user = await User.findOne({ email }).hint({ email: 1 });
    if (!user) {
      log.warn(fn, "No account found for email", { email });
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    const otp = generateOTP();
    const hash = generateHash(email, otp);
    otpStore.set(email, { otp, hash, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0, type: "password_reset" });
    log.debug(fn, "Password reset OTP stored", { email, expiresIn: "10m" });

    const emailResult = await sendPasswordResetOtpEmail(email, otp);
    if (emailResult.success) {
      log.info(fn, "Password reset OTP sent", { email });
      return res.status(200).json({
        success: true,
        message: "Password reset OTP sent successfully",
        hash,
        email: email.replace(/(.{3})(.*)(@.*)/, "$1***$3"),
      });
    } else {
      log.error(fn, "Email send failed", { email, error: emailResult.error });
      return res.status(500).json({ success: false, message: "Failed to send password reset OTP email" });
    }
  } catch (error) {
    log.error(fn, "Unhandled exception", { errorMessage: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const verifyPasswordResetOTP = async (req, res) => {
  const fn = "verifyPasswordResetOTP";
  log.info(fn, "Request received", { email: req.body.email });
  try {
    const { email, otp, hash } = req.body;

    if (!email || !otp || !hash) {
      log.warn(fn, "Missing required fields", { hasEmail: !!email, hasOtp: !!otp, hasHash: !!hash });
      return res.status(400).json({ success: false, message: "Email, OTP, and hash are required" });
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      log.warn(fn, "No OTP found in store", { email });
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    log.debug(fn, "OTP entry found", { email, type: storedData.type, attempts: storedData.attempts });

    if (storedData.type !== "password_reset") {
      log.warn(fn, "OTP type mismatch", { email, actualType: storedData.type, expectedType: "password_reset" });
      return res.status(400).json({ success: false, message: "Invalid OTP type" });
    }

    if (Date.now() > storedData.expiresAt) {
      log.warn(fn, "OTP expired", { email });
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (storedData.attempts >= 3) {
      log.warn(fn, "Max attempts reached", { email });
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }

    const expectedHash = generateHash(email, otp);
    if (hash !== expectedHash) {   // ← bug fix: compare against expectedHash
      log.warn(fn, "Hash mismatch", { email });
      return res.status(400).json({ success: false, message: "Invalid hash" });
    }

    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      log.warn(fn, "OTP mismatch", { email, attempts: storedData.attempts });
      return res.status(400).json({ success: false, message: "Invalid OTP", attemptsLeft: 3 - storedData.attempts });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000;
    otpStore.set(`reset_${email}`, { token: resetToken, expiresAt: resetTokenExpiry, email });
    otpStore.delete(email);
    log.info(fn, "Password reset OTP verified, reset token issued", { email, resetTokenExpiresIn: "30m" });

    return res.status(200).json({ success: true, message: "OTP verified successfully", resetToken });
  } catch (error) {
    log.error(fn, "Unhandled exception", { errorMessage: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const fn = "resetPassword";
  log.info(fn, "Request received", { email: req.body.email });
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || !resetToken) {
      log.warn(fn, "Missing required fields", { hasEmail: !!email, hasPassword: !!newPassword, hasToken: !!resetToken });
      return res.status(400).json({ success: false, message: "Email, new password, and reset token are required" });
    }

    if (newPassword.length < 6) {
      log.warn(fn, "Password too short", { email, length: newPassword.length });
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const resetData = otpStore.get(`reset_${email}`);
    if (!resetData) {
      log.warn(fn, "No reset token found in store", { email });
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    if (Date.now() > resetData.expiresAt) {
      log.warn(fn, "Reset token expired", { email, expiredAt: new Date(resetData.expiresAt).toISOString() });
      otpStore.delete(`reset_${email}`);
      return res.status(400).json({ success: false, message: "Reset token expired" });
    }

    if (resetData.token !== resetToken || resetData.email !== email) {
      log.warn(fn, "Reset token mismatch", { email });
      return res.status(400).json({ success: false, message: "Invalid reset token" });
    }

    log.debug(fn, "Looking up user in DB", { email });
    const user = await User.findOne({ email }).hint({ email: 1 });
    if (!user) {
      log.warn(fn, "User not found during password reset", { email });
      return res.status(404).json({ success: false, message: "User not found" });
    }

    log.debug(fn, "Hashing new password", { email });
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(`reset_${email}`);
    log.info(fn, "Password reset successfully", { email });
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    log.error(fn, "Unhandled exception", { errorMessage: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Password Validation ──────────────────────────────────────────────────────
const validatePassword = (password) => {
  const validations = {
    minLength:      password.length >= 6,
    hasUppercase:   /[A-Z]/.test(password),
    hasLowercase:   /[a-z]/.test(password),
    hasNumber:      /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isValid = Object.values(validations).every(Boolean);
  return {
    isValid,
    validations,
    errors: [
      !validations.minLength      && "Password must be at least 6 characters long",
      !validations.hasUppercase   && "Password must contain at least one uppercase letter",
      !validations.hasLowercase   && "Password must contain at least one lowercase letter",
      !validations.hasNumber      && "Password must contain at least one number",
      !validations.hasSpecialChar && "Password must contain at least one special character",
    ].filter(Boolean),
  };
};

// ─── OTP Store Cleanup ────────────────────────────────────────────────────────
const clearExpiredOTPs = () => {
  const now = Date.now();
  let cleared = 0;
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
      cleared++;
    }
  }
  if (cleared > 0) {
    log.info("clearExpiredOTPs", "Cleared expired OTP entries", { cleared, remaining: otpStore.size });
  }
};

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
