const { Comment, Story } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationData } = require('../utils/pagination');

/**
 * @desc    Add a comment to a story
 * @route   POST /api/stories/:id/comments
 * @access  Private
 */
exports.addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const storyId = req.params.id;

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story || story.isDeleted) {
        return errorResponse(res, 'Story not found', 404);
    }

    const comment = await Comment.create({
        text,
        story: storyId,
        author: req.user.id
    });

    // Populate author details
    await comment.populate('author', 'username _id avatar');

    successResponse(res, comment, 'Comment added successfully', 201);
});

/**
 * @desc    Get comments for a story
 * @route   GET /api/stories/:id/comments
 * @access  Public
 */
exports.getComments = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const storyId = req.params.id;

    const total = await Comment.countDocuments({ story: storyId });
    const comments = await Comment.find({ story: storyId })
        .sort({ upvotes: -1, createdAt: -1 })
        .skip(((page || 1) - 1) * (limit || 20))
        .limit(limit || 20)
        .populate('author', 'username _id avatar');

    successResponse(res, {
        comments,
        pagination: getPaginationData(page, limit, total)
    });
});

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
exports.deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        return errorResponse(res, 'Comment not found', 404);
    }

    // Check ownership or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Not authorized to delete this comment', 403);
    }

    await comment.deleteOne();

    successResponse(res, null, 'Comment deleted successfully');
});
