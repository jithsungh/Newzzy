const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile_url: {
      type: String,
      default:
        "https://res.cloudinary.com/dwhf3iqim/image/upload/v1749574300/def-profile_jersqr.png",
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    interests: {
      type: Map,
      of: Number,
      default: {},
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    REFRESH_TOKEN: String,
  },
  {
    timestamps: true,
  }
);

// Performance indexes for common query patterns
// Unique index for email-based authentication
userSchema.index({ email: 1 }, { unique: true });

// Index for refresh token validation (sparse since not all users may have refresh tokens)
userSchema.index({ REFRESH_TOKEN: 1 }, { sparse: true });

// Index for user activity tracking and streak management
userSchema.index({ lastActiveDate: -1, streak: -1 });

// Index for theme-based queries (if needed for analytics)
userSchema.index({ theme: 1 });

module.exports = mongoose.model("User", userSchema);
