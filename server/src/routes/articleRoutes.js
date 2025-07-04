const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articlesController');

const VerifyJWT = require("../middlewares/verifyjwt.js");
const verifyJWT = require('../middlewares/verifyjwt.js');

router.get('/getarticlebyid', articlesController.getArticleById);
router.get('/getlatesttrendingarticles',articlesController.getLatestTrendingArticles);
router.get('/getarticlebykeyword', VerifyJWT, articlesController.getArticleByKeyword);
router.get('/getarticlebycategory', VerifyJWT, articlesController.getArticleByCategory);
router.get('/getsavedarticles', VerifyJWT, articlesController.getSavedArticles);
router.get('/getlikedarticles', VerifyJWT, articlesController.getLikedArticles);
router.get('/getdislikedarticles', VerifyJWT, articlesController.getDisLikedArticles);
router.get('/getlatestarticles',articlesController.getLatestArticles);
router.get('/getlikedarticleids',verifyJWT,articlesController.getLikedArticleIds);
router.get('/getdislikedarticleids',verifyJWT,articlesController.getDislikedArticleIds);
router.get('/getsavedarticleids',verifyJWT,articlesController.getSavedArticleIds);
module.exports = router;
