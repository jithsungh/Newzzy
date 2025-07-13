/**
 * Recommendation System Health Check and Testing Utilities
 * Use this to validate the recommendation system is working correctly
 */

const Recommendation = require("../models/recommendations");
const {
  refetchRecommendations,
} = require("../controllers/refreshRecommendations");

class RecommendationHealthCheck {
  /**
   * Comprehensive health check for the recommendation system
   */
  static async performHealthCheck() {
    console.log("🔍 Starting Recommendation System Health Check...\n");

    const results = {
      timestamp: new Date(),
      checks: {},
      overall: "UNKNOWN",
    };

    try {
      // Check 1: Database connectivity and indexes
      results.checks.database = await this.checkDatabaseHealth();

      // Check 2: Recommendation distribution
      results.checks.distribution =
        await this.checkRecommendationDistribution();

      // Check 3: User coverage
      results.checks.userCoverage = await this.checkUserCoverage();

      // Check 4: Performance metrics
      results.checks.performance = await this.checkPerformanceMetrics();

      // Check 5: Data quality
      results.checks.dataQuality = await this.checkDataQuality();

      // Determine overall health
      const failedChecks = Object.values(results.checks).filter(
        (check) => check.status === "FAIL"
      ).length;
      if (failedChecks === 0) {
        results.overall = "HEALTHY";
      } else if (failedChecks <= 2) {
        results.overall = "WARNING";
      } else {
        results.overall = "CRITICAL";
      }

      this.printHealthReport(results);
      return results;
    } catch (error) {
      console.error("❌ Health check failed:", error);
      results.overall = "CRITICAL";
      results.error = error.message;
      return results;
    }
  }

  /**
   * Check database health and index usage
   */
  static async checkDatabaseHealth() {
    try {
      const indexStats = await Recommendation.collection.getIndexes();
      const totalRecommendations = await Recommendation.countDocuments();

      const requiredIndexes = [
        "user_id_1_status_1",
        "user_id_1_score_-1_createdAt_-1",
        "unique_id_1",
      ];

      const hasRequiredIndexes = requiredIndexes.every((indexName) =>
        Object.keys(indexStats).some((key) =>
          key.includes(indexName.split("_")[0])
        )
      );

      return {
        status:
          hasRequiredIndexes && totalRecommendations >= 0 ? "PASS" : "FAIL",
        totalRecommendations,
        indexCount: Object.keys(indexStats).length,
        hasRequiredIndexes,
      };
    } catch (error) {
      return {
        status: "FAIL",
        error: error.message,
      };
    }
  }

  /**
   * Check recommendation distribution across sources and qualities
   */
  static async checkRecommendationDistribution() {
    try {
      const pipeline = [
        { $match: { status: "new" } },
        {
          $group: {
            _id: { source: "$source", quality: "$recommendationQuality" },
            count: { $sum: 1 },
          },
        },
      ];

      const distribution = await Recommendation.aggregate(pipeline);

      const sourceDistribution = {};
      const qualityDistribution = {};

      distribution.forEach((item) => {
        const source = item._id.source || "unknown";
        const quality = item._id.quality || "unknown";

        sourceDistribution[source] =
          (sourceDistribution[source] || 0) + item.count;
        qualityDistribution[quality] =
          (qualityDistribution[quality] || 0) + item.count;
      });

      // Check if we have good distribution
      const hasGoodDistribution =
        sourceDistribution.primary_interests > 0 &&
        qualityDistribution.optimal > 0;

      return {
        status: hasGoodDistribution ? "PASS" : "WARN",
        sourceDistribution,
        qualityDistribution,
      };
    } catch (error) {
      return {
        status: "FAIL",
        error: error.message,
      };
    }
  }

  /**
   * Check user coverage (how many users have recommendations)
   */
  static async checkUserCoverage() {
    try {
      const totalUsers = await Recommendation.distinct("user_id").length;
      const usersWithRecommendations = await Recommendation.aggregate([
        { $match: { status: "new" } },
        { $group: { _id: "$user_id", count: { $sum: 1 } } },
        { $match: { count: { $gte: 10 } } }, // At least 10 recommendations
      ]);

      const coveragePercentage =
        totalUsers > 0
          ? (usersWithRecommendations.length / totalUsers) * 100
          : 0;

      return {
        status:
          coveragePercentage >= 80
            ? "PASS"
            : coveragePercentage >= 50
            ? "WARN"
            : "FAIL",
        totalUsers,
        usersWithGoodCoverage: usersWithRecommendations.length,
        coveragePercentage: Math.round(coveragePercentage * 100) / 100,
      };
    } catch (error) {
      return {
        status: "FAIL",
        error: error.message,
      };
    }
  }

  /**
   * Check performance metrics
   */
  static async checkPerformanceMetrics() {
    try {
      const start = Date.now();

      // Test query performance
      await Recommendation.find({ status: "new" })
        .sort({ score: -1 })
        .hint({ user_id: 1, category: 1, status: 1, score: -1 }) // Use recommendations index
        .limit(50)
        .exec();

      const queryTime = Date.now() - start;

      return {
        status: queryTime < 500 ? "PASS" : queryTime < 1000 ? "WARN" : "FAIL",
        queryTime: `${queryTime}ms`,
        performanceRating:
          queryTime < 100 ? "EXCELLENT" : queryTime < 500 ? "GOOD" : "SLOW",
      };
    } catch (error) {
      return {
        status: "FAIL",
        error: error.message,
      };
    }
  }

  /**
   * Check data quality
   */
  static async checkDataQuality() {
    try {
      const issues = await Recommendation.aggregate([
        {
          $group: {
            _id: null,
            totalRecommendations: { $sum: 1 },
            nullScores: { $sum: { $cond: [{ $eq: ["$score", null] }, 1, 0] } },
            invalidScores: {
              $sum: {
                $cond: [
                  { $or: [{ $lt: ["$score", 0] }, { $gt: ["$score", 1000] }] },
                  1,
                  0,
                ],
              },
            },
            missingSource: {
              $sum: { $cond: [{ $eq: ["$source", null] }, 1, 0] },
            },
            missingCategory: {
              $sum: { $cond: [{ $eq: ["$category", null] }, 1, 0] },
            },
          },
        },
      ]);

      const stats = issues[0] || {};
      const totalIssues =
        (stats.nullScores || 0) +
        (stats.invalidScores || 0) +
        (stats.missingSource || 0) +
        (stats.missingCategory || 0);

      const qualityPercentage =
        stats.totalRecommendations > 0
          ? ((stats.totalRecommendations - totalIssues) /
              stats.totalRecommendations) *
            100
          : 100;

      return {
        status:
          qualityPercentage >= 95
            ? "PASS"
            : qualityPercentage >= 85
            ? "WARN"
            : "FAIL",
        qualityPercentage: Math.round(qualityPercentage * 100) / 100,
        issues: {
          nullScores: stats.nullScores || 0,
          invalidScores: stats.invalidScores || 0,
          missingSource: stats.missingSource || 0,
          missingCategory: stats.missingCategory || 0,
        },
      };
    } catch (error) {
      return {
        status: "FAIL",
        error: error.message,
      };
    }
  }

  /**
   * Print formatted health report
   */
  static printHealthReport(results) {
    console.log("📊 RECOMMENDATION SYSTEM HEALTH REPORT");
    console.log("=".repeat(50));
    console.log(
      `Overall Status: ${this.getStatusEmoji(results.overall)} ${
        results.overall
      }`
    );
    console.log(`Timestamp: ${results.timestamp.toISOString()}\n`);

    Object.entries(results.checks).forEach(([checkName, result]) => {
      console.log(
        `${this.getStatusEmoji(result.status)} ${checkName.toUpperCase()}:`
      );

      Object.entries(result).forEach(([key, value]) => {
        if (key !== "status") {
          console.log(
            `  ${key}: ${
              typeof value === "object" ? JSON.stringify(value, null, 2) : value
            }`
          );
        }
      });
      console.log();
    });

    // Recommendations based on results
    console.log("💡 RECOMMENDATIONS:");
    this.printRecommendations(results);
  }

  static getStatusEmoji(status) {
    switch (status) {
      case "PASS":
      case "HEALTHY":
        return "✅";
      case "WARN":
      case "WARNING":
        return "⚠️";
      case "FAIL":
      case "CRITICAL":
        return "❌";
      default:
        return "❓";
    }
  }

  static printRecommendations(results) {
    if (results.overall === "HEALTHY") {
      console.log("✨ System is operating optimally!");
      return;
    }

    if (results.checks.database?.status === "FAIL") {
      console.log(
        "- Check database connectivity and ensure all indexes are created"
      );
    }

    if (results.checks.userCoverage?.coveragePercentage < 80) {
      console.log(
        "- Consider running recommendation refresh for users with low coverage"
      );
    }

    if (results.checks.performance?.queryTime > 500) {
      console.log(
        "- Database queries are slow, consider optimizing indexes or query patterns"
      );
    }

    if (results.checks.dataQuality?.qualityPercentage < 95) {
      console.log(
        "- Data quality issues detected, run data cleanup procedures"
      );
    }
  }

  /**
   * Test recommendation generation for a specific user
   */
  static async testUserRecommendations(userId) {
    console.log(`🧪 Testing recommendation generation for user: ${userId}`);

    try {
      const start = Date.now();
      const result = await refetchRecommendations(userId);
      const duration = Date.now() - start;

      console.log(
        `✅ Generated ${result.topCount} recommendations in ${duration}ms`
      );

      // Verify recommendations were saved
      const savedRecommendations = await Recommendation.find({
        user_id: userId,
        status: "new",
      })
        .hint({ user_id: 1, category: 1, status: 1, score: -1 }) // Use recommendations index
        .limit(5);

      console.log("📋 Sample recommendations:");
      savedRecommendations.forEach((rec, index) => {
        console.log(
          `  ${index + 1}. Score: ${rec.score}, Source: ${
            rec.source
          }, Category: ${rec.category}`
        );
      });

      return { success: true, count: result.topCount, duration };
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = RecommendationHealthCheck;
