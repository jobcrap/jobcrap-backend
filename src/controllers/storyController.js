const storyService = require('../services/storyService');
const voteService = require('../services/voteService');
const { Story, Vote } = require('../models');
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
    const { page, limit, sort, country, category, author, tag, search } = req.query;
    const filters = { country, category, author, tag, search };

    const result = await storyService.getStories(filters, page, limit, sort, req.user?._id);

    successResponse(res, result);
});

/**
 * @desc    Get single story by ID
 * @route   GET /api/stories/:id
 * @access  Public
 */
exports.getStoryById = asyncHandler(async (req, res) => {
    const story = await storyService.getStoryById(req.params.id, req.user?._id);

    successResponse(res, story);
});

/**
 * @desc    Get story by Share ID
 * @route   GET /api/stories/share/:shareId
 * @access  Public
 */
exports.getStoryByShareId = asyncHandler(async (req, res) => {
    const story = await storyService.getStoryByShareId(req.params.shareId, req.user?._id);

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
    const allowedUpdates = ['profession', 'country', 'category', 'text', 'triggerWarnings', 'isAnonymous'];
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

    const storyObj = story.toObject();
    if (storyObj.isAnonymous) {
        storyObj.author = { _id: storyObj.author?._id, username: 'Anonymous' };
    }

    successResponse(res, storyObj, 'Story updated successfully');
});

/**
 * @desc    Get current user's stories
 * @route   GET /api/stories/my-stories
 * @access  Private
 */
exports.getMyStories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    console.log('Fetching My Stories. User ID:', req.user?._id);

    let stories = await Story.find({
        author: req.user._id,
        isDeleted: false
    })
        .populate('author', 'username avatar _id')
        .populate('commentsCount')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean({ virtuals: true });

    // Attach userVote (user always votes on their own stories usually, but let's be consistent)
    const storyIds = stories.map(s => s._id);
    const userVotes = await Vote.find({
        user: req.user._id,
        story: { $in: storyIds }
    });

    const voteMap = userVotes.reduce((acc, vote) => {
        acc[vote.story.toString()] = vote.voteType;
        return acc;
    }, {});

    stories = stories.map(story => ({
        ...story,
        userVote: voteMap[story._id.toString()] || null
    }));

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

/**
 * @desc    Translate story text to target language
 * @route   POST /api/stories/translate
 * @access  Public
 */
exports.translateText = asyncHandler(async (req, res) => {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
        return errorResponse(res, 'Text and target language are required', 400);
    }

    const translationService = require('../services/translationService');
    const translated = await translationService.translateText(text, targetLanguage);

    successResponse(res, { translated, targetLanguage });
});
