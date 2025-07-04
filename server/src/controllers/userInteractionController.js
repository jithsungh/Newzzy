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
  const { article_id } = req.body;
  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  try {
    // Fetch article, user, and existing interaction in parallel
    const [article, user, existingLike, existingDislike] = await Promise.all([
      NewsArticle.findById(article_id),
      User.findById(user_id),
      UserInteraction.findOne({ user_id, article_id, action: "like" }),
      UserInteraction.findOne({ user_id, article_id, action: "dislike" }),
    ]);

    if (!article) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User not found",
      });
    }

    if (!Array.isArray(article.keywords) || article.keywords.length === 0) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article has no keywords",
      });
    }

    // Case 1: If already liked, remove like
    if (existingLike) {
      await Promise.all([
        UserInteraction.deleteOne({ user_id, article_id, action: "like" }),
        decrementInterest(user, article.keywords),
      ]);

      article.likes = Math.max(0, article.likes - 1);
      await article.save();

      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Article unliked",
      });
    }

    // Case 2: Remove "dislike" if it exists
    if (existingDislike) {
      await UserInteraction.deleteOne({
        user_id,
        article_id,
        action: "dislike",
      });
    }

    // Case 3: Add like interaction and update interests
    await Promise.all([
      incrementInterest(user, article.keywords),
      new UserInteraction({ user_id, article_id, action: "like" }).save(),
    ]);

    article.likes += 1;
    await article.save();

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Article liked and interests updated",
    });
  } catch (error) {
    console.error("Error in likeArticle:", error);
    return res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const dislikeArticle = async (req, res) => {
  const { article_id } = req.body;
  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  try {
    // Parallel fetch: article, user, existing interactions
    const [article, user, existingDislike, existingLike] = await Promise.all([
      NewsArticle.findById(article_id),
      User.findById(user_id),
      UserInteraction.findOne({ user_id, article_id, action: "dislike" }),
      UserInteraction.findOne({ user_id, article_id, action: "like" }),
    ]);

    if (!article) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User not found",
      });
    }

    const keywords = article.keywords || [];

    // Case 1: Already disliked → undo it
    if (existingDislike) {
      await Promise.all([
        UserInteraction.deleteOne({ user_id, article_id, action: "dislike" }),
        incrementInterest(user, keywords),
      ]);

      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Article undisliked",
      });
    }

    // Case 2: Previously liked → undo like and decrement likes count
    if (existingLike) {
      article.likes = Math.max(0, article.likes - 1);
      await Promise.all([
        UserInteraction.deleteOne({ user_id, article_id, action: "like" }),
        article.save(),
      ]);
    }

    // Case 3: Add dislike + update user interests
    await Promise.all([
      decrementInterest(user, keywords),
      new UserInteraction({ user_id, article_id, action: "dislike" }).save(),
    ]);

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Article disliked",
    });
  } catch (error) {
    console.error("Error in dislikeArticle:", error);
    return res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const saveArticle = async (req, res) => {
  const { article_id } = req.body;
  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  try {
    // Parallel fetch: article, user, existing "save" interaction
    const [article, user, existingSave] = await Promise.all([
      NewsArticle.findById(article_id),
      User.findById(user_id),
      UserInteraction.findOne({ user_id, article_id, action: "save" }),
    ]);

    if (!article) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User not found",
      });
    }

    const keywords = article.keywords || [];

    // Case 1: Already saved → unsave
    if (existingSave) {
      await Promise.all([
        UserInteraction.deleteOne({ user_id, article_id, action: "save" }),
        decrementInterest(user, keywords),
      ]);

      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Article unsaved",
      });
    }

    // Case 2: Not yet saved → save and update interests
    await Promise.all([
      incrementInterest(user, keywords),
      new UserInteraction({ user_id, article_id, action: "save" }).save(),
    ]);

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Article saved",
    });
  } catch (error) {
    console.error("Error in saveArticle:", error);
    return res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const shareArticle = async (req, res) => {
  const { article_id } = req.body;
  const user_id = req.user.id;
  const tokenToReturn = res.locals.accessToken;

  try {
    // Fetch article, user, and existing interaction in parallel
    const [article, user, existingShare] = await Promise.all([
      NewsArticle.findById(article_id),
      User.findById(user_id),
      UserInteraction.findOne({ user_id, article_id, action: "share" }),
    ]);

    if (!article) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "User not found",
      });
    }

    const keywords = article.keywords || [];

    if (keywords.length === 0) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article has no keywords",
      });
    }

    // Case 1: Interaction already exists → update timestamp
    if (existingShare) {
      await UserInteraction.updateOne(
        { user_id, article_id, action: "share" },
        { $set: { updatedAt: new Date() } }
      );

      return res.status(200).json({
        success: true,
        AccessToken: tokenToReturn,
        message: "Share interaction updated",
      });
    }

    // Case 2: No interaction yet → add share + update interest
    await Promise.all([
      incrementInterest(user, keywords),
      new UserInteraction({ user_id, article_id, action: "share" }).save(),
    ]);

    return res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      message: "Article shared and interests updated",
    });
  } catch (error) {
    console.error("Error in shareArticle:", error);
    return res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
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
};
