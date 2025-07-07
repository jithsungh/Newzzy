import toast from 'react-hot-toast';
import { CLOUDINARY_CONFIG } from './constants';

const { CLOUD_NAME, UPLOAD_PRESET } = CLOUDINARY_CONFIG;

export const uploadToCloudinary = async (file, folder = "profiles") => {
  // Don't create toast here since ProfileImageUploader handles progress
  console.log(`Starting upload of "${file.name}" to Cloudinary...`);

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    if (!response.ok) {
      let message = "Cloudinary upload failed";

      switch (response.status) {
        case 400:
          message = "Bad request: Check upload preset or file format.";
          break;
        case 401:
          message = "Unauthorized: Check your cloud name or preset.";
          break;
        case 404:
          message = "Not found: Invalid Cloudinary endpoint.";
          break;
        case 413:
          message = "File too large: Cloudinary limit exceeded.";
          break;
        default:
          message = `Upload failed: ${response.status}`;
          break;
      }

      console.error("Cloudinary upload failed:", message, responseText);
      throw new Error(`${message}\n${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (!data.secure_url) {
      console.error("Upload succeeded, but no URL returned!");
      throw new Error("Missing secure_url in Cloudinary response");
    }

    console.log("Cloudinary upload successful:", data.secure_url);
    return data.secure_url;

  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error during upload.";
    console.error("Cloudinary Upload Error:", err);

    throw new Error(errorMessage);
  }
};

export const getCloudinaryPublicId = (url) => {
  const regex = /\/v\d+\/([^/]+)\.\w+$/;
  const match = url.match(regex);
  return match ? match[1] : "";
};
