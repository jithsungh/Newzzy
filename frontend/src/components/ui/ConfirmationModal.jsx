import React, { useEffect } from "react";
import {
  X,
  AlertTriangle,
  Trash2,
  RefreshCcw,
  Shield,
  CheckCircle,
} from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default", // "default", "danger", "warning", "success"
  icon,
  isLoading = false,
  details = null,
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
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
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-error/10",
          iconColor: "text-error",
          confirmBtn: "btn-error",
          borderColor: "border-error/20",
          headerBg: "bg-error/5",
        };
      case "warning":
        return {
          iconBg: "bg-warning/10",
          iconColor: "text-warning",
          confirmBtn: "btn-warning",
          borderColor: "border-warning/20",
          headerBg: "bg-warning/5",
        };
      case "success":
        return {
          iconBg: "bg-success/10",
          iconColor: "text-success",
          confirmBtn: "btn-success",
          borderColor: "border-success/20",
          headerBg: "bg-success/5",
        };
      default:
        return {
          iconBg: "bg-info/10",
          iconColor: "text-info",
          confirmBtn: "btn-primary",
          borderColor: "border-info/20",
          headerBg: "bg-info/5",
        };
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case "danger":
        return Trash2;
      case "warning":
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  const styles = getTypeStyles();
  const IconComponent = icon || getDefaultIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[90%] max-w-md bg-base-100 rounded-2xl shadow-2xl border border-neutral transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-neutral ${styles.headerBg} rounded-t-2xl`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg} ${styles.borderColor} border transition-all duration-200 animate-pulse`}
            >
              <IconComponent
                className={`w-6 h-6 ${styles.iconColor} animate-in zoom-in-50 duration-500`}
              />
            </div>
            <div className="animate-in slide-in-from-left-4 duration-500 delay-150">
              <h3 className="text-xl font-bold text-primary">{title}</h3>
              <p className="text-sm text-base-content/60">
                Confirmation required
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-ghost btn-sm btn-square hover:bg-neutral disabled:opacity-50 transition-all duration-200 hover:rotate-90 animate-in fade-in-0 delay-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <p className="text-base text-base-content/80 mb-4 leading-relaxed animate-in fade-in-0 duration-700 delay-400">
            {description}
          </p>

          {details && (
            <div
              className={`p-4 rounded-lg ${styles.iconBg} ${styles.borderColor} border mb-4 transition-all duration-200`}
            >
              <div className="flex items-start gap-3">
                <CheckCircle
                  className={`w-5 h-5 ${styles.iconColor} mt-0.5 flex-shrink-0`}
                />
                <div className="text-sm text-base-content/70">{details}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-ghost flex-1 h-11 disabled:opacity-50 transition-all duration-200 hover:bg-neutral"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`btn ${styles.confirmBtn} flex-1 h-11 text-white font-semibold disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="loading loading-spinner loading-sm"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  {confirmText}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        {type === "danger" && (
          <div className="px-6 pb-6">
            <div className="flex items-start gap-3 p-3 bg-error/5 rounded-lg border border-error/10">
              <AlertTriangle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
              <div className="text-sm text-error/80">
                <p className="font-medium mb-1">This action cannot be undone</p>
                <p>
                  Please make sure you understand the consequences before
                  proceeding.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationModal;
