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
    REFRESH_TOKEN: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
