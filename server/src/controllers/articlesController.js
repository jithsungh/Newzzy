const NewsArticle = require("../models/newsArticles");
const UserInteraction = require("../models/userInteractions");
const getLatestNewsArticles = require("../services/getNewsArticles");

const getArticleById = async (req, res) => {
  const logPrefix = "[GET_ARTICLE_BY_ID]";

  console.log(
    `${logPrefix} ==================== GET ARTICLE BY ID STARTED ====================`
  );

  try {
    const authHeader = req.headers["authorization"];
    const tokenToReturn = (authHeader && authHeader.split(" ")[1]) || "";
    const { article_id } = req.query;

    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | Step 1: Validating article ID: ${article_id}`
    );

    if (!article_id) {
      console.log(
        `${logPrefix} User: ${
          req.user?.id || "anonymous"
        } | Step 1 FAILED: Article ID not provided`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article ID is required",
      });
    }

    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | Step 2: Fetching article from database`
    );
    const article = await NewsArticle.findById(article_id);
    if (!article) {
      console.log(
        `${logPrefix} User: ${
          req.user?.id || "anonymous"
        } | Step 2 FAILED: Article not found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }

    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | Step 3: Article retrieved successfully`
    );
    res
      .status(200)
      .json({ success: true, AccessToken: tokenToReturn, article });
    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | ==================== GET ARTICLE BY ID COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | ==================== GET ARTICLE BY ID ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "anonymous"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const getLatestArticles = async (req, res) => {
  const logPrefix = "[GET_LATEST_ARTICLES]";

  console.log(
    `${logPrefix} ==================== GET LATEST ARTICLES STARTED ====================`
  );

  try {
    const authHeader = req.headers["authorization"];
    const tokenToReturn = (authHeader && authHeader.split(" ")[1]) || "";

    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | Step 1: Fetching latest 500 articles`
    );
    const n = 500;
    const articles = await getLatestNewsArticles(n);

    console.log(
      `${logPrefix} User: ${req.user?.id || "anonymous"} | Step 2: Retrieved ${
        articles.length
      } articles successfully`
    );
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      articles,
    });
    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | ==================== GET LATEST ARTICLES COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | ==================== GET LATEST ARTICLES ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "anonymous"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

// get latest trending articles
const getLatestTrendingArticles = async (req, res) => {
  const logPrefix = "[GET_TRENDING_ARTICLES]";

  console.log(
    `${logPrefix} ==================== GET TRENDING ARTICLES STARTED ====================`
  );

  try {
    const authHeader = req.headers["authorization"];
    const tokenToReturn = authHeader && authHeader.split(" ")[1];

    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | Step 1: Fetching trending articles (sorted by likes)`
    );
    const articles = await NewsArticle.find()
      .sort({ likes: -1, pubDate: -1 })
      .hint({ likes: -1, pubDate: -1 }) // Use trending index for performance
      .limit(200);

    console.log(
      `${logPrefix} User: ${req.user?.id || "anonymous"} | Step 2: Retrieved ${
        articles.length
      } trending articles successfully`
    );
    res
      .status(200)
      .json({ success: true, AccessToken: tokenToReturn, articles });
    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | ==================== GET TRENDING ARTICLES COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | ==================== GET TRENDING ARTICLES ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "anonymous"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const getArticleByKeyword = async (req, res) => {
  const logPrefix = "[GET_ARTICLE_BY_KEYWORD]";

  console.log(
    `${logPrefix} ==================== GET ARTICLE BY KEYWORD STARTED ====================`
  );

  try {
    const { keyword } = req.query;
    const tokenToReturn = res.locals.accessToken;

    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | Step 1: Searching for keyword: ${keyword}`
    );

    if (!keyword) {
      console.log(
        `${logPrefix} User: ${
          req.user?.id || "anonymous"
        } | Step 1 FAILED: Keyword not provided`
      );
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Keyword is required",
      });
    }

    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | Step 2: Fetching articles with keyword: ${keyword}`
    );
    const articles = await NewsArticle.find({ keywords: keyword })
      .sort({ pubDate: -1 })
      .hint({ keywords: 1, pubDate: -1 }); // Use keywords + pubDate index for performance

    if (articles.length === 0) {
      console.log(
        `${logPrefix} User: ${
          req.user?.id || "anonymous"
        } | Step 2 RESULT: No articles found for keyword: ${keyword}`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No articles found for this keyword",
      });
    }

    console.log(
      `${logPrefix} User: ${req.user?.id || "anonymous"} | Step 3: Found ${
        articles.length
      } articles for keyword: ${keyword}`
    );
    res
      .status(200)
      .json({ success: true, AccessToken: tokenToReturn, articles });
    console.log(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | ==================== GET ARTICLE BY KEYWORD COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "anonymous"
      } | ==================== GET ARTICLE BY KEYWORD ERROR ====================`
    );
    console.error(
      `${logPrefix} User: ${req.user?.id || "anonymous"} | Error details:`,
      {
        message: error.message,
        stack: error.stack,
        keyword: req.query.keyword,
        timestamp: new Date().toISOString(),
      }
    );
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const getArticleByCategory = async (req, res) => {
  getArticleByKeyword(req, res);
};

const getSavedArticles = async (req, res) => {
  const logPrefix = "[GET_SAVED_ARTICLES]";

  console.log(
    `${logPrefix} ==================== GET SAVED ARTICLES STARTED ====================`
  );

  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(
      `${logPrefix} User: ${user_id} | Step 1: Fetching saved articles for user`
    );

    const savedArticles = await UserInteraction.find({
      user_id,
      action: "save",
    })
      .populate("article_id")
      .sort({ createdAt: -1 })
      .hint({ user_id: 1, action: 1, createdAt: -1 }); // Use user action date index

    if (!savedArticles || savedArticles.length === 0) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 1 RESULT: No saved articles found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "no Saved articles",
      });
    }

    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Found ${savedArticles.length} saved articles`
    );
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      savedArticles: savedArticles,
    });
    console.log(
      `${logPrefix} User: ${user_id} | ==================== GET SAVED ARTICLES COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET SAVED ARTICLES ERROR ====================`
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
      message: "Internal server error",
    });
  }
};

const getLikedArticles = async (req, res) => {
  const logPrefix = "[GET_LIKED_ARTICLES]";

  console.log(
    `${logPrefix} ==================== GET LIKED ARTICLES STARTED ====================`
  );

  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(
      `${logPrefix} User: ${user_id} | Step 1: Fetching liked articles for user`
    );

    const likedArticles = await UserInteraction.find({
      user_id,
      action: "like",
    })
      .populate("article_id")
      .sort({ createdAt: -1 })
      .hint({ user_id: 1, action: 1, createdAt: -1 }); // Use user action date index

    if (!likedArticles || likedArticles.length === 0) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 1 RESULT: No liked articles found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "no liked articles",
      });
    }

    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Found ${likedArticles.length} liked articles`
    );
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      likedArticles: likedArticles,
    });
    console.log(
      `${logPrefix} User: ${user_id} | ==================== GET LIKED ARTICLES COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET LIKED ARTICLES ERROR ====================`
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
      message: "Internal server error",
    });
  }
};

const getDisLikedArticles = async (req, res) => {
  const logPrefix = "[GET_DISLIKED_ARTICLES]";

  console.log(
    `${logPrefix} ==================== GET DISLIKED ARTICLES STARTED ====================`
  );

  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(
      `${logPrefix} User: ${user_id} | Step 1: Fetching disliked articles for user`
    );

    const dislikedArticles = await UserInteraction.find({
      user_id,
      action: "dislike",
    })
      .populate("article_id")
      .sort({ createdAt: -1 })
      .hint({ user_id: 1, action: 1, createdAt: -1 }); // Use user action date index

    if (!dislikedArticles || dislikedArticles.length === 0) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 1 RESULT: No disliked articles found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "no disliked articles",
      });
    }

    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Found ${dislikedArticles.length} disliked articles`
    );
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      dislikedArticles: dislikedArticles,
    });
    console.log(
      `${logPrefix} User: ${user_id} | ==================== GET DISLIKED ARTICLES COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET DISLIKED ARTICLES ERROR ====================`
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
      message: "Internal server error",
    });
  }
};

const getLikedArticleIds = async (req, res) => {
  const logPrefix = "[GET_LIKED_ARTICLE_IDS]";

  console.log(
    `${logPrefix} ==================== GET LIKED ARTICLE IDS STARTED ====================`
  );

  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(
      `${logPrefix} User: ${user_id} | Step 1: Fetching liked article IDs for user`
    );

    const interactions = await UserInteraction.find({
      user_id,
      action: "like",
    })
      .sort({ createdAt: -1 })
      .hint({ user_id: 1, action: 1, createdAt: -1 }) // Use user action date index
      .select("article_id")
      .lean(); // returns plain JS objects

    if (interactions.length === 0) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 1 RESULT: No liked articles found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No liked articles",
      });
    }

    const likedArticleIds = interactions.map((i) => i.article_id);

    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Found ${likedArticleIds.length} liked article IDs`
    );
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      likedArticleIds,
    });
    console.log(
      `${logPrefix} User: ${user_id} | ==================== GET LIKED ARTICLE IDS COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET LIKED ARTICLE IDS ERROR ====================`
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
      message: "Server error",
      error: error.message,
    });
  }
};

const getDislikedArticleIds = async (req, res) => {
  const logPrefix = "[GET_DISLIKED_ARTICLE_IDS]";

  console.log(
    `${logPrefix} ==================== GET DISLIKED ARTICLE IDS STARTED ====================`
  );

  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(
      `${logPrefix} User: ${user_id} | Step 1: Fetching disliked article IDs for user`
    );

    const interactions = await UserInteraction.find({
      user_id,
      action: "dislike",
    })
      .sort({ createdAt: -1 })
      .hint({ user_id: 1, action: 1, createdAt: -1 }) // Use user action date index
      .select("article_id")
      .lean();

    if (interactions.length === 0) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 1 RESULT: No disliked articles found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No disliked articles",
      });
    }

    const dislikedArticleIds = interactions.map((i) => i.article_id);

    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Found ${dislikedArticleIds.length} disliked article IDs`
    );
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      dislikedArticleIds,
    });
    console.log(
      `${logPrefix} User: ${user_id} | ==================== GET DISLIKED ARTICLE IDS COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET DISLIKED ARTICLE IDS ERROR ====================`
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
      message: "Server error",
      error: error.message,
    });
  }
};

const getSavedArticleIds = async (req, res) => {
  const logPrefix = "[GET_SAVED_ARTICLE_IDS]";

  console.log(
    `${logPrefix} ==================== GET SAVED ARTICLE IDS STARTED ====================`
  );

  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    console.log(
      `${logPrefix} User: ${user_id} | Step 1: Fetching saved article IDs for user`
    );

    const interactions = await UserInteraction.find({
      user_id,
      action: "save",
    })
      .sort({ createdAt: -1 })
      .hint({ user_id: 1, action: 1, createdAt: -1 }) // Use user action date index
      .select("article_id")
      .lean();

    if (interactions.length === 0) {
      console.log(
        `${logPrefix} User: ${user_id} | Step 1 RESULT: No saved articles found`
      );
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No saved articles",
      });
    }

    const savedArticleIds = interactions.map((i) => i.article_id);

    console.log(
      `${logPrefix} User: ${user_id} | Step 2: Found ${savedArticleIds.length} saved article IDs`
    );
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      savedArticleIds,
    });
    console.log(
      `${logPrefix} User: ${user_id} | ==================== GET SAVED ARTICLE IDS COMPLETED ====================`
    );
  } catch (error) {
    console.error(
      `${logPrefix} User: ${
        req.user?.id || "unknown"
      } | ==================== GET SAVED ARTICLE IDS ERROR ====================`
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
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getArticleById,
  getLatestTrendingArticles,
  getArticleByKeyword,
  getArticleByCategory,
  getSavedArticles,
  getLikedArticles,
  getDisLikedArticles,
  getLatestArticles,
  getLikedArticleIds,
  getDislikedArticleIds,
  getSavedArticleIds,
};
