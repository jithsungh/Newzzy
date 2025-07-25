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

// Index for trending articles (sorted by pubDate desc, then by likes desc)
// This matches the query pattern: .sort({ pubDate: -1, likes: -1 })
newsArticleSchema.index({ pubDate: -1, likes: -1 });

// Index for latest articles query (most common pattern) - using pubDate
newsArticleSchema.index({ pubDate: -1 });

// Index for keyword-based searches - using pubDate for sorting
newsArticleSchema.index({ keywords: 1, pubDate: -1 });

// Index for category-based filtering - using pubDate for sorting
newsArticleSchema.index({ category: 1, pubDate: -1 });

// Index for source-based queries - using pubDate for sorting
newsArticleSchema.index({ source_id: 1, pubDate: -1 });

// Index for creator-based queries - using pubDate for sorting
newsArticleSchema.index({ creator: 1, pubDate: -1 });

// Keep createdAt index for internal operations
newsArticleSchema.index({ createdAt: -1 });

// Index for articles with specific likes count (for analytics)
newsArticleSchema.index({ likes: -1 });

// Compound index for multi-field searches with sorting
newsArticleSchema.index({ keywords: 1, category: 1, pubDate: -1 });

// Index for source and language combination queries
newsArticleSchema.index({ source_id: 1, language: 1, pubDate: -1 });

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
    name: "article_text_search",
  }
);

// Index for country-based filtering - using pubDate for sorting
newsArticleSchema.index({ country: 1, pubDate: -1 });

// Index for language-based filtering - using pubDate for sorting
newsArticleSchema.index({ language: 1, pubDate: -1 });

// Index for articles by publication date range (for time-based queries)
newsArticleSchema.index({ pubDate: 1 }); // Ascending for range queries

// Index for finding articles with missing or empty fields (data quality)
newsArticleSchema.index({ keywords: 1 }, { sparse: true });
newsArticleSchema.index({ description: 1 }, { sparse: true });
newsArticleSchema.index({ image_url: 1 }, { sparse: true });

// Index for link-based deduplication (sparse to handle missing links)
newsArticleSchema.index({ link: 1 }, { unique: true, sparse: true });

// Compound index for advanced filtering (category + language + date)
newsArticleSchema.index({ category: 1, language: 1, pubDate: -1 });

// Index for source analytics and reporting
newsArticleSchema.index({ source_name: 1, pubDate: -1 });

// Index for articles with high engagement (likes + recency)
newsArticleSchema.index({ likes: -1, createdAt: -1 });

// Index for finding popular articles in specific categories
newsArticleSchema.index({ category: 1, likes: -1, pubDate: -1 });

module.exports = mongoose.model("NewsArticle", newsArticleSchema);
