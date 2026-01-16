const express = require('express');
const router = express.Router();
const storyController = require('../../controllers/storyController');
const voteController = require('../../controllers/voteController');
const commentController = require('../../controllers/commentController');
const { authenticate, optionalAuth } = require('../../middleware/authMiddleware');
const { validateStory, validateComment, validateVote } = require('../../middleware/validationMiddleware');
const { createStoryLimiter } = require('../../middleware/rateLimitMiddleware');

// Story Routes
router.route('/')
    .post(authenticate, createStoryLimiter, validateStory, storyController.createStory)
    .get(optionalAuth, storyController.getAllStories);

// My Stories Route
router.get('/my-stories', authenticate, storyController.getMyStories);

router.get('/share/:shareId', optionalAuth, storyController.getStoryByShareId);

router.route('/:id')
    .get(optionalAuth, storyController.getStoryById)
    .put(authenticate, validateStory, storyController.updateStory)
    .delete(authenticate, storyController.deleteStory);

// Interaction Routes (Nested)
router.route('/:id/vote')
    .post(authenticate, validateVote, voteController.voteOnStory);

router.route('/:id/votes')
    .get(voteController.getStoryVotes);

router.route('/:id/comments')
    .post(authenticate, validateComment, commentController.addComment)
    .get(optionalAuth, commentController.getComments);

// Translation Route
router.post('/translate', storyController.translateText);

// Report Route
const reportController = require('../../controllers/reportController');
router.post('/:id/report', authenticate, reportController.createReport);

module.exports = router;
