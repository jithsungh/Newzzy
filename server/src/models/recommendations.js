const mongoose = require("mongoose");
const recommendationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    article_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsArticle",
      required: true,
    },
    unique_id: {
      type: String,
      required: true,
      unique: true,
    },
    score: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Recommendation", recommendationSchema);
