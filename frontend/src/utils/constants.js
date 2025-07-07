// Default profile picture URL
export const DEFAULT_PROFILE_URL =
  "https://res.cloudinary.com/dwhf3iqim/image/upload/v1749574300/def-profile_jersqr.png";

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: "dwhf3iqim",
  UPLOAD_PRESET: "Newzzy",
};

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
};
