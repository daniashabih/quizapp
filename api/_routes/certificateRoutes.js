const express = require('express');
const router = express.Router();
const certificateController = require('../_controllers/certificateController');
const { authMiddleware } = require('../_middlewares/authMiddleware');

// Public verification endpoint
router.get('/verify/:id', certificateController.verifyCertificate);

// User certificates (authenticated)
router.get('/', authMiddleware, certificateController.getMyCertificates);
router.get('/my', authMiddleware, certificateController.getMyCertificates);

module.exports = router;
