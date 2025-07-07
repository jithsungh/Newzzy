const Recommendation = require("../models/recommendations");
const getLatestNewsArticles = require("../services/getNewsArticles");
const getUserInterests = require("../services/getUserInterests");

const refreshRecommendations = async (req, res) => {
  const logPrefix = "[REFRESH_RECOMMENDATIONS]";
  
  console.log(`${logPrefix} ==================== REFRESH RECOMMENDATIONS STARTED ====================`);
  
  const tokenToReturn = res.locals.accessToken;

  try {
    const user_id = req.user.id;
    
    console.log(`${logPrefix} User: ${user_id} | Step 1: Validating user ID`);
    
    if (!user_id) {
      console.log(`${logPrefix} User: ${user_id} | Step 1 FAILED: User ID missing`);
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User ID missing",
      });
    }

    console.log(`${logPrefix} User: ${user_id} | Step 2: Fetching new recommendations`);
    const status = await refetchRecommendations(user_id);

    // Even if we have 0 recommendations, we should not return an error
    // The system should always try to provide some content
    const message =
      status.topCount >= 50
        ? "Recommendations refreshed successfully"
        : status.topCount > 0
        ? `Recommendations refreshed with ${status.topCount} articles (limited content available)`
        : "No articles available for recommendations at this time";

    console.log(`${logPrefix} User: ${user_id} | Step 3: Refresh completed with ${status.topCount} recommendations`);
    console.log(`${logPrefix} User: ${user_id} | ==================== REFRESH RECOMMENDATIONS COMPLETED ====================`);

    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: message,
      topCount: status.topCount,
      recommendationQuality:
        status.topCount >= 50
          ? "optimal"
          : status.topCount > 0
          ? "limited"
          : "none",
    });

    // delete old seen recommendations (run asynchronously)
    console.log(`${logPrefix} User: ${user_id} | Step 4: Cleaning up old recommendations (async)`);
    deleteReadandOld(user_id).catch((err) =>
      console.error(`${logPrefix} User: ${user_id} | Error cleaning up old recommendations:`, err)
    );
  } catch (error) {
    console.error(`${logPrefix} User: ${req.user?.id || 'unknown'} | ==================== REFRESH RECOMMENDATIONS ERROR ====================`);
    console.error(`${logPrefix} User: ${req.user?.id || 'unknown'} | Error details:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      error: "Internal server error",
      message: "Failed to refresh recommendations. Please try again later.",
    });
  }
};

const refetchRecommendations = async (user_id) => {
  const logPrefix = "[REFETCH_RECOMMENDATIONS]";
  
  console.log(`${logPrefix} User: ${user_id} | ==================== REFETCH RECOMMENDATIONS STARTED ====================`);
  
  // Input validation
  if (!user_id) {
    console.log(`${logPrefix} User: ${user_id} | FAILED: User ID is required for recommendation fetching`);
    throw new Error("User ID is required for recommendation fetching");
  }

  try {
    console.log(`${logPrefix} User: ${user_id} | Step 1: Fetching user interests and latest articles`);
    const userInterestsMap = await getUserInterests(user_id); // Map<string, number>
    const latestArticles = await getLatestNewsArticles(); // Only fetch required fields

    if (!latestArticles || latestArticles.length === 0) {
      console.log(`${logPrefix} User: ${user_id} | Step 1 RESULT: No articles available for recommendations`);
      return { topCount: 0 };
    }

    console.log(`${logPrefix} User: ${user_id} | Step 2: Processing ${latestArticles.length} articles for recommendations`);

    // Extract and categorize user interests intelligently
    const { primaryInterests, secondaryInterests, fallbackInterests } =
      extractUserInterests(userInterestsMap);

    console.log(`${logPrefix} User: ${user_id} | Step 3: User interests categorized - Primary(${primaryInterests.size}), Secondary(${secondaryInterests.size}), Fallback(${fallbackInterests.size})`);

    // Score articles using improved multi-tier matching algorithm
    console.log(`${logPrefix} User: ${user_id} | Step 4: Scoring articles using intelligent matching`);
    const scoredArticles = scoreArticlesIntelligently(
      latestArticles,
      primaryInterests,
      secondaryInterests,
      fallbackInterests
    );

    // Ensure we have enough recommendations (50-200 range)
    const recommendationCount = ensureOptimalRecommendationCount(
      scoredArticles.length,
      primaryInterests.size
    );
    const topArticles = scoredArticles.slice(0, recommendationCount);

    console.log(`${logPrefix} User: ${user_id} | Step 5: Selected ${topArticles.length} top articles`);

    // Fallback strategy if we still don't have enough recommendations
    if (topArticles.length < 50) {
      console.log(`${logPrefix} User: ${user_id} | Step 6: Adding fallback recommendations as count is ${topArticles.length} (less than 50)`);
      const fallbackArticles = getFallbackRecommendations(
        latestArticles,
        topArticles,
        50
      );
      topArticles.push(...fallbackArticles);
      console.log(`${logPrefix} User: ${user_id} | Step 6: Added ${fallbackArticles.length} fallback articles to reach minimum count`);
    }

    if (topArticles.length === 0) {
      console.log(`${logPrefix} User: ${user_id} | Step 7: No recommendations could be generated`);
      return { topCount: 0 };
    }

    console.log(`${logPrefix} User: ${user_id} | Step 7: Preparing bulk operations for ${topArticles.length} recommendations`);
    const bulkOps = topArticles.map((article) => ({
      updateOne: {
        filter: { unique_id: `${user_id}-${article._id}` },
        update: {
          $set: {
            user_id,
            article_id: article._id,
            score: article.score,
            source: article.source || "primary_interests",
            category: article.category || "general",
            matchedInterests: article.matchedInterests || [],
            recommendationQuality:
              topArticles.length >= 50 ? "optimal" : "limited",
          },
        },
        upsert: true,
      },
    }));

    // Write to DB efficiently
    console.log(`${logPrefix} User: ${user_id} | Step 8: Saving recommendations to database`);
    await Recommendation.bulkWrite(bulkOps);
    console.log(`${logPrefix} User: ${user_id} | Step 8 SUCCESS: Successfully saved ${topArticles.length} recommendations`);
    console.log(`${logPrefix} User: ${user_id} | ==================== REFETCH RECOMMENDATIONS COMPLETED ====================`);
    
    return { topCount: topArticles.length };
  } catch (error) {
    console.error(`${logPrefix} User: ${user_id} | ==================== REFETCH RECOMMENDATIONS ERROR ====================`);
    console.error(`${logPrefix} User: ${user_id} | Error details:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    throw error; // Re-throw to be handled by calling function
  }
};

// Intelligently extract user interests based on frequency and semantic meaning
const extractUserInterests = (userInterestsMap) => {
  if (!userInterestsMap || userInterestsMap.size === 0) {
    // Return default interests for new users
    return {
      primaryInterests: new Map([
        ["general", 10],
        ["technology", 8],
        ["news", 8],
        ["business", 6],
        ["health", 6],
      ]),
      secondaryInterests: new Map([
        ["sports", 4],
        ["entertainment", 4],
        ["science", 4],
        ["politics", 4],
      ]),
      fallbackInterests: new Map([
        ["top", 3],
        ["new", 3],
        ["latest", 3],
        ["update", 3],
      ]),
    };
  }

  // Convert Map to array and sort by frequency
  const plainInterests = Object.fromEntries(userInterestsMap.entries());
  const sortedInterests = Object.entries(plainInterests).sort(
    (a, b) => b[1] - a[1]
  );

  // Enhanced stop words list for better filtering
  const stopWords = new Set([
    "and",
    "the",
    "for",
    "are",
    "but",
    "not",
    "you",
    "all",
    "can",
    "had",
    "her",
    "was",
    "one",
    "our",
    "out",
    "day",
    "get",
    "has",
    "him",
    "his",
    "how",
    "man",
    "may",
    "now",
    "old",
    "see",
    "two",
    "way",
    "who",
    "boy",
    "did",
    "its",
    "let",
    "put",
    "say",
    "she",
    "too",
    "use",
    "will",
    "new",
    "from",
    "they",
    "know",
    "want",
    "been",
    "good",
    "much",
    "some",
    "time",
    "very",
    "when",
    "come",
    "here",
    "just",
    "like",
    "long",
    "make",
    "many",
    "over",
    "such",
    "take",
    "than",
    "them",
    "well",
    "were",
  ]);

  // Filter out noise and very low frequency terms
  const meaningfulInterests = sortedInterests.filter(([term, freq]) => {
    // Filter out single characters, pure numbers, and stop words
    if (term.length <= 2 || /^\d+$/.test(term)) return false;
    if (stopWords.has(term.toLowerCase())) return false;

    // Filter out very low frequency terms unless they're specific/meaningful
    if (freq < 2 && term.length < 5) return false;

    return freq >= 1;
  });

  const totalInterests = meaningfulInterests.length;

  // Dynamic thresholds based on total interest count
  let primaryThreshold, secondaryThreshold;

  if (totalInterests <= 10) {
    primaryThreshold = Math.min(5, totalInterests);
    secondaryThreshold = totalInterests;
  } else if (totalInterests <= 50) {
    primaryThreshold = Math.floor(totalInterests * 0.2); // Top 20%
    secondaryThreshold = Math.floor(totalInterests * 0.5); // Next 30%
  } else {
    primaryThreshold = Math.floor(totalInterests * 0.15); // Top 15%
    secondaryThreshold = Math.floor(totalInterests * 0.35); // Next 20%
  }

  const primaryInterests = new Map(
    meaningfulInterests.slice(0, primaryThreshold)
  );
  const secondaryInterests = new Map(
    meaningfulInterests.slice(primaryThreshold, secondaryThreshold)
  );
  const fallbackInterests = new Map(
    meaningfulInterests.slice(
      secondaryThreshold,
      Math.min(totalInterests, secondaryThreshold + 25)
    )
  );

  return { primaryInterests, secondaryInterests, fallbackInterests };
};

// Advanced scoring algorithm with multi-tier matching
const scoreArticlesIntelligently = (
  articles,
  primaryInterests,
  secondaryInterests,
  fallbackInterests
) => {
  const scoredArticles = [];
  const totalInterestWeight =
    primaryInterests.size + secondaryInterests.size + fallbackInterests.size;

  // Create a deterministic random threshold based on user interests
  const randomThreshold = totalInterestWeight > 10 ? 0.05 : 0.15; // Less random articles for users with many interests

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const articleKeywords = (article.keywords || []).map((k) =>
      k.toLowerCase()
    );
    const articleTitle = (article.title || "").toLowerCase();
    const articleContent = (
      article.content ||
      article.description ||
      ""
    ).toLowerCase();

    let score = 0;
    let matchCount = 0;
    let matchedInterests = [];
    let source = "fallback";
    let category = "general";

    // Primary interests matching (highest weight)
    for (const [interest, freq] of primaryInterests.entries()) {
      const interestLower = interest.toLowerCase();
      let matchWeight = 0;

      // Exact keyword match
      if (articleKeywords.includes(interestLower)) {
        matchWeight += freq * 3;
        matchedInterests.push(interest);
      }

      // Title contains interest (high relevance)
      if (articleTitle.includes(interestLower)) {
        matchWeight += freq * 2;
        if (!matchedInterests.includes(interest))
          matchedInterests.push(interest);
      }

      // Content contains interest
      if (articleContent.includes(interestLower)) {
        matchWeight += freq * 1;
        if (!matchedInterests.includes(interest))
          matchedInterests.push(interest);
      }

      if (matchWeight > 0) {
        score += matchWeight;
        matchCount++;
        source = "primary_interests";
        category = getCategoryFromInterest(interest);
      }
    }

    // Secondary interests matching (medium weight)
    for (const [interest, freq] of secondaryInterests.entries()) {
      const interestLower = interest.toLowerCase();
      let matchWeight = 0;

      if (articleKeywords.includes(interestLower)) {
        matchWeight += freq * 1.5;
        if (!matchedInterests.includes(interest))
          matchedInterests.push(interest);
      }

      if (articleTitle.includes(interestLower)) {
        matchWeight += freq * 1;
        if (!matchedInterests.includes(interest))
          matchedInterests.push(interest);
      }

      if (articleContent.includes(interestLower)) {
        matchWeight += freq * 0.5;
        if (!matchedInterests.includes(interest))
          matchedInterests.push(interest);
      }

      if (matchWeight > 0) {
        score += matchWeight;
        matchCount++;
        if (source === "fallback") {
          source = "secondary_interests";
          category = getCategoryFromInterest(interest);
        }
      }
    }

    // Fallback interests matching (low weight)
    for (const [interest, freq] of fallbackInterests.entries()) {
      const interestLower = interest.toLowerCase();
      if (
        articleKeywords.includes(interestLower) ||
        articleTitle.includes(interestLower) ||
        articleContent.includes(interestLower)
      ) {
        score += freq * 0.3;
        matchCount++;
        if (!matchedInterests.includes(interest))
          matchedInterests.push(interest);
      }
    }

    // Boost score based on match diversity
    if (matchCount > 1) {
      score *= 1 + Math.log(matchCount) * 0.1;
    }

    // Include articles with score > 0, or use deterministic selection for variety
    const includeForVariety = i % Math.floor(1 / randomThreshold) === 0; // Deterministic selection
    if (score > 0 || includeForVariety) {
      scoredArticles.push({
        _id: article._id,
        score: score || 0.1, // Minimum score for random articles
        source: score > 0 ? source : "random",
        category: score > 0 ? category : "general",
        matchedInterests: matchedInterests,
      });
    }
  }

  // Sort by score descending
  scoredArticles.sort((a, b) => b.score - a.score);
  return scoredArticles;
};

// Helper function to determine category from interest
const getCategoryFromInterest = (interest) => {
  const interestLower = interest.toLowerCase();

  if (
    [
      "technology",
      "tech",
      "ai",
      "software",
      "programming",
      "coding",
      "github",
    ].includes(interestLower)
  ) {
    return "technology";
  }
  if (
    ["health", "medicine", "medical", "fitness", "wellness"].includes(
      interestLower
    )
  ) {
    return "health";
  }
  if (
    [
      "business",
      "market",
      "stock",
      "economy",
      "finance",
      "investment",
    ].includes(interestLower)
  ) {
    return "business";
  }
  if (
    [
      "sports",
      "football",
      "basketball",
      "baseball",
      "soccer",
      "nfl",
      "mlb",
    ].includes(interestLower)
  ) {
    return "sports";
  }
  if (
    ["entertainment", "movies", "music", "gaming", "nintendo"].includes(
      interestLower
    )
  ) {
    return "entertainment";
  }
  if (
    ["politics", "election", "government", "policy"].includes(interestLower)
  ) {
    return "politics";
  }
  if (["science", "research", "study", "climate"].includes(interestLower)) {
    return "science";
  }

  return "general";
};

// Ensure optimal recommendation count between 50-200
const ensureOptimalRecommendationCount = (
  availableCount,
  primaryInterestCount
) => {
  const minRecommendations = 50;
  const maxRecommendations = 200;

  // Base count on user interest diversity
  let targetCount = Math.max(
    minRecommendations,
    Math.min(maxRecommendations, primaryInterestCount * 8)
  );

  // Adjust based on available articles
  if (availableCount < minRecommendations) {
    return availableCount; // Will trigger fallback strategy
  }

  return Math.min(targetCount, availableCount, maxRecommendations);
};

// Fallback strategy to ensure minimum recommendations
const getFallbackRecommendations = (
  allArticles,
  existingRecommendations,
  targetCount
) => {
  const existingIds = new Set(
    existingRecommendations.map((r) => r._id.toString())
  );
  const fallbackArticles = [];

  // Get remaining articles not already recommended
  const remainingArticles = allArticles.filter(
    (article) => !existingIds.has(article._id.toString())
  );

  // Sort by recency and add random popular articles
  const sortedRemaining = remainingArticles
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt) -
        new Date(a.publishedAt || a.createdAt)
    )
    .slice(0, targetCount - existingRecommendations.length);

  for (const article of sortedRemaining) {
    fallbackArticles.push({
      _id: article._id,
      score: 0.05, // Low score for fallback articles
      source: "fallback",
      category: "general",
      matchedInterests: [],
    });
  }

  return fallbackArticles;
};

const deleteReadandOld = async (userId) => {
  const logPrefix = "[DELETE_READ_AND_OLD]";
  
  console.log(`${logPrefix} User: ${userId} | ==================== DELETE READ AND OLD STARTED ====================`);
  
  try {
    console.log(`${logPrefix} User: ${userId} | Step 1: Deleting read recommendations`);
    const deleteReadResult = await Recommendation.deleteMany({
      user_id: userId,
      status: "read",
    });

    console.log(`${logPrefix} User: ${userId} | Step 2: Deleting old recommendations (older than 30 days)`);
    // also delete recommendations older than 30 days with status "new"
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const deleteOldResult = await Recommendation.deleteMany({
      user_id: userId,
      status: "new",
      createdAt: { $lt: thirtyDaysAgo },
    });

    console.log(`${logPrefix} User: ${userId} | Step 3: Cleanup completed - deleted ${deleteReadResult.deletedCount} read recommendations and ${deleteOldResult.deletedCount} old recommendations`);
    console.log(`${logPrefix} User: ${userId} | ==================== DELETE READ AND OLD COMPLETED ====================`);
    return true;
  } catch (error) {
    console.error(`${logPrefix} User: ${userId} | ==================== DELETE READ AND OLD ERROR ====================`);
    console.error(`${logPrefix} User: ${userId} | Error details:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
};

module.exports = {
  refreshRecommendations,
  refetchRecommendations,
  deleteReadandOld,
};
