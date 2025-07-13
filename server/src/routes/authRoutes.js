const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const otpController = require("../controllers/otpController");

router.post("/signup", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);

// OTP routes
router.post("/send-otp", otpController.sendOTP);
router.post(
  "/verify-credentials-send-otp",
  otpController.verifyCredentialsAndSendOTP
);
router.post("/verify-otp", otpController.verifyOTP);

// Password reset routes
router.post("/forgot-password", otpController.forgotPasswordSendOTP);
router.post("/verify-password-reset-otp", otpController.verifyPasswordResetOTP);
router.post("/reset-password", otpController.resetPassword);

module.exports = router;
