import React, { useState } from "react";
import { RefreshCcw, Trash2Icon, RotateCcw, UserX } from "lucide-react";
import { useAuth } from "../../context/authContext";
import useDataContext from "../../hooks/useDataContext";
import { resetInterests, deleteAccount } from "../../api/profile";
import { toastManager } from "../../utils/toastManager";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../ui/ConfirmationModal";
import CriticalActionModal from "../ui/CriticalActionModal";
import LoadingSpinner from "../ui/LoadingSpinner";

const ActionCard = () => {
  const { user, setLogin, setLogout } = useAuth();
  const { setRecommendations } = useDataContext();
  const navigate = useNavigate();

  // Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetInterests = async () => {
    setIsLoading(true);
    try {
      const response = await resetInterests(setLogin);

      if (response.success) {
        toastManager.success("Interests reset successfully!");
        setRecommendations([]);
        setShowResetModal(false);
        navigate("/preferences", { state: { fromReset: true } });
      } else {
        toastManager.error("Failed to reset interests. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting interests:", error);
      toastManager.error("Failed to reset interests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (password = null) => {
    setIsLoading(true);
    try {
      const response = await deleteAccount(setLogout);

      if (response.success) {
        toastManager.success("Account deleted successfully!");
        setShowDeleteModal(false);
        // The setLogout will redirect the user to login page
      } else {
        toastManager.error("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toastManager.error("Failed to delete account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-neutral shadow-sm mb-6">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            Account Actions
          </h3>
          <p className="text-sm text-base-content/70">
            Manage your account preferences and data
          </p>
        </div>
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={() => setShowResetModal(true)}
            className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-base-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-base-100 h-10 px-4 py-2 w-full flex items-center space-x-2 group hover:border-warning/50 hover:shadow-md hover:scale-105 active:scale-95"
          >
            <RotateCcw className="text-warning group-hover:text-warning-focus transition-all duration-200 group-hover:rotate-180" />
            <span className="group-hover:font-semibold transition-all duration-200">
              Reset All Interests
            </span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-base-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-base-100 h-10 px-4 py-2 w-full flex items-center space-x-2 group hover:border-error/50 hover:shadow-md hover:scale-105 active:scale-95"
          >
            <UserX className="text-error group-hover:text-error-focus transition-all duration-200 group-hover:scale-110" />
            <span className="group-hover:font-semibold transition-all duration-200">
              Delete Account
            </span>
          </button>
        </div>
      </div>

      {/* Reset Interests Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetInterests}
        title="Reset Interests"
        description="Are you sure you want to reset all your interests? This will clear your current preferences and redirect you to set them up again."
        confirmText="Reset Interests"
        cancelText="Keep Current"
        type="warning"
        icon={RotateCcw}
        isLoading={isLoading}
        details="You will be redirected to the preferences page to select new interests after confirmation."
      />

      {/* Delete Account Confirmation Modal */}
      <CriticalActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="You are about to permanently delete your Newzzy account. This action will completely remove all your data and cannot be reversed."
        confirmText="Delete My Account"
        cancelText="Cancel"
        isLoading={isLoading}
        requirePasswordConfirmation={false}
        expectedConfirmText="DELETE"
        userEmail={user?.email || ""}
      />
    </>
  );
};

export default ActionCard;
