const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/commentController');
const { authenticate } = require('../../middleware/authMiddleware');

const voteController = require('../../controllers/voteController');

router.post('/:id/vote', authenticate, voteController.voteOnComment);
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;
