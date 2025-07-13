const UserInteraction = require("../models/userInteractions");
const User = require("../models/users");
const NewsArticle = require("../models/newsArticles");

const incrementInterest = (user, keywords) => {
  if (!user.interests) {
    user.interests = new Map();
  }

  keywords.forEach((keyword) => {
    const current = user.interests.get(keyword) || 0;
    user.interests.set(keyword, current + 1);
  });

  user.markModified("interests"); // Necessary for Map changes
  return user.save();
};

const decrementInterest = (user, keywords) => {
  if (!user.interests) {
    user.interests = new Map();
  }

  keywords.forEach((keyword) => {
    const current = user.interests.get(keyword);
    if (current) {
      const updated = current - 1;
      if (updated <= 0) {
        user.interests.delete(keyword);
      } else {
        user.interests.set(keyword, updated);
      }
    }
  });

  user.markModified("interests"); // Required for Map changes to persist
  return user.save();
};

// like article -> update user interests with article's keywords and post new user interaction
const likeArticle = async (req, res) => {
  const logPrefix = "[LIKE_ARTICLE]";

  console.log(
    `${logPrefix} ==================== LIKE ARTICLE STARTED ====================`
  );

  const { article_id } = req.body;
  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  console.log(
    `${logPrefix} User: ${user_id} | Step 1: Processing like for article: ${article_id}`
  );

  try {
    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Fetching article, user, and existing interactions`
    );
    // Fetch article, user, and existing interaction in parallel
    const [article, user, existingLike, existingDislike] = await Promise.all([
      NewsArticle.findById(article_id),
      User.findById(user_id),
      UserInteraction.findOne({ user_id, article_id, action: "like" }).hint({
        user_id: 1,
        action: 1,
        createdAt: -1,
      }),
      UserInteraction.findOne({ user_id, article_id, action: "dislike" }).hint({
        user_id: 1,
        action: 1,
        createdAt: -1,
      }),
    ]);

    if (!article) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: Article not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    if (!user) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User not found",
      });
    }

    if (!Array.isArray(article.keywords) || article.keywords.length === 0) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: Article has no keywords`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article has no keywords",
      });
    }

    // Case 1: If already liked, remove like
    if (existingLike) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 3: Article already liked, removing like`
      );
      await Promise.all([
        UserInteraction.deleteOne({ user_id, article_id, action: "like" }),
        decrementInterest(user, article.keywords),
      ]);

      article.likes = Math.max(0, article.likes - 1);
      await article.save();

      console.log(
        `${logPrefix} User: ${user_id} | Step 3 SUCCESS: Article unliked`
      );
      console.log(
        `${logPrefix} User: ${user_id} | ==================== LIKE ARTICLE COMPLETED ====================`
      );
      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Article unliked",
      });
    }

    // Case 2: Remove "dislike" if it exists
    if (existingDislike) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 4: Removing existing dislike before adding like`
      );
      await UserInteraction.deleteOne({
        user_id,
        article_id,
        action: "dislike",
      });
    }

    // Case 3: Add like interaction and update interests
    console.log(
      `${logPrefix} User: ${user_id} | Step 5: Adding like interaction and updating user interests`
    );
    await Promise.all([
      incrementInterest(user, article.keywords),
      new UserInteraction({ user_id, article_id, action: "like" }).save(),
    ]);

    article.likes += 1;
    await article.save();

    console.log(
      `${logPrefix} User: ${user_id} | Step 6: Article liked successfully`
    );
    console.log(
      `${logPrefix} User: ${user_id} | ==================== LIKE ARTICLE COMPLETED ====================`
    );
    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Article liked and interests updated",
    });
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== LIKE ARTICLE ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        article_id: req.body.article_id,
        timestamp: new Date().toISOString(),
      }
    );
    return res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const dislikeArticle = async (req, res) => {
  const logPrefix = "[DISLIKE_ARTICLE]";

  console.log(
    `${logPrefix} ==================== DISLIKE ARTICLE STARTED ====================`
  );

  const { article_id } = req.body;
  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  console.log(
    `${logPrefix} User: ${user_id} | Step 1: Processing dislike for article: ${article_id}`
  );

  try {
    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Fetching article, user, and existing interactions`
    );
    // Parallel fetch: article, user, existing interactions
    const [article, user, existingDislike, existingLike] = await Promise.all([
      NewsArticle.findById(article_id),
      User.findById(user_id),
      UserInteraction.findOne({ user_id, article_id, action: "dislike" }).hint({
        user_id: 1,
        action: 1,
        createdAt: -1,
      }),
      UserInteraction.findOne({ user_id, article_id, action: "like" }).hint({
        user_id: 1,
        action: 1,
        createdAt: -1,
      }),
    ]);

    if (!article) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: Article not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    if (!user) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User not found",
      });
    }

    const keywords = article.keywords || [];

    // Case 1: Already disliked → undo it
    if (existingDislike) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 3: Article already disliked, removing dislike`
      );
      await Promise.all([
        UserInteraction.deleteOne({ user_id, article_id, action: "dislike" }),
        incrementInterest(user, keywords),
      ]);

      console.log(
        `${logPrefix} User: ${user_id} | Step 3 SUCCESS: Article undisliked`
      );
      console.log(
        `${logPrefix} User: ${user_id} | ==================== DISLIKE ARTICLE COMPLETED ====================`
      );
      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Article undisliked",
      });
    }

    // Case 2: Previously liked → undo like and decrement likes count
    if (existingLike) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 4: Removing existing like before adding dislike`
      );
      article.likes = Math.max(0, article.likes - 1);
      await Promise.all([
        UserInteraction.deleteOne({ user_id, article_id, action: "like" }),
        article.save(),
      ]);
    }

    // Case 3: Add dislike + update user interests
    console.log(
      `${logPrefix} User: ${user_id} | Step 5: Adding dislike interaction and updating user interests`
    );
    await Promise.all([
      decrementInterest(user, keywords),
      new UserInteraction({ user_id, article_id, action: "dislike" }).save(),
    ]);

    console.log(
      `${logPrefix} User: ${user_id} | Step 6: Article disliked successfully`
    );
    console.log(
      `${logPrefix} User: ${user_id} | ==================== DISLIKE ARTICLE COMPLETED ====================`
    );
    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Article disliked",
    });
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== DISLIKE ARTICLE ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        article_id: req.body.article_id,
        timestamp: new Date().toISOString(),
      }
    );
    return res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const saveArticle = async (req, res) => {
  const logPrefix = "[SAVE_ARTICLE]";

  console.log(
    `${logPrefix} ==================== SAVE ARTICLE STARTED ====================`
  );

  const { article_id } = req.body;
  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  console.log(
    `${logPrefix} User: ${user_id} | Step 1: Processing save for article: ${article_id}`
  );

  try {
    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Fetching article, user, and existing save interaction`
    );
    // Parallel fetch: article, user, existing "save" interaction
    const [article, user, existingSave] = await Promise.all([
      NewsArticle.findById(article_id),
      User.findById(user_id),
      UserInteraction.findOne({ user_id, article_id, action: "save" }).hint({
        user_id: 1,
        action: 1,
        createdAt: -1,
      }),
    ]);

    if (!article) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: Article not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    if (!user) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User not found",
      });
    }

    const keywords = article.keywords || [];

    // Case 1: Already saved → unsave
    if (existingSave) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 3: Article already saved, removing save`
      );
      await Promise.all([
        UserInteraction.deleteOne({ user_id, article_id, action: "save" }),
        decrementInterest(user, keywords),
      ]);

      console.log(
        `${logPrefix} User: ${user_id} | Step 3 SUCCESS: Article unsaved`
      );
      console.log(
        `${logPrefix} User: ${user_id} | ==================== SAVE ARTICLE COMPLETED ====================`
      );
      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Article unsaved",
      });
    }

    // Case 2: Not yet saved → save and update interests
    console.log(
      `${logPrefix} User: ${user_id} | Step 4: Adding save interaction and updating user interests`
    );
    await Promise.all([
      incrementInterest(user, keywords),
      new UserInteraction({ user_id, article_id, action: "save" }).save(),
    ]);

    console.log(
      `${logPrefix} User: ${user_id} | Step 5: Article saved successfully`
    );
    console.log(
      `${logPrefix} User: ${user_id} | ==================== SAVE ARTICLE COMPLETED ====================`
    );
    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Article saved",
    });
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== SAVE ARTICLE ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        article_id: req.body.article_id,
        timestamp: new Date().toISOString(),
      }
    );
    return res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const shareArticle = async (req, res) => {
  const logPrefix = "[SHARE_ARTICLE]";

  console.log(
    `${logPrefix} ==================== SHARE ARTICLE STARTED ====================`
  );

  const { article_id } = req.body;
  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  console.log(
    `${logPrefix} User: ${user_id} | Step 1: Processing share for article: ${article_id}`
  );

  try {
    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Fetching article, user, and existing share interaction`
    );
    // Fetch article, user, and existing interaction in parallel
    const [article, user, existingShare] = await Promise.all([
      NewsArticle.findById(article_id),
      User.findById(user_id),
      UserInteraction.findOne({ user_id, article_id, action: "share" }).hint({
        user_id: 1,
        action: 1,
        createdAt: -1,
      }),
    ]);

    if (!article) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: Article not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    if (!user) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: User not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User not found",
      });
    }

    const keywords = article.keywords || [];

    if (keywords.length === 0) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 2 FAILED: Article has no keywords`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article has no keywords",
      });
    }

    // Case 1: Interaction already exists → update timestamp
    if (existingShare) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 3: Share interaction already exists, updating timestamp`
      );
      await UserInteraction.updateOne(
        { user_id, article_id, action: "share" },
        { $set: { updatedAt: new Date() } }
      );

      console.log(
        `${logPrefix} User: ${user_id} | Step 3 SUCCESS: Share interaction updated`
      );
      console.log(
        `${logPrefix} User: ${user_id} | ==================== SHARE ARTICLE COMPLETED ====================`
      );
      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Share interaction updated",
      });
    }

    // Case 2: No interaction yet → add share + update interest
    console.log(
      `${logPrefix} User: ${user_id} | Step 4: Adding share interaction and updating user interests`
    );
    await Promise.all([
      incrementInterest(user, keywords),
      new UserInteraction({ user_id, article_id, action: "share" }).save(),
    ]);

    console.log(
      `${logPrefix} User: ${user_id} | Step 5: Article shared successfully`
    );
    console.log(
      `${logPrefix} User: ${user_id} | ==================== SHARE ARTICLE COMPLETED ====================`
    );
    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Article shared and interests updated",
    });
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== SHARE ARTICLE ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "unknown"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        article_id: req.body.article_id,
        timestamp: new Date().toISOString(),
      }
    );
    return res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getRecentActivity = async (req, res) => {
  const logPrefix = "[GET_RECENT_ACTIVITY]";

  console.log(
    `${logPrefix} ==================== GET RECENT ACTIVITY STARTED ====================`
  );

  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  console.log(
    `${logPrefix} User: ${user_id} | Step 1: Fetching recent activity for user`
  );

  try {
    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Querying user interactions (limit 10)`
    );
    const interactions = await UserInteraction.find({ user_id })
      .sort({ createdAt: -1 })
      .hint({ user_id: 1, createdAt: -1 }) // Use user date index
      .limit(10);

    console.log(
      `${logPrefix} User: ${user_id} | Step 3: Found ${interactions.length} recent interactions`
    );
    console.log(
      `${logPrefix} User: ${user_id} | ==================== GET RECENT ACTIVITY COMPLETED ====================`
    );
    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      data: interactions,
    });
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET RECENT ACTIVITY ERROR ====================`
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
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  likeArticle,
  dislikeArticle,
  saveArticle,
  shareArticle,
  getRecentActivity,
};
