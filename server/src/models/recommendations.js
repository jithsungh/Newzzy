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
      min: 0,
      max: 1000, // Set reasonable bounds for scores
    },
    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
    readAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ["primary_interests", "secondary_interests", "fallback", "random"],
      default: "primary_interests",
    },
    category: {
      type: String,
      default: "general",
    },
    // Track which interests matched for analytics
    matchedInterests: {
      type: [String],
      default: [],
    },
    // Track the recommendation quality at time of generation
    recommendationQuality: {
      type: String,
      enum: ["optimal", "limited", "fallback"],
      default: "optimal",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance

// Core user-based queries
recommendationSchema.index({ user_id: 1, status: 1 });
recommendationSchema.index({ user_id: 1, score: -1 });
recommendationSchema.index({ user_id: 1, createdAt: -1 });

// Main query pattern: get user's new recommendations sorted by score
recommendationSchema.index({
  user_id: 1,
  status: 1,
  score: -1,
  createdAt: -1,
});

// Index for finding specific user-article recommendations (markAsRead function)
recommendationSchema.index({ user_id: 1, article_id: 1 });

// Index for user-article-status queries (prevents duplicates and faster lookups)
recommendationSchema.index({ user_id: 1, article_id: 1, status: 1 });

// Index for article-based queries (which users have this article recommended)
recommendationSchema.index({ article_id: 1, status: 1 });

// Index for cleanup operations and batch processing
recommendationSchema.index({ status: 1, createdAt: 1 });

// Index for finding recommendations by read status and time
recommendationSchema.index({ status: 1, readAt: 1 });

// TTL index for automatic cleanup of old recommendations (45 days)
recommendationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3888000 }); // 45 days

// Analytics and reporting indexes
recommendationSchema.index({ source: 1, recommendationQuality: 1 });
recommendationSchema.index({ recommendationQuality: 1, createdAt: -1 });
recommendationSchema.index({ source: 1, createdAt: -1 });

// Index for category-based analytics
recommendationSchema.index({ category: 1, status: 1 });
recommendationSchema.index({ user_id: 1, category: 1, status: 1 });

// Index for recommendation score analysis
recommendationSchema.index({ score: -1, status: 1 });

// Index for tracking matched interests analytics
recommendationSchema.index({ matchedInterests: 1 }, { sparse: true });

// Index for user activity analysis (when users read recommendations)
recommendationSchema.index({ user_id: 1, readAt: -1 }, { sparse: true });

// Compound index for advanced analytics (source + quality + user)
recommendationSchema.index({
  user_id: 1,
  source: 1,
  recommendationQuality: 1,
  status: 1,
});

// Index for finding high-quality recommendations
recommendationSchema.index({
  recommendationQuality: 1,
  score: -1,
  status: 1,
});

// Note: unique_id index is automatically created due to unique: true in schema

module.exports = mongoose.model("Recommendation", recommendationSchema);
