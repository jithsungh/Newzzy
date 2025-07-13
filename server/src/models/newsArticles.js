const mongoose = require("mongoose");

const newsArticleSchema = new mongoose.Schema(
  {
    article_id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    preprocessedContent: String,
    keywords: [String],
    creator: [String],
    description: {
      type: String,
    },
    // content: {
    //     type: String
    // },
    pubDate: {
      type: Date,
      required: true,
    },
    image_url: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    source_id: String,
    source_name: String,
    source_url: String,
    source_icon: String,
    language: String,
    country: [String],
    category: [String],
  },
  {
    timestamps: true,
  }
);

// Performance indexes for common query patterns
// Unique index for article identification
newsArticleSchema.index({ article_id: 1 }, { unique: true });

// Index for trending articles (sorted by likes desc, then by pubDate)
newsArticleSchema.index({ likes: -1, pubDate: -1 });

// Index for latest articles query (most common pattern) - using pubDate
newsArticleSchema.index({ pubDate: -1 });

// Index for keyword-based searches - using pubDate for sorting
newsArticleSchema.index({ keywords: 1, pubDate: -1 });

// Index for category-based filtering - using pubDate for sorting
newsArticleSchema.index({ category: 1, pubDate: -1 });

// Index for source-based queries - using pubDate for sorting
newsArticleSchema.index({ source_id: 1, pubDate: -1 });

// Keep createdAt index for internal operations
newsArticleSchema.index({ createdAt: -1 });

// Text index for full-text search capabilities
newsArticleSchema.index(
  {
    title: "text",
    description: "text",
    keywords: "text",
  },
  {
    weights: {
      title: 10,
      description: 5,
      keywords: 8,
    },
  }
);

// Index for country-based filtering - using pubDate for sorting
newsArticleSchema.index({ country: 1, pubDate: -1 });

// Index for language-based filtering - using pubDate for sorting
newsArticleSchema.index({ language: 1, pubDate: -1 });

// Index for link-based deduplication (sparse to handle missing links)
newsArticleSchema.index({ link: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("NewsArticle", newsArticleSchema);
