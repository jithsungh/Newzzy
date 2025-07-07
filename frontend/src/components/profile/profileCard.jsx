import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Pencil, Save, X } from "lucide-react";
import { editName, changeEmail } from "../../api/profile.js";
import { useAuth } from "../../context/authContext.jsx";
import { ProfileImageUploader } from "../ProfileImageUploader.jsx";
import { DEFAULT_PROFILE_URL } from "../../utils/constants.js";

const ProfileCard = ({ user }) => {
  const { setLogin } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [currentProfileUrl, setCurrentProfileUrl] = useState(
    user.profile_url || DEFAULT_PROFILE_URL
  );
 

  const [prevData, setPrevData] = useState({
    name: user.name,
    email: user.email,
  });

  // Update all user-related states when user prop changes
  useEffect(() => {
    setCurrentProfileUrl(user.profile_url || DEFAULT_PROFILE_URL);
    setEditedName(user.name);
    setEditedEmail(user.email);
    setPrevData({
      name: user.name,
      email: user.email,
    });
  }, [user]);

  const handleEditClick = () => {
    setPrevData({ name: editedName, email: editedEmail });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(prevData.name);
    setEditedEmail(prevData.email);
  };

  const handleImageUpload = (newImageUrl) => {
    setCurrentProfileUrl(newImageUrl);
    setIsEditingImage(false);
  };

  const handleSave = async () => {
    setIsEditing(false);

    const nameChanged = editedName !== prevData.name;
    const emailChanged = editedEmail !== prevData.email;

    try {
      if (nameChanged) {
        const res = await editName(editedName, setLogin);
        if (!res.success) throw new Error(res.error);
      }
      if (emailChanged) {
        const res = await changeEmail(editedEmail, setLogin);
        if (!res.success) throw new Error(res.error);
      }
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.");
      setEditedName(prevData.name);
      setEditedEmail(prevData.email);
    }
  };

  return (
    <div className="rounded-lg border bg-neutral shadow-sm text-primary">
      <div className="space-y-1.5 p-6 flex flex-row items-center justify-between">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">
          Profile Information
        </h2>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-primary hover:text-neutral hover:text-accent-foreground h-9 rounded-md px-3 text-black-600"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-primary hover:text-neutral hover:text-accent-foreground h-9 rounded-md px-3 text-black-600"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-primary hover:text-neutral hover:text-accent-foreground h-9 rounded-md px-3 text-black-600"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="p-6 pt-0">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            {isEditingImage ? (
              <ProfileImageUploader
                onImageUpload={handleImageUpload}
                defaultUrl={currentProfileUrl}
              />
            ) : (
              <div className="relative group">
                <img
                  src={currentProfileUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover cursor-pointer"
                />
                <button
                  onClick={() => setIsEditingImage(true)}
                  className="absolute inset-0 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
            )}
            {isEditingImage && (
              <button
                onClick={() => setIsEditingImage(false)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <h3 className="text-xl font-semibold text-primary">{editedName}</h3>
            <p>{editedEmail}</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-secondary mb-1">
            Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-3 py-2 border rounded text-gray-900"
            />
          ) : (
            <p>{editedName}</p>
          )}

          <label className="block text-sm font-medium text-secondary mb-1">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded text-gray-900"
            />
          ) : (
            <p>{editedEmail}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
