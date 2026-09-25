const express = require('express');
const router = express.Router();
const attemptController = require('../_controllers/attemptController');
const authMiddleware = require('../_middlewares/authMiddleware');

// All attempt routes require authentication
router.use(authMiddleware);

router.post('/start', attemptController.startOrResumeAttempt);
router.get('/in-progress', attemptController.getInProgressAttempts);
router.get('/:id', attemptController.getAttemptById);
router.put('/:id', attemptController.updateAttemptProgress);
router.post('/:id', attemptController.updateAttemptProgress);
router.post('/:id/complete', attemptController.completeAttempt);
router.delete('/:id', attemptController.discardAttempt);

module.exports = router;
