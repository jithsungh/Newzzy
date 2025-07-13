import React from "react";
import { Check, X, Shield } from "lucide-react";

const PasswordValidatorPopup = ({
  password,
  confirmPassword,
  showConfirmMatch = false,
  isOpen,
  onClose,
  position = { top: 0, left: 100 },
  isSticky = false, // New prop to control if popup stays open
}) => {
  if (!isOpen) return null;

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
    if (progressPercentage === 100) return "text-green-600";
    if (progressPercentage >= 80) return "text-yellow-600";
    if (progressPercentage >= 60) return "text-blue-600";
    if (progressPercentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    if (progressPercentage === 100) return "bg-green-500";
    if (progressPercentage >= 80) return "bg-yellow-500";
    if (progressPercentage >= 60) return "bg-blue-500";
    if (progressPercentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthText = () => {
    if (progressPercentage === 100) return "Strong";
    if (progressPercentage >= 80) return "Good";
    if (progressPercentage >= 60) return "Fair";
    if (progressPercentage >= 40) return "Weak";
    return "Very Weak";
  };

  return (
    <>
      {/* Popup - positioned as true overlay without affecting main layout */}
      <div
        className={`fixed bg-white rounded-lg shadow-xl border border-gray-200 p-4 
          ${
            isSticky
              ? "z-50 w-80 left-4 top-1/2 transform -translate-y-1/2 hidden md:block"
              : "z-50 w-80"
          }`}
        style={
          isSticky
            ? {}
            : {
                top: position.top + 10,
                left: Math.max(
                  10,
                  Math.min(position.left, window.innerWidth - 330)
                ),
              }
        }
      >
        {/* Desktop content */}
        <div className={isSticky ? "block" : "block"}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">
                Password Requirements
              </h3>
            </div>
            {!isSticky && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Strength</span>
              <span className={`text-sm font-medium ${getStrengthColor()}`}>
                {getStrengthText()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Requirements List */}
          <div className="space-y-2">
            {validations.map((validation, index) => (
              <div key={index} className="flex items-center gap-2">
                {validation.isValid ? (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    validation.isValid
                      ? "text-green-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {validation.label}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              All requirements must be met for a strong password
            </p>
          </div>
        </div>
      </div>

      {/* Mobile version - compact popup at top */}
      {isSticky && (
        <div className="md:hidden fixed top-4 left-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">
                Requirements
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            {validations.map((validation, index) => (
              <div key={index} className="flex items-center gap-1">
                {validation.isValid ? (
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-red-500 flex-shrink-0" />
                )}
                <span
                  className={`${
                    validation.isValid
                      ? "text-green-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {validation.label.split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PasswordValidatorPopup;
