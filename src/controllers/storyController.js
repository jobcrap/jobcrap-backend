const storyService = require('../services/storyService');
const voteService = require('../services/voteService');
const Story = require('../models/Story');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new story
 * @route   POST /api/stories
 * @access  Private
 */
exports.createStory = asyncHandler(async (req, res) => {
    const storyData = { ...req.body };

    // Set status based on trigger warnings
    if (storyData.triggerWarnings && storyData.triggerWarnings.length > 0) {
        storyData.status = 'flagged'; // Needs admin review
    } else {
        storyData.status = 'approved'; // No review needed
    }

    const story = await storyService.createStory(storyData, req.user._id);

    successResponse(res, story, 'Story created successfully', 201);
});

/**
 * @desc    Get all stories with filters
 * @route   GET /api/stories
 * @access  Public
 */
exports.getAllStories = asyncHandler(async (req, res) => {
    const { page, limit, sort, country, category, author } = req.query;
    const filters = { country, category, author };

    const result = await storyService.getStories(filters, page, limit, sort);

    successResponse(res, result);
});

/**
 * @desc    Get single story by ID
 * @route   GET /api/stories/:id
 * @access  Public
 */
exports.getStoryById = asyncHandler(async (req, res) => {
    const story = await storyService.getStoryById(req.params.id);

    // If user is logged in, attach their vote
    let userVote = null;
    if (req.user) {
        userVote = await voteService.getUserVote(story._id, req.user._id);
    }

    // story is a Mongoose document here
    const storyObj = story.toObject();
    storyObj.userVote = userVote;

    successResponse(res, storyObj);
});

/**
 * @desc    Get story by Share ID
 * @route   GET /api/stories/share/:shareId
 * @access  Public
 */
exports.getStoryByShareId = asyncHandler(async (req, res) => {
    const story = await storyService.getStoryByShareId(req.params.shareId);
    successResponse(res, story);
});

/**
 * @desc    Delete a story
 * @route   DELETE /api/stories/:id
 * @access  Private
 */
exports.deleteStory = asyncHandler(async (req, res) => {
    const story = await storyService.getStoryById(req.params.id);

    // Check ownership (or admin)
    if (story.author._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Not authorized to delete this story', 403);
    }

    await storyService.deleteStory(req.params.id);

    successResponse(res, null, 'Story deleted successfully');
});

/**
 * @desc    Update a story
 * @route   PUT /api/stories/:id
 * @access  Private (Owner only)
 */
exports.updateStory = asyncHandler(async (req, res) => {
    const story = await storyService.getStoryById(req.params.id);

    // Check ownership
    if (story.author._id.toString() !== req.user.id) {
        return errorResponse(res, 'Not authorized to update this story', 403);
    }

    // Only allow updating certain fields
    const allowedUpdates = ['profession', 'country', 'category', 'text', 'triggerWarnings'];
    const updates = {};

    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    // If adding trigger warnings, set status to flagged
    if (updates.triggerWarnings && updates.triggerWarnings.length > 0) {
        updates.status = 'flagged';
    } else if (updates.triggerWarnings && updates.triggerWarnings.length === 0) {
        // If removing all trigger warnings, approve
        updates.status = 'approved';
    }

    // Update the story
    Object.assign(story, updates);
    await story.save();

    successResponse(res, story, 'Story updated successfully');
});

/**
 * @desc    Get current user's stories
 * @route   GET /api/stories/my-stories
 * @access  Private
 */
exports.getMyStories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    console.log('Fetching My Stories. User ID:', req.user?._id);

    const stories = await Story.find({
        author: req.user._id,
        isDeleted: false
    })
        .populate('author', 'username avatar _id')
        .populate('commentsCount')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean({ virtuals: true });

    const total = await Story.countDocuments({
        author: req.user._id,
        isDeleted: false
    });

    successResponse(res, {
        stories,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalStories: total,
            hasMore: page * limit < total
        }
    });
});
