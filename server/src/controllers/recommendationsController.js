const Recommendation = require("../models/recommendations");
const {
  refetchRecommendations,
  deleteReadandOld,
} = require("./refreshRecommendations");

// Get all recommendations for a user latest , descending score
const getRecommendations = async (req, res) => {
  const logPrefix = "[GET_RECOMMENDATIONS]";

  console.log(
    `${logPrefix} ==================== GET RECOMMENDATIONS STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(`${logPrefix} User: ${userId} | Step 1: Validating user ID`);

    if (!userId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    // Check if this is a retry (to prevent infinite recursion)
    const isRetry = req.query.retry === "true";
    console.log(
      `${logPrefix} User: ${userId} | Step 2: Fetching recommendations (retry: ${isRetry})`
    );

    let recommendations = await Recommendation.find({
      user_id: userId,
      status: "new",
    })
      .populate("article_id")
      .sort({ score: -1, createdAt: -1 }) // Sort by score first, then by creation date
      .limit(200)
      .hint({ user_id: 1, status: 1, score: -1, createdAt: -1 }) // Use the compound index
      .exec();

    console.log(
      `${logPrefix} User: ${userId} | Step 3: Found ${recommendations.length} recommendations before filtering`
    );

    // Filter out recommendations where article_id is null (deleted articles)
    recommendations = recommendations.filter((rec) => rec.article_id !== null);

    console.log(
      `${logPrefix} User: ${userId} | Step 4: ${recommendations.length} recommendations after filtering null articles`
    );

    // if recommendations length is less than 50 and it's not a retry, refresh recommendations
    if (recommendations.length < 50 && !isRetry) {
      console.log(
        `${logPrefix} User: ${userId} | Step 5: Refreshing recommendations as count is ${recommendations.length} (less than 50)`
      );

      try {
        // Delete old and read recommendations first
        await deleteReadandOld(userId);
        console.log(
          `${logPrefix} User: ${userId} | Step 5a: Deleted old and read recommendations`
        );

        // Fetch new recommendations
        const refreshResult = await refetchRecommendations(userId);
        console.log(
          `${logPrefix} User: ${userId} | Step 5b: Refresh completed. New recommendation count: ${refreshResult.topCount}`
        );

        // Only retry if we actually got more recommendations
        if (refreshResult.topCount > recommendations.length) {
          console.log(
            `${logPrefix} User: ${userId} | Step 5c: Retrying with new recommendations`
          );
          // Recursive call with retry flag to prevent infinite loop
          req.query.retry = "true";
          return getRecommendations(req, res);
        } else {
          console.log(
            `${logPrefix} User: ${userId} | Step 5c: Refresh did not improve recommendation count, proceeding with existing recommendations`
          );
        }
      } catch (refreshError) {
        console.error(
          `${logPrefix} User: ${userId} | Step 5 ERROR: Error during recommendation refresh:`,
          refreshError
        );
        // Continue with existing recommendations if refresh fails
      }
    }

    if (!recommendations || recommendations.length === 0) {
      console.log(
        `${logPrefix} User: ${userId} | Step 6: No recommendations available`
      );
      console.log(
        `${logPrefix} User: ${userId} | ==================== GET RECOMMENDATIONS COMPLETED ====================`
      );
      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "No recommendations available at this time",
        recommendations: [],
        recommendationQuality: "none",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 7: Calculating analytics for ${recommendations.length} recommendations`
    );

    // Add analytics info to response (optimized single-pass calculation)
    const analyticsInfo = {
      totalCount: recommendations.length,
      qualityBreakdown: { optimal: 0, limited: 0, fallback: 0 },
      sourceBreakdown: {
        primary_interests: 0,
        secondary_interests: 0,
        fallback: 0,
        random: 0,
      },
    };

    // Single pass through recommendations for analytics
    recommendations.forEach((rec) => {
      // Quality breakdown
      const quality = rec.recommendationQuality || "optimal";
      if (analyticsInfo.qualityBreakdown.hasOwnProperty(quality)) {
        analyticsInfo.qualityBreakdown[quality]++;
      }

      // Source breakdown
      const source = rec.source || "primary_interests";
      if (analyticsInfo.sourceBreakdown.hasOwnProperty(source)) {
        analyticsInfo.sourceBreakdown[source]++;
      }
    });

    console.log(
      `${logPrefix} User: ${userId} | Step 8: Analytics calculated successfully`
    );
    console.log(
      `${logPrefix} User: ${userId} | Step 9: Returning ${recommendations.length} recommendations`
    );
    console.log(
      `${logPrefix} User: ${userId} | ==================== GET RECOMMENDATIONS COMPLETED ====================`
    );

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      recommendations,
      recommendationQuality:
        recommendations.length >= 50 ? "optimal" : "limited",
      analytics: analyticsInfo,
    });
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET RECOMMENDATIONS ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      error: "Internal server error",
      message: "Failed to fetch recommendations. Please try again later.",
    });
  }
};

// delete older and seen recommendations
const deleteOldRecommendations = async (req, res) => {
  const logPrefix = "[DELETE_OLD_RECOMMENDATIONS]";

  console.log(
    `${logPrefix} ==================== DELETE OLD RECOMMENDATIONS STARTED ====================`
  );

  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(`${logPrefix} User: ${userId} | Step 1: Validating user ID`);

    if (!userId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Deleting old and read recommendations`
    );
    const success = await deleteReadandOld(userId);

    if (success) {
      console.log(
        `${logPrefix} User: ${userId} | Step 3: Old recommendations deleted successfully`
      );
      console.log(
        `${logPrefix} User: ${userId} | ==================== DELETE OLD RECOMMENDATIONS COMPLETED ====================`
      );
      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Old recommendations deleted successfully",
      });
    } else {
      console.log(
        `${logPrefix} User: ${userId} | Step 3 FAILED: Failed to delete old recommendations`
      );
      return res.status(500).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "Failed to delete old recommendations",
      });
    }
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== DELETE OLD RECOMMENDATIONS ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    return res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      error: "Internal server error",
    });
  }
};

const markAsRead = async (req, res) => {
  const logPrefix = "[MARK_AS_READ]";

  console.log(
    `${logPrefix} ==================== MARK AS READ STARTED ====================`
  );

  try {
    const tokenToReturn = res.locals.accessToken;
    const { articleId } = req.body;
    const userId = req.user.id;

    console.log(
      `${logPrefix} User: ${userId} | Step 1: Validating parameters - articleId: ${articleId}`
    );

    if (!userId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: User ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    if (!articleId) {
      console.log(
        `${logPrefix} User: ${userId} | Step 1 FAILED: Article ID is required`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article ID is required",
      });
    }

    console.log(
      `${logPrefix} User: ${userId} | Step 2: Finding recommendation for article: ${articleId}`
    );
    const recommendation = await Recommendation.findOne({
      user_id: userId,
      article_id: articleId,
    });

    if (!recommendation) {
      console.log(
        `${logPrefix} User: ${userId} | Step 2 FAILED: Recommendation not found for article: ${articleId}`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Recommendation not found",
      });
    }

    // Only update if not already read
    if (recommendation.status !== "read") {
      console.log(
        `${logPrefix} User: ${userId} | Step 3: Marking recommendation as read`
      );
      recommendation.status = "read";
      recommendation.readAt = new Date();
      await recommendation.save();
      console.log(
        `${logPrefix} User: ${userId} | Step 3 SUCCESS: Recommendation marked as read`
      );
    } else {
      console.log(
        `${logPrefix} User: ${userId} | Step 3: Recommendation already marked as read`
      );
    }

    console.log(
      `${logPrefix} User: ${userId} | ==================== MARK AS READ COMPLETED ====================`
    );
    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Recommendation marked as read",
    });
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== MARK AS READ ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        articleId: req.body.articleId,
        timestamp: new Date().toISOString(),
      }
    );
    return res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      error: "Internal server error",
      message: "Failed to mark recommendation as read. Please try again later.",
    });
  }
};

module.exports = {
  getRecommendations,
  deleteOldRecommendations,
  markAsRead,
};
