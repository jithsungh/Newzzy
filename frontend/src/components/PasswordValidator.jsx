import React from "react";
import { Check, X } from "lucide-react";

const PasswordValidator = ({
  password,
  confirmPassword,
  showConfirmMatch = false,
}) => {
  const validations = [
    {
      label: "At least 6 characters",
      isValid: password.length >= 6,
      test: (pwd) => pwd.length >= 6,
    },
    {
      label: "One uppercase letter (A-Z)",
      isValid: /[A-Z]/.test(password),
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      label: "One lowercase letter (a-z)",
      isValid: /[a-z]/.test(password),
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      label: "One number (0-9)",
      isValid: /\d/.test(password),
      test: (pwd) => /\d/.test(pwd),
    },
    {
      label: "One special character (!@#$%^&*)",
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  if (showConfirmMatch && confirmPassword !== undefined) {
    validations.push({
      label: "Passwords match",
      isValid: password === confirmPassword && password.length > 0,
      test: () => password === confirmPassword && password.length > 0,
    });
  }

  const validCount = validations.filter((v) => v.isValid).length;
  const totalCount = validations.length;
  const progressPercentage = (validCount / totalCount) * 100;

  const getStrengthColor = () => {
    if (progressPercentage === 100) return "success";
    if (progressPercentage >= 80) return "warning";
    if (progressPercentage >= 60) return "info";
    if (progressPercentage >= 40) return "accent";
    return "error";
  };

  const getStrengthText = () => {
    if (progressPercentage === 100) return "Very Strong";
    if (progressPercentage >= 80) return "Strong";
    if (progressPercentage >= 60) return "Good";
    if (progressPercentage >= 40) return "Fair";
    return "Weak";
  };

  return (
    <div className="w-full">
      {/* Password Strength Indicator */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-base-content/70">
            Password Strength
          </span>
          <span className={`text-sm font-bold text-${getStrengthColor()}`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-neutral rounded-full h-2">
          <div
            className={`bg-${getStrengthColor()} h-2 rounded-full transition-all duration-300 ease-in-out`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Validation Rules */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-base-content/70 mb-2">
          Password must contain:
        </p>
        {validations.map((validation, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                validation.isValid
                  ? "bg-success text-white"
                  : "bg-base-300 text-base-content/50"
              }`}
            >
              {validation.isValid ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
            </div>
            <span
              className={`text-sm ${
                validation.isValid
                  ? "text-success font-medium"
                  : "text-base-content/70"
              }`}
            >
              {validation.label}
            </span>
          </div>
        ))}
      </div>

      {/* Overall Status */}
      {password.length > 0 && (
        <div
          className={`mt-3 p-3 rounded-lg border ${
            progressPercentage === 100
              ? "bg-success/10 border-success/20 text-success"
              : "bg-warning/10 border-warning/20 text-warning"
          }`}
        >
          <p className="text-sm font-medium">
            {progressPercentage === 100
              ? "✅ Password meets all requirements!"
              : `⚠️ ${totalCount - validCount} requirement${
                  totalCount - validCount !== 1 ? "s" : ""
                } remaining`}
          </p>
        </div>
      )}
    </div>
  );
};

// Utility function to validate password
export const validatePassword = (password) => {
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
    strength: Object.values(validations).filter(Boolean).length,
  };
};

export default PasswordValidator;
