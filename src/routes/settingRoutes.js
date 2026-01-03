const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', settingController.getSettings);
router.get('/:key', settingController.getSettings);

// Admin only routes
router.put('/:key', authenticate, isAdmin, settingController.updateSetting);

module.exports = router;
