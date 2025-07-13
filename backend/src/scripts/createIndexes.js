const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/mongo");

// Import models to ensure they're registered
const NewsArticle = require("../models/newsArticles");

/**
 * MongoDB Index Creation Script for Newzzy Backend Application
 *
 * This script creates optimized indexes for the backend news processing system.
 * Run this script after any major schema changes or during deployment.
 */

const createBackendIndexes = async () => {
  try {
    console.log("🔧 Starting backend index creation process...\n");

    // ==================== NEWS ARTICLES COLLECTION INDEXES (Backend Focus) ====================
    console.log(
      "📰 Creating backend-specific indexes for NewsArticles collection..."
    );

    // Index for keyword processing and extraction
    await NewsArticle.collection.createIndex(
      { keywords: 1 },
      { name: "articles_keywords_processing" }
    );
    console.log("✅ Created index for keyword processing");

    // Index for preprocessing operations
    await NewsArticle.collection.createIndex(
      { preprocessedContent: 1 },
      {
        sparse: true, // Only index documents that have preprocessed content
        name: "articles_preprocessed_content",
      }
    );
    console.log("✅ Created sparse index for preprocessed content");

    // Compound index for batch processing operations
    await NewsArticle.collection.createIndex(
      { createdAt: -1, keywords: 1 },
      { name: "articles_batch_processing" }
    );
    console.log("✅ Created compound index for batch processing");

    // Index for source analysis
    await NewsArticle.collection.createIndex(
      { source_id: 1, source_name: 1 },
      { name: "articles_source_analysis" }
    );
    console.log("✅ Created compound index for source analysis");

    // Index for content length analysis (using title and description length)
    await NewsArticle.collection.createIndex(
      { title: 1, description: 1 },
      { name: "articles_content_analysis" }
    );
    console.log("✅ Created index for content analysis");

    // Index for date-based corpus building
    await NewsArticle.collection.createIndex(
      { createdAt: -1, preprocessedContent: 1 },
      {
        partialFilterExpression: {
          preprocessedContent: { $exists: true, $ne: null },
        },
        name: "articles_corpus_building",
      }
    );
    console.log("✅ Created partial index for corpus building");

    // Index for language-specific processing
    await NewsArticle.collection.createIndex(
      { language: 1, keywords: 1 },
      { name: "articles_language_keywords" }
    );
    console.log(
      "✅ Created compound index for language-specific keyword processing"
    );

    // Index for category-based keyword extraction
    await NewsArticle.collection.createIndex(
      { category: 1, keywords: 1, createdAt: -1 },
      { name: "articles_category_keywords_date" }
    );
    console.log(
      "✅ Created compound index for category-based keyword extraction"
    );

    // Index for article quality assessment (based on description and content availability)
    await NewsArticle.collection.createIndex(
      {
        description: 1,
        image_url: 1,
        creator: 1,
      },
      { name: "articles_quality_assessment" }
    );
    console.log("✅ Created compound index for quality assessment");

    // Index for duplicate detection
    await NewsArticle.collection.createIndex(
      { title: 1, source_id: 1 },
      { name: "articles_duplicate_detection" }
    );
    console.log("✅ Created compound index for duplicate detection");

    // Index for URL-based deduplication
    await NewsArticle.collection.createIndex(
      { link: 1 },
      {
        unique: true,
        sparse: true,
        name: "articles_link_unique",
      }
    );
    console.log("✅ Created unique sparse index on article link");

    console.log("\n🎉 All backend indexes created successfully!");
  } catch (error) {
    console.error("❌ Error creating backend indexes:", error);
    throw error;
  }
};

const optimizeForKeywordExtraction = async () => {
  try {
    console.log("\n🔍 Optimizing indexes for keyword extraction processes...");

    // Index for TF-IDF calculation
    await NewsArticle.collection.createIndex(
      { keywords: 1, category: 1, language: 1 },
      { name: "articles_tfidf_calculation" }
    );
    console.log("✅ Created TF-IDF optimization index");

    // Index for corpus statistics
    await NewsArticle.collection.createIndex(
      { language: 1, createdAt: -1, keywords: 1 },
      { name: "articles_corpus_stats" }
    );
    console.log("✅ Created corpus statistics index");

    // Index for keyword frequency analysis
    await NewsArticle.collection.createIndex(
      { keywords: 1, createdAt: -1 },
      { name: "articles_keyword_frequency" }
    );
    console.log("✅ Created keyword frequency analysis index");
  } catch (error) {
    console.error("❌ Error optimizing keyword extraction indexes:", error);
    throw error;
  }
};

const createProcessingStatusIndexes = async () => {
  try {
    console.log(
      "\n⚙️ Creating indexes for article processing status tracking..."
    );

    // Add a field to track processing status if not exists
    // This would typically be added to the schema, but we can work with existing fields

    // Index for articles that need keyword processing
    await NewsArticle.collection.createIndex(
      {
        keywords: 1,
        createdAt: -1,
      },
      {
        partialFilterExpression: {
          $or: [{ keywords: { $exists: false } }, { keywords: { $size: 0 } }],
        },
        name: "articles_need_keyword_processing",
      }
    );
    console.log(
      "✅ Created partial index for articles needing keyword processing"
    );

    // Index for articles that need preprocessing
    await NewsArticle.collection.createIndex(
      {
        preprocessedContent: 1,
        createdAt: -1,
      },
      {
        partialFilterExpression: {
          preprocessedContent: { $exists: false },
        },
        name: "articles_need_preprocessing",
      }
    );
    console.log("✅ Created partial index for articles needing preprocessing");
  } catch (error) {
    console.error("❌ Error creating processing status indexes:", error);
    throw error;
  }
};

const main = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("🔗 Connected to MongoDB for backend operations");

    // Create backend-specific indexes
    await createBackendIndexes();

    // Optimize for keyword extraction
    await optimizeForKeywordExtraction();

    // Create processing status indexes
    await createProcessingStatusIndexes();

    console.log("\n🏁 Backend index creation completed successfully!");
    console.log("\n💡 Backend-specific optimizations:");
    console.log("   1. Keyword processing operations are now optimized");
    console.log("   2. Article preprocessing queries will be faster");
    console.log("   3. Batch operations on large datasets are optimized");
    console.log("   4. Corpus building and analysis operations are indexed");
    console.log(
      "   5. Duplicate detection and content quality assessment are optimized"
    );
  } catch (error) {
    console.error("💥 Backend script failed:", error);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  }
};

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createBackendIndexes,
  optimizeForKeywordExtraction,
  createProcessingStatusIndexes,
};
