const express = require('express');
const rateLimit = require('express-rate-limit');
const { submitContactMessage } = require('../_controllers/contactController');

const router = express.Router();
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many contact requests. Please try again after 15 minutes.'
    }
});

router.post('/', contactLimiter, submitContactMessage);

module.exports = router;
