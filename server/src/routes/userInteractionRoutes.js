const express = require('express');
const router = express.Router();

const {likeArticle, dislikeArticle, saveArticle, shareArticle} = require('../controllers/userInteractionController');

const VerifyJWT = require('../middlewares/verifyjwt.js');

router.post('/like', VerifyJWT, likeArticle);
router.post('/dislike', VerifyJWT, dislikeArticle);
router.post('/save', VerifyJWT, saveArticle);
router.post('/share', VerifyJWT, shareArticle);

module.exports = router;