// Simple test script to test OTP functionality
const crypto = require("crypto");

// Test OTP generation
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Test hash generation (same as in otpController.js)
const generateHash = (email, otp) => {
  return crypto
    .createHash("sha256")
    .update(`${email}:${otp}:test_secret`)
    .digest("hex");
};

// Test the functions
console.log("Testing OTP System...");

const testEmail = "test@example.com";
const testOTP = generateOTP();
const testHash = generateHash(testEmail, testOTP);

console.log("Generated OTP:", testOTP);
console.log("Generated Hash:", testHash);

// Verify hash
const verifyHash = generateHash(testEmail, testOTP);
console.log("Hash Match:", testHash === verifyHash);

console.log("OTP System test completed successfully!");
