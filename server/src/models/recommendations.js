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
recommendationSchema.index({ user_id: 1, status: 1 });
recommendationSchema.index({ user_id: 1, score: -1 });
recommendationSchema.index({ user_id: 1, createdAt: -1 });
// Note: unique_id index is automatically created due to unique: true in schema
recommendationSchema.index({ status: 1, createdAt: 1 }); // For cleanup operations

// TTL index for automatic cleanup of old recommendations (45 days)
recommendationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3888000 }); // 45 days

// Compound index for the main query pattern
recommendationSchema.index({
  user_id: 1,
  status: 1,
  score: -1,
  createdAt: -1,
});

// Index for analytics queries
recommendationSchema.index({ source: 1, recommendationQuality: 1 });

module.exports = mongoose.model("Recommendation", recommendationSchema);
