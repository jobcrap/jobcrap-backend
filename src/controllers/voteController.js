const voteService = require('../services/voteService');
const { successResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Vote on a story (Upvote/Downvote)
 * @route   POST /api/stories/:id/vote
 * @access  Private
 */
exports.voteOnStory = asyncHandler(async (req, res) => {
    const { voteType } = req.body;
    const storyId = req.params.id;
    const userId = req.user.id;

    const result = await voteService.handleVote(storyId, userId, voteType, 'story');

    successResponse(res, result, 'Vote registered successfully');
});

/**
 * @desc    Vote on a comment (Upvote/Downvote)
 * @route   POST /api/comments/:id/vote
 * @access  Private
 */
exports.voteOnComment = asyncHandler(async (req, res) => {
    const { voteType } = req.body;
    const commentId = req.params.id;
    const userId = req.user.id;

    const result = await voteService.handleVote(commentId, userId, voteType, 'comment');

    successResponse(res, result, 'Vote registered successfully');
});

/**
 * @desc    Get votes for a story (stats)
 * @route   GET /api/stories/:id/votes
 * @access  Public
 */
exports.getStoryVotes = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const story = await require('../models').Story.findById(id).select('upvotes downvotes');

    if (!story) {
        throw new Error('Story not found');
    }

    successResponse(res, {
        upvotes: story.upvotes,
        downvotes: story.downvotes,
        netVotes: story.upvotes - story.downvotes
    });
});
