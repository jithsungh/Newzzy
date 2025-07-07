const mongoose = require("mongoose");
const Recommendation = require("../models/recommendations");

/**
 * Migration script to update existing recommendations with new schema fields
 * Run this script once after deploying the new schema
 */
const migrateRecommendations = async () => {
  try {
    console.log("Starting recommendation schema migration...");

    // Update all existing recommendations that don't have the new fields
    const result = await Recommendation.updateMany(
      {
        $or: [
          { readAt: { $exists: false } },
          { source: { $exists: false } },
          { category: { $exists: false } },
          { matchedInterests: { $exists: false } },
          { recommendationQuality: { $exists: false } },
        ],
      },
      {
        $set: {
          readAt: null,
          source: "primary_interests", // Default for existing recommendations
          category: "general",
          matchedInterests: [],
          recommendationQuality: "optimal",
        },
      }
    );

    console.log(
      `Migration completed! Updated ${result.modifiedCount} recommendations.`
    );

    // Update readAt for recommendations that are already marked as read
    const readResult = await Recommendation.updateMany(
      {
        status: "read",
        readAt: null,
      },
      {
        $set: {
          readAt: new Date(), // Set current date as fallback
        },
      }
    );

    console.log(
      `Updated ${readResult.modifiedCount} read recommendations with readAt timestamp.`
    );

    return {
      totalUpdated: result.modifiedCount,
      readUpdated: readResult.modifiedCount,
    };
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Export for use in other scripts
module.exports = { migrateRecommendations };

// Run migration if this file is executed directly
if (require.main === module) {
  // This would typically connect to your database
  // You'd run this script manually after deploying the new schema
  console.log(
    "Migration script ready. Call migrateRecommendations() after connecting to database."
  );
}
