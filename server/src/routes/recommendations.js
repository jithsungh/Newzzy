const express = require('express');
const router = express.Router();

const { refreshRecommendations } = require('../controllers/refreshRecommendations');
const { getRecommendations, deleteOldRecommendations, markAsRead } = require('../controllers/recommendationsController');

const VerifyJWT = require('../middlewares/verifyjwt.js');


router.get('/get', VerifyJWT, getRecommendations);
router.post('/refresh', VerifyJWT,  refreshRecommendations); 
router.delete('/delete', VerifyJWT, deleteOldRecommendations);
router.post('/markasread', VerifyJWT, markAsRead);

module.exports = router;

