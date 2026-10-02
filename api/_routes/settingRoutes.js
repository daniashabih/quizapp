const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../_controllers/settingController');
const { authMiddleware, adminMiddleware } = require('../_middlewares/authMiddleware');

// Public endpoint: Both React and Flutter read settings
router.get('/', getSettings);

// Admin-only endpoint: Update settings
router.put('/', authMiddleware, adminMiddleware, updateSettings);

module.exports = router;
