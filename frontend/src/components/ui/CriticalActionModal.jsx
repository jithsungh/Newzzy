import React, { useState, useEffect } from "react";
import { X, AlertTriangle, UserX, Eye, EyeOff, Shield } from "lucide-react";

const CriticalActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  requirePasswordConfirmation = false,
  expectedConfirmText = "",
  userEmail = "",
}) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Warning, 2: Confirmation

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  const isConfirmationValid = () => {
    if (step === 1) return true;
    if (expectedConfirmText && confirmationText !== expectedConfirmText) return false;
    if (requirePasswordConfirmation && !password) return false;
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onConfirm(password);
    }
  };

  const handleClose = () => {
    setStep(1);
    setConfirmationText("");
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in-0"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-[90%] max-w-lg bg-base-100 rounded-2xl shadow-2xl border border-error/20 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-error/10 bg-error/5 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-error/20 border border-error/30 transition-all duration-200 animate-pulse">
              <UserX className="w-6 h-6 text-error animate-in zoom-in-50 duration-500" />
            </div>
            <div className="animate-in slide-in-from-left-4 duration-500 delay-150">
              <h3 className="text-xl font-bold text-error">{title}</h3>
              <p className="text-sm text-error/70">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="btn btn-ghost btn-sm btn-square hover:bg-error/10 disabled:opacity-50 transition-all duration-200 hover:rotate-90 animate-in fade-in-0 delay-300"
          >
            <X className="w-5 h-5 text-error" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          {step === 1 ? (
            <>
              {/* Step 1: Warning */}
              <div className="space-y-4">
                <p className="text-base text-base-content/80 leading-relaxed animate-in fade-in-0 duration-700 delay-400">
                  {description}
                </p>
                
                <div className="p-4 rounded-lg bg-error/10 border border-error/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-error/80">
                      <p className="font-medium mb-2">This action will permanently:</p>
                      <ul className="list-disc list-inside space-y-1 text-error/70">
                        <li>Delete all your saved articles and preferences</li>
                        <li>Remove your activity history and recommendations</li>
                        <li>Cancel any active subscriptions</li>
                        <li>Erase all personal data from our servers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                    <p className="text-sm text-warning/80">
                      <strong>Important:</strong> This action cannot be undone. Please make sure you have backed up any important data.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Confirmation */}
              <div className="space-y-4">
                <p className="text-base text-base-content/80 mb-4">
                  To confirm account deletion, please complete the verification below:
                </p>

                {expectedConfirmText && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content/70">
                      Type <span className="font-mono bg-neutral px-1 rounded text-error">{expectedConfirmText}</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={`Type "${expectedConfirmText}" here`}
                      className="w-full input input-bordered bg-neutral focus:border-error"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {requirePasswordConfirmation && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content/70">
                      Enter your password to confirm:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full input input-bordered bg-neutral pr-12 focus:border-error"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-error/5 border border-error/10">
                  <p className="text-sm text-error/70">
                    Account for <strong>{userEmail}</strong> will be permanently deleted.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
            <button
              onClick={step === 1 ? handleClose : () => setStep(1)}
              disabled={isLoading}
              className="btn btn-ghost flex-1 h-11 disabled:opacity-50 transition-all duration-200 hover:bg-neutral"
            >
              {step === 1 ? cancelText : "Back"}
            </button>
            <button
              onClick={handleNext}
              disabled={isLoading || !isConfirmationValid()}
              className="btn btn-error flex-1 h-11 text-white font-semibold disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="loading loading-spinner loading-sm"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  {step === 1 ? "Continue" : confirmText}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-error' : 'bg-error/20'}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-error' : 'bg-error/20'}`} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-base-content/50">
            <span>Warning</span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalActionModal;
