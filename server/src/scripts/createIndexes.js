const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/mongo");

// Import models to ensure they're registered
const User = require("../models/users");
const NewsArticle = require("../models/newsArticles");
const UserInteraction = require("../models/userInteractions");
const Recommendation = require("../models/recommendations");
const DeletedUser = require("../models/deletedUsers");

/**
 * MongoDB Index Creation Script for Newzzy Application - Robust Version
 *
 * This script creates optimized indexes while handling existing indexes gracefully.
 */

/**
 * Helper function to create index safely, handling existing indexes
 */
const createIndexSafely = async (collection, indexSpec, options = {}) => {
  try {
    await collection.createIndex(indexSpec, options);
    return {
      success: true,
      action: "created",
      message: `✅ Created: ${options.name || JSON.stringify(indexSpec)}`,
    };
  } catch (error) {
    if (
      error.code === 85 ||
      error.codeName === "IndexOptionsConflict" ||
      error.code === 11000 ||
      error.message.includes("already exists")
    ) {
      return {
        success: true,
        action: "exists",
        message: `⚠️  Exists: ${options.name || JSON.stringify(indexSpec)}`,
      };
    } else {
      return {
        success: false,
        action: "error",
        message: `❌ Error: ${error.message}`,
      };
    }
  }
};

const createCoreIndexes = async () => {
  try {
    console.log("🔧 Starting comprehensive index creation...\n");

    const indexesConfig = [
      // ==================== USERS COLLECTION ====================
      {
        collection: User.collection,
        name: "Users",
        indexes: [
          {
            spec: { email: 1 },
            options: { unique: true, name: "users_email_unique" },
          },
          {
            spec: { REFRESH_TOKEN: 1 },
            options: { sparse: true, name: "users_refresh_token" },
          },
          {
            spec: { lastActiveDate: -1, streak: -1 },
            options: { name: "users_activity_streak" },
          },
        ],
      },

      // ==================== NEWS ARTICLES COLLECTION ====================
      {
        collection: NewsArticle.collection,
        name: "NewsArticles",
        indexes: [
          {
            spec: { article_id: 1 },
            options: { unique: true, name: "articles_article_id_unique" },
          },
          { spec: { createdAt: -1 }, options: { name: "articles_latest" } },
          {
            spec: { likes: -1, createdAt: -1 },
            options: { name: "articles_trending" },
          },
          {
            spec: { keywords: 1, createdAt: -1 },
            options: { name: "articles_keywords_date" },
          },
          {
            spec: { category: 1, createdAt: -1 },
            options: { name: "articles_category_date" },
          },
          {
            spec: { source_id: 1, createdAt: -1 },
            options: { name: "articles_source_date" },
          },
          { spec: { pubDate: -1 }, options: { name: "articles_pub_date" } },
          {
            spec: { country: 1, createdAt: -1 },
            options: { name: "articles_country_date" },
          },
          {
            spec: { language: 1, createdAt: -1 },
            options: { name: "articles_language_date" },
          },
        ],
      },

      // ==================== USER INTERACTIONS COLLECTION ====================
      {
        collection: UserInteraction.collection,
        name: "UserInteractions",
        indexes: [
          {
            spec: { user_id: 1, action: 1, createdAt: -1 },
            options: { name: "interactions_user_action_date" },
          },
          {
            spec: { user_id: 1, createdAt: -1 },
            options: { name: "interactions_user_date" },
          },
          {
            spec: { article_id: 1, action: 1, createdAt: -1 },
            options: { name: "interactions_article_analytics" },
          },
          {
            spec: { action: 1, createdAt: -1 },
            options: { name: "interactions_action_date" },
          },
        ],
      },

      // ==================== RECOMMENDATIONS COLLECTION ====================
      {
        collection: Recommendation.collection,
        name: "Recommendations",
        indexes: [
          {
            spec: { user_id: 1, category: 1, status: 1, score: -1 },
            options: { name: "recommendations_user_category" },
          },
        ],
      },

      // ==================== DELETED USERS COLLECTION ====================
      {
        collection: DeletedUser.collection,
        name: "DeletedUsers",
        indexes: [
          { spec: { email: 1 }, options: { name: "deleted_users_email" } },
          {
            spec: { deletedAt: 1 },
            options: { name: "deleted_users_deletion_date" },
          },
        ],
      },
    ];

    let totalCreated = 0;
    let totalExists = 0;
    let totalErrors = 0;

    for (const config of indexesConfig) {
      console.log(`📊 Processing ${config.name} collection...`);

      for (const { spec, options } of config.indexes) {
        const result = await createIndexSafely(
          config.collection,
          spec,
          options
        );
        console.log(`   ${result.message}`);

        if (result.action === "created") totalCreated++;
        else if (result.action === "exists") totalExists++;
        else if (result.action === "error") totalErrors++;
      }
      console.log("");
    }

    console.log("🎉 Index creation process completed!");
    console.log(
      `📈 Summary: ${totalCreated} created, ${totalExists} already existed, ${totalErrors} errors`
    );
  } catch (error) {
    console.error("❌ Error in index creation process:", error);
    throw error;
  }
};

const main = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("🔗 Connected to MongoDB\n");

    // Create all indexes
    await createCoreIndexes();

    console.log("\n💡 Next steps:");
    console.log("   1. Test your application to ensure queries work correctly");
    console.log('   2. Use .explain("executionStats") to verify index usage');
    console.log("   3. Monitor query performance over time");
  } catch (error) {
    console.error("💥 Script failed:", error);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
    process.exit(0);
  }
};

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { createCoreIndexes, createIndexSafely };
