const Recommendation = require("../models/recommendations");
const { refetchRecommendations } = require("./refreshRecommendations");

// Get all recommendations for a user latest , descending score
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    if (!userId) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        error: "User ID is required",
      });
    }

    const recommendations = await Recommendation.find({
      user_id: userId,
      status: "new",
    })
      .populate("article_id")
      .sort({ pubDate: -1 })
      .limit(200)
      .exec();

    // if recommendations length is less than 50, refresh recommendations
    if (recommendations.length < 50) {
      console.log("Refreshing recommendations as count is less than 50");
      const temp = await deleteReadandOld(userId); // delete old and read recommendations
      const newRecommendations = await refetchRecommendations(userId);
      return getRecommendations(req, res); // Fetch again after refreshing
    } else {
      if (!recommendations || recommendations.length === 0) {
        return res.status(404).json({
          success: false,
          AccessToken: tokenToReturn,
          message: "No recommendations found",
        });
      }
      console.log("Returning recommendations for user:", userId);
      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        recommendations,
      });
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      error: "Internal server error",
    });
  }
};

// delete older and seen recommendations
const deleteOldRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenToReturn = res.locals.accessToken;
    if (await deleteReadandOld(userId)) {
      return res.status(204).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Old recommendations deleted successfully",
        za,
      });
    }
  } catch (error) {
    console.error("Error deleting recommendations:", error);
    return res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      error: "Internal server error",
    });
  }
};

const deleteReadandOld = async (userId) => {
  try {
    await Recommendation.deleteMany({ user_id: userId, status: "read" });

    // also delete recommendations older than 30 days with status "new"
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await Recommendation.deleteMany({
      user_id: userId,
      status: "new",
      createdAt: { $lt: thirtyDaysAgo },
    });
    return true;
  } catch (error) {
    console.error("Error deleting recommendations:", error);
    return false;
  }
};

const markAsRead = async (req, res) => {
  try {
    const { recommendationId } = req.body;
    const tokenToReturn = res.locals.accessToken;

    if (!recommendationId) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Recommendation ID is required",
      });
    }

    const recommendation = await Recommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Recommendation not found",
      });
    }

    recommendation.status = "read";
    await recommendation.save();

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Recommendation marked as read",
    });
  } catch (error) {
    console.error("Error marking recommendation as read:", error);
    return res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      error: "Internal server error",
    });
  }
};

module.exports = {
  getRecommendations,
  deleteOldRecommendations,
  deleteReadandOld,
  markAsRead,
};
