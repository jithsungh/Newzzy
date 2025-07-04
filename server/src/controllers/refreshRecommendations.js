  const Recommendation = require("../models/recommendations");
const getLatestNewsArticles = require("../services/getNewsArticles");
const getUserInterests = require("../services/getUserInterests");

const refreshRecommendations = async (req, res) => {
  const tokenToReturn = res.locals.accessToken;

  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User ID missing",
      });
    }

    const status = await refetchRecommendations(user_id);

    if (status.topCount === 0) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No recommendations available",
        recommendations: [],
      });
    }

    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Recommendations refreshed successfully",
      topCount: status.topCount,
    });

    // delete old seen recommendations
    await deleteReadandOld(user_id);

  } catch (error) {
    console.error("Error refreshing recommendations:", error);
    return res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      error: "Internal server error",
    });
  }
};

const refetchRecommendations = async (user_id) => {
  const userInterestsMap = await getUserInterests(user_id); // Map<string, number>
  const latestArticles = await getLatestNewsArticles(); // Only fetch required fields

  if (!userInterestsMap || !latestArticles || latestArticles.length === 0) {
    return { topCount: 0 };
  }

  // Convert interest map to sorted array
  const plainInterests = Object.fromEntries(userInterestsMap.entries());
  const sortedInterests = Object.entries(plainInterests).sort((a, b) => b[1] - a[1]);

  const topInterests = sortedInterests.slice(0, Math.ceil(sortedInterests.length * 0.2));
  const interestMap = new Map(topInterests); // For fast lookups

  // Score articles using weighted Jaccard similarity
  const scoredArticles = [];
  for (let i = 0; i < latestArticles.length; i++) {
    const article = latestArticles[i];
    const articleTags = article.keywords || [];
    const unionSet = new Set(articleTags);
    let intersectionWeight = 0;

    for (const [interest, freq] of interestMap.entries()) {
      unionSet.add(interest);
      if (articleTags.includes(interest)) {
        intersectionWeight += freq;
      }
    }

    let unionWeight = 0;
    for (const keyword of unionSet) {
      unionWeight += interestMap.get(keyword) || 1;
    }

    const score = unionWeight === 0 ? 0 : intersectionWeight / unionWeight;

    if (score > 0) {
      scoredArticles.push({
        _id: article._id,
        score,
      });
    }
  }

  // Sort by score descending
  scoredArticles.sort((a, b) => b.score - a.score);

  // Select top 20% articles
  const topCount = Math.ceil(scoredArticles.length * 0.2);
  const topArticles = scoredArticles.slice(0, topCount);

  if (topArticles.length === 0) return { topCount: 0 };

  const bulkOps = topArticles.map((article) => ({
    updateOne: {
      filter: { unique_id: `${user_id}-${article._id}` },
      update: {
        $set: {
          user_id,
          article_id: article._id,
          score: article.score,
        },
      },
      upsert: true,
    },
  }));

  // Write to DB efficiently
  await Recommendation.bulkWrite(bulkOps);
  return { topCount: topArticles.length };
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

module.exports = { refreshRecommendations, refetchRecommendations };



