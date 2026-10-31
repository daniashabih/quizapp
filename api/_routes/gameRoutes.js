const express = require('express');
const router = express.Router();
const gameController = require('../_controllers/gameController');

// Public & user game routes
router.get('/', gameController.getGames);
router.get('/daily/challenge', gameController.getDailyChallenge);
router.get('/user/stats', gameController.getUserGameStats);
router.get('/leaderboard/:slug', gameController.getLeaderboard);
router.get('/:slug', gameController.getGameDetails);
router.get('/:slug/challenges', gameController.getChallenges);
router.post('/:slug/verify', gameController.verifyChallenge);
router.post('/:slug/score', gameController.submitScore);
router.post('/:slug/favorite', gameController.toggleFavorite);

module.exports = router;
