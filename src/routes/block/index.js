const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const blockController = require('../../controllers/blockController');

// All routes require authentication
router.use(authenticate);

// GET /api/block - Get all blocked users
router.get('/', blockController.getBlockedUsers);

// POST /api/block/:userId - Block a user
router.post('/:userId', blockController.blockUser);

// DELETE /api/block/:userId - Unblock a user
router.delete('/:userId', blockController.unblockUser);

module.exports = router;
