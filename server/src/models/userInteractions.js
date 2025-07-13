const mongoose = require("mongoose");
const userInteractionSchema = new mongoose.Schema(
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

    action: {
      type: String,
      enum: ["like", "dislike", "share", "save"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to prevent duplicate interactions
userInteractionSchema.index(
  { user_id: 1, article_id: 1, action: 1 },
  { unique: true }
);

// Additional performance indexes for common query patterns
// Index for getting user's interactions by action type (e.g., saved articles)
userInteractionSchema.index(
  { user_id: 1, action: 1, createdAt: -1 },
  { name: "user_action_date" }
);

// Index for getting all interactions for a specific user ordered by date
userInteractionSchema.index(
  { user_id: 1, createdAt: -1 },
  { name: "user_interactions_chronological" }
);

// Index for article analytics - how many likes/saves/shares an article has
userInteractionSchema.index(
  { article_id: 1, action: 1, createdAt: -1 },
  { name: "article_popularity_analytics" }
);

// Index for action-based queries across all users
userInteractionSchema.index(
  { action: 1, createdAt: -1 },
  { name: "global_action_analytics" }
);

module.exports = mongoose.model("UserInteraction", userInteractionSchema);
