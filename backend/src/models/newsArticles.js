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

// Backend-specific indexes for processing operations
// Unique index for article identification
newsArticleSchema.index({ article_id: 1 }, { unique: true });

// Index for batch processing by creation date
newsArticleSchema.index({ createdAt: -1 });

// Index for keyword processing operations
newsArticleSchema.index({ keywords: 1 });

// Partial index for articles needing keyword processing
newsArticleSchema.index(
  { createdAt: -1, keywords: 1 },
  {
    partialFilterExpression: {
      $or: [{ keywords: { $exists: false } }, { keywords: { $size: 0 } }],
    },
  }
);

// Index for preprocessing operations
newsArticleSchema.index({ preprocessedContent: 1 }, { sparse: true });

// Partial index for articles needing preprocessing
newsArticleSchema.index(
  { createdAt: -1, preprocessedContent: 1 },
  {
    partialFilterExpression: {
      preprocessedContent: { $exists: false },
    },
  }
);

// Index for source analysis and processing
newsArticleSchema.index({ source_id: 1, source_name: 1 });

// Index for language-specific processing
newsArticleSchema.index({ language: 1, keywords: 1 });

// Index for category-based keyword extraction
newsArticleSchema.index({ category: 1, keywords: 1, createdAt: -1 });

// Index for duplicate detection
newsArticleSchema.index({ title: 1, source_id: 1 });

// Index for link-based deduplication
newsArticleSchema.index({ link: 1 }, { unique: true, sparse: true });

// Index for TF-IDF and corpus building operations
newsArticleSchema.index({ keywords: 1, category: 1, language: 1 });

module.exports = mongoose.model("NewsArticle", newsArticleSchema);
