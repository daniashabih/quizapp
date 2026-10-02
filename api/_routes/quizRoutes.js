const express = require('express');
const router = express.Router();
const quizController = require('../_controllers/quizController');
const { authMiddleware } = require('../_middlewares/authMiddleware');

router.post('/submit', authMiddleware, quizController.submitQuiz);

module.exports = router;
