const NewsArticle = require("../models/newsArticles");
const UserInteraction = require("../models/userInteractions");
const getLatestNewsArticles = require("../services/getNewsArticles");

const getArticleById = async (req, res) => {
  try {
   const authHeader = req.headers["authorization"];
    // console.log("Auth Header:", authHeader);
    const tokenToReturn = authHeader && authHeader.split(" ")[1] || "";
    const {article_id} = req.query;
    if (!article_id) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article ID is required",
      });
    }

    const article = await NewsArticle.findById(article_id);
    if (!article) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Article not found",
      });
    }
    res
      .status(200)
      .json({ success: true, AccessToken: tokenToReturn, article });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const getLatestArticles = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    // console.log("Auth Header:", authHeader);
    const tokenToReturn = authHeader && authHeader.split(" ")[1] || "";

    const n = 500;
    const articles = await getLatestNewsArticles(n);

    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      articles,
    });
  } catch (error) {
    console.error("Error fetching latest articles:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

// get latest trending articles
const getLatestTrendingArticles = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    // console.log("Auth Header:", authHeader);
    const tokenToReturn = authHeader && authHeader.split(" ")[1];

    const articles = await NewsArticle.find()
      .sort({ likes: -1, createdAt: -1 })
      .limit(200);
    res
      .status(200)
      .json({ success: true, AccessToken: tokenToReturn, articles });
  } catch (error) {
    console.error("Error fetching trending articles:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const getArticleByKeyword = async (req, res) => {
  try {
    const { keyword } = req.query;
    console.log("Search Keyword", keyword);
    const tokenToReturn = res.locals.accessToken;
    if (!keyword) {
      return res.status(400).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "Keyword is required",
      });
    }
    const articles = await NewsArticle.find({ keywords: keyword }).sort({
      createdAt: -1,
    });
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No articles found for this keyword",
      });
    }
    res
      .status(200)
      .json({ success: true, AccessToken: tokenToReturn, articles });
  } catch (error) {
    console.error("Error fetching articles by keyword:", error);
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
  try {
    const user_id = req.user.id; // Assuming user ID is stored in req.user
    const tokenToReturn = res.locals.accessToken;
    const savedArticles = await UserInteraction.find({
      user_id,
      action: "save",
    })
      .populate("article_id")
      .sort({ createdAt: -1 });
    if (!savedArticles) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "no Saved articles",
      });
    }
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      savedArticles: savedArticles,
    });
  } catch (error) {
    console.error("Error fetching saved articles:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const getLikedArticles = async (req, res) => {
  try {
    const user_id = req.user.id; // Assuming user ID is stored in req.user
    const tokenToReturn = res.locals.accessToken;
    const likedArticles = await UserInteraction.find({
      user_id,
      action: "like",
    })
      .populate("article_id")
      .sort({ createdAt: -1 });
    if (!likedArticles) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "no liked articles",
      });
    }
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      likedArticles: likedArticles,
    });
  } catch (error) {
    console.error("Error fetching liked articles:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const getDisLikedArticles = async (req, res) => {
  try {
    const user_id = req.user.id; // Assuming user ID is stored in req.user
    const tokenToReturn = res.locals.accessToken;
    const dislikedArticles = await UserInteraction.find({
      user_id,
      action: "dislike",
    })
      .populate("article_id")
      .sort({ createdAt: -1 });
    if (!dislikedArticles) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "no disliked articles",
      });
    }
    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      dislikedArticles: dislikedArticles,
    });
  } catch (error) {
    console.error("Error fetching disliked articles:", error);
    res.status(500).json({
      success: false,
      AccessToken: tokenToReturn,
      message: "Internal server error",
    });
  }
};

const getLikedArticleIds = async (req, res) => {
  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    const interactions = await UserInteraction.find({
      user_id,
      action: "like",
    })
      .sort({ createdAt: -1 })
      .select("article_id")
      .lean(); // returns plain JS objects

    if (interactions.length === 0) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No liked articles",
      });
    }

    const likedArticleIds = interactions.map(i => i.article_id);

    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      likedArticleIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Server error",
      error: error.message,
    });
  }
};

const getDislikedArticleIds = async (req, res) => {
  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    const interactions = await UserInteraction.find({
      user_id,
      action: "dislike",
    })
      .sort({ createdAt: -1 })
      .select("article_id")
      .lean();

    if (interactions.length === 0) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No disliked articles",
      });
    }

    const dislikedArticleIds = interactions.map(i => i.article_id);

    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      dislikedArticleIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      AccessToken: res.locals.accessToken,
      message: "Server error",
      error: error.message,
    });
  }
};


const getSavedArticleIds = async (req, res) => {
  try {
    const user_id = req.user.id;
    const tokenToReturn = res.locals.accessToken;

    const interactions = await UserInteraction.find({
      user_id,
      action: "save",
    })
      .sort({ createdAt: -1 })
      .select("article_id")
      .lean();

    if (interactions.length === 0) {
      return res.status(404).json({
        success: false,
        AccessToken: tokenToReturn,
        message: "No saved articles",
      });
    }

    const savedArticleIds = interactions.map(i => i.article_id);

    res.status(200).json({
      success: true,
      AccessToken: tokenToReturn,
      savedArticleIds,
    });
  } catch (error) {
    console.error(error);
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
