// ProfileImageUploader.tsx
import { useRef, useState, useEffect } from "react";
import { ImageIcon, Camera, X, Trash2 } from "lucide-react";
import { uploadToCloudinary } from "../utils/cloudinary";
import { updateProfilePicture } from "../api/profile";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useAuth } from "../context/authContext";
import { DEFAULT_PROFILE_URL, FILE_UPLOAD_LIMITS } from "../utils/constants";
import toast from "react-hot-toast";

export const ProfileImageUploader = ({ onImageUpload, defaultUrl }) => {
  const { setLogin } = useAuth();
  const inputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(defaultUrl || DEFAULT_PROFILE_URL);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync previewUrl when defaultUrl changes (important for coordination with ProfileCard)
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(defaultUrl || DEFAULT_PROFILE_URL);
    }
  }, [defaultUrl, imageFile]);

  const handleSelectFile = (file) => {
    setErrorMessage(null);
    const isValidImage = file.type.startsWith("image/");
    const maxSize = FILE_UPLOAD_LIMITS.MAX_SIZE;

    if (!isValidImage) {
      toast.error("Only image files are supported.");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Max file size is 5MB.");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleSelectFile(file);
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + Math.random() * 10;
        if (next >= 90) {
          clearInterval(interval);
          return 90;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    setIsUploading(true);
    const clearProgress = simulateProgress();

    try {
      // Upload to Cloudinary
      const url = await uploadToCloudinary(imageFile, "profile_pictures");
      clearProgress();
      setUploadProgress(100);
      
      // Update profile picture in backend
      const result = await updateProfilePicture(url, setLogin);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success("Profile picture updated successfully!");
      onImageUpload(url); // Pass uploaded URL back to parent
      
      // Reset the component state
      setImageFile(null);
      setPreviewUrl(url);
      setUploadProgress(0);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadProgress(0);
      setErrorMessage(err.message || "Upload failed");
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setImageFile(null);
    setPreviewUrl(defaultUrl || DEFAULT_PROFILE_URL);
    setUploadProgress(0);
    setErrorMessage(null);
  };

  const handleRemoveProfilePicture = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    
    try {
      // Update profile picture to default URL in backend
      const result = await updateProfilePicture(DEFAULT_PROFILE_URL, setLogin);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success("Profile picture removed successfully!");
      onImageUpload(DEFAULT_PROFILE_URL); // Pass default URL back to parent
      
      // Reset the component state
      setImageFile(null);
      setPreviewUrl(DEFAULT_PROFILE_URL);
      setUploadProgress(0);
    } catch (err) {
      console.error("Remove profile picture error:", err);
      setErrorMessage(err.message || "Failed to remove profile picture");
      toast.error(err.message || "Failed to remove profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <div className="relative group">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-28 w-28 rounded-full object-cover ring-2 ring-primary"
            />
          ) : (
            <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {!isUploading && (
            <button
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-neutral p-1 rounded-full hover:bg-primary/80 transition"
              aria-label="Change profile"
            >
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>

        {imageFile && !isUploading && (
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleUpload} className="bg-primary text-neutral hover:bg-primary/80">
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-destructive border-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}

        {!imageFile && !isUploading && previewUrl !== DEFAULT_PROFILE_URL && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveProfilePicture}
              className="text-destructive border-destructive text-primary hover:bg-primary hover:text-neutral"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Picture
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="w-full max-w-sm space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {uploadProgress === 0 ? "Processing..." : `Uploading... ${Math.round(uploadProgress)}%`}
            </p>
          </div>
        )}

        {errorMessage && (
          <p className="text-sm text-red-500 text-center">{errorMessage}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
