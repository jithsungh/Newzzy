const express = require("express");
const router = express.Router();

const {
  likeArticle,
  dislikeArticle,
  saveArticle,
  shareArticle,
  getRecentActivity,
} = require("../controllers/userInteractionController");

const verifyJWT = require("../middlewares/verifyjwt.js");
const updateStreak = require("../middlewares/updateStreak.js");

router.post("/like", verifyJWT, updateStreak, likeArticle);
router.post("/dislike", verifyJWT, updateStreak, dislikeArticle);
router.post("/save", verifyJWT, updateStreak, saveArticle);
router.post("/share", verifyJWT, updateStreak, shareArticle);
router.get("/recentactivity", verifyJWT, updateStreak, getRecentActivity);

module.exports = router;
