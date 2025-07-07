const express = require("express");
const router = express.Router();

const {
  refreshRecommendations,
} = require("../controllers/refreshRecommendations");
const {
  getRecommendations,
  deleteOldRecommendations,
  markAsRead,
} = require("../controllers/recommendationsController");

const verifyJWT = require("../middlewares/verifyjwt.js");
const updateStreak = require("../middlewares/updateStreak.js");

router.get("/get", verifyJWT, updateStreak, getRecommendations);
router.post("/refresh", verifyJWT, updateStreak, refreshRecommendations);
router.delete("/delete", verifyJWT, updateStreak, deleteOldRecommendations);
router.post("/markasread", verifyJWT, updateStreak, markAsRead);

module.exports = router;
