import React from "react";
import { RefreshCcw, Trash2Icon } from "lucide-react";
import { useAuth } from "../../context/authContext";
import useDataContext from "../../hooks/useDataContext";
import { resetInterests, deleteAccount } from "../../api/profile";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ActionCard = () => {
  const { user, setLogin, setLogout } = useAuth();
  const navigate = useNavigate();

  const handleResetInterests = async () => {
    try {
      const confirmReset = window.confirm(
        "Are you sure you want to reset all your interests? This will clear your current preferences and you'll need to set them up again."
      );
      if (!confirmReset) return;

      const loadingToast = toast.loading("Resetting interests...");
      const response = await resetInterests(setLogin);
      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("Interests reset successfully!");
        navigate("/preferences", { state: { fromReset: true } });
      } else {
        toast.error("Failed to reset interests. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting interests:", error);
      toast.error("Failed to reset interests. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data."
      );
      if (!confirmDelete) return;

      const loadingToast = toast.loading("Deleting account...");
      const response = await deleteAccount(setLogout);
      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("Account deleted successfully!");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="rounded-lg border bg-neutral shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Account Actions
        </h3>
      </div>
      <div className="p-6 pt-0 space-y-3">
        <button
          onClick={handleResetInterests}
          className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-base-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-base-100 h-10 px-4 py-2 w-full flex items-center space-x-2"
        >
          <RefreshCcw className="text-orange-700" />
          <span>Reset All Interests</span>
        </button>
        <button
          onClick={handleDeleteAccount}
          className="justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-base-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-base-100 h-10 px-4 py-2 w-full flex items-center space-x-2"
        >
          <Trash2Icon className="text-red-500" />
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
};

export default ActionCard;
