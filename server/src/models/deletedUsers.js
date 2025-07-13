const mongoose = require("mongoose");

const deletedUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
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
    REFRESH_TOKEN: String,
  },
  {
    timestamps: true,
  }
);

// Performance indexes for deleted users collection
// Index for email lookups (to prevent re-registration)
deletedUserSchema.index({ email: 1 });

// Index for cleanup operations based on deletion date
deletedUserSchema.index({ deletedAt: 1 });

// TTL index for automatic cleanup after certain period (e.g., 2 years)
deletedUserSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 63072000 } // 2 years in seconds
);

module.exports = mongoose.model("DeletedUser", deletedUserSchema);
