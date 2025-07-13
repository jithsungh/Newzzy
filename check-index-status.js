const mongoose = require("mongoose");
require("dotenv").config({ path: "./server/.env" });
const connectDB = require("./server/src/config/mongo");

/**
 * MongoDB Index Status Checker for Newzzy
 *
 * This script provides a quick overview of all indexes in your MongoDB collections
 * and their usage statistics.
 */

const checkIndexStatus = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected successfully!\n");

    const collections = [
      { name: "users", displayName: "Users" },
      { name: "newsarticles", displayName: "News Articles" },
      { name: "userinteractions", displayName: "User Interactions" },
      { name: "recommendations", displayName: "Recommendations" },
      { name: "deletedusers", displayName: "Deleted Users" },
    ];

    console.log("📊 INDEX STATUS REPORT");
    console.log("=".repeat(80));

    for (const collection of collections) {
      console.log(
        `\n📁 ${collection.displayName} Collection (${collection.name})`
      );
      console.log("-".repeat(50));

      try {
        // Get indexes
        const indexes = await mongoose.connection.db
          .collection(collection.name)
          .indexes();

        if (indexes.length === 0) {
          console.log("❌ No indexes found");
          continue;
        }

        console.log(`✅ Found ${indexes.length} indexes:`);

        indexes.forEach((index, i) => {
          console.log(`   ${i + 1}. ${index.name || "unnamed"}`);
          console.log(`      Keys: ${JSON.stringify(index.key)}`);

          if (index.unique) console.log("      🔒 Unique");
          if (index.sparse) console.log("      📊 Sparse");
          if (index.partialFilterExpression) console.log("      🔍 Partial");
          if (index.expireAfterSeconds)
            console.log(`      ⏰ TTL: ${index.expireAfterSeconds}s`);

          console.log("");
        });

        // Get collection stats
        const stats = await mongoose.connection.db
          .collection(collection.name)
          .stats();
        console.log(`📈 Collection Stats:`);
        console.log(`   Documents: ${stats.count.toLocaleString()}`);
        console.log(
          `   Data Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`
        );
        console.log(
          `   Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`
        );
        console.log(`   Average Document Size: ${stats.avgObjSize} bytes`);
      } catch (error) {
        console.log(
          `⚠️  Could not get info for ${collection.name}: ${error.message}`
        );
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📋 SUMMARY");
    console.log("=".repeat(80));

    // Get database stats
    try {
      const dbStats = await mongoose.connection.db.stats();
      console.log(`📊 Database: ${dbStats.db}`);
      console.log(`📁 Collections: ${dbStats.collections}`);
      console.log(`📄 Total Documents: ${dbStats.objects.toLocaleString()}`);
      console.log(
        `💾 Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(
        `🗂️  Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`
      );
      console.log(
        `💿 Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`
      );
    } catch (error) {
      console.log(`⚠️  Could not get database stats: ${error.message}`);
    }

    console.log("\n💡 RECOMMENDATIONS:");
    console.log("   • Monitor slow queries with db.setProfilingLevel(2)");
    console.log('   • Use .explain("executionStats") to verify index usage');
    console.log(
      "   • Check index usage with db.collection.aggregate([{$indexStats:{}}])"
    );
    console.log("   • Review and drop unused indexes periodically");
    console.log("   • Consider compound indexes for complex queries");
  } catch (error) {
    console.error("❌ Error checking index status:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
    process.exit(0);
  }
};

const analyzeSlowQueries = async () => {
  try {
    console.log("\n🐌 SLOW QUERY ANALYSIS");
    console.log("=".repeat(50));

    // Enable profiling for slow queries (> 100ms)
    await mongoose.connection.db.command({ profile: 2, slowms: 100 });
    console.log("✅ Profiling enabled for queries > 100ms");

    // Get recent slow queries
    const slowQueries = await mongoose.connection.db
      .collection("system.profile")
      .find({})
      .sort({ ts: -1 })
      .limit(10)
      .toArray();

    if (slowQueries.length === 0) {
      console.log("✅ No slow queries found in recent history");
    } else {
      console.log(`⚠️  Found ${slowQueries.length} recent slow queries:`);

      slowQueries.forEach((query, i) => {
        console.log(`\n   ${i + 1}. Collection: ${query.ns}`);
        console.log(`      Duration: ${query.millis}ms`);
        console.log(`      Command: ${JSON.stringify(query.command, null, 2)}`);
        if (query.planSummary) {
          console.log(`      Plan: ${query.planSummary}`);
        }
      });
    }

    // Disable profiling
    await mongoose.connection.db.command({ profile: 0 });
    console.log("\n✅ Profiling disabled");
  } catch (error) {
    console.log(`⚠️  Could not analyze slow queries: ${error.message}`);
  }
};

const main = async () => {
  console.log("🔍 MONGODB INDEX STATUS CHECKER");
  console.log("🚀 Starting comprehensive index analysis...\n");

  await checkIndexStatus();
  await analyzeSlowQueries();
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkIndexStatus, analyzeSlowQueries };
