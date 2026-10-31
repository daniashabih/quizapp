const express = require('express');
const router = express.Router();
const gameController = require('../_controllers/gameController');

// Public & user game routes
router.get('/', gameController.getGames);
router.get('/user/stats', gameController.getUserGameStats);
router.get('/:slug', gameController.getGameDetails);
router.post('/:slug/score', gameController.submitScore);
router.post('/:slug/favorite', gameController.toggleFavorite);

module.exports = router;
