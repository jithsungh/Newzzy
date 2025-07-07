const express = require("express");
const router = express.Router();
const articlesController = require("../controllers/articlesController");

const verifyJWT = require("../middlewares/verifyjwt.js");
const updateStreak = require("../middlewares/updateStreak.js");

router.get("/getarticlebyid", articlesController.getArticleById);
router.get(
  "/getlatesttrendingarticles",
  articlesController.getLatestTrendingArticles
);
router.get(
  "/getarticlebykeyword",
  verifyJWT,
  updateStreak,
  articlesController.getArticleByKeyword
);
router.get(
  "/getarticlebycategory",
  verifyJWT,
  updateStreak,
  articlesController.getArticleByCategory
);
router.get(
  "/getsavedarticles",
  verifyJWT,
  updateStreak,
  articlesController.getSavedArticles
);
router.get(
  "/getlikedarticles",
  verifyJWT,
  updateStreak,
  articlesController.getLikedArticles
);
router.get(
  "/getdislikedarticles",
  verifyJWT,
  updateStreak,
  articlesController.getDisLikedArticles
);
router.get("/getlatestarticles", articlesController.getLatestArticles);
router.get(
  "/getlikedarticleids",
  verifyJWT,
  updateStreak,
  articlesController.getLikedArticleIds
);
router.get(
  "/getdislikedarticleids",
  verifyJWT,
  updateStreak,
  articlesController.getDislikedArticleIds
);
router.get(
  "/getsavedarticleids",
  verifyJWT,
  updateStreak,
  articlesController.getSavedArticleIds
);
module.exports = router;
