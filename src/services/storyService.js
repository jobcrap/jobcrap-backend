const { Story, Vote, Comment } = require('../models');
const { getPaginationData } = require('../utils/pagination');
const translationService = require('./translationService');

/**
 * Create a new story
 */
exports.createStory = async (storyData, userId) => {
    // Detect original language if not provided
    let originalLanguage = storyData.originalLanguage;
    if (!originalLanguage && storyData.text) {
        originalLanguage = await translationService.detectLanguage(storyData.text);
    }

    const story = await Story.create({
        ...storyData,
        originalLanguage: originalLanguage || 'en',
        author: userId
    });
    return story;
};

/**
 * Get stories with filters and pagination
 */
exports.getStories = async (filters, page, limit, sort = '-createdAt') => {
    const query = {
        isDeleted: false, // Keep existing filter for non-deleted stories
        status: { $in: ['approved', 'flagged'] }, // Show both approved and flagged posts
        ...(filters.country && { country: filters.country }),
        ...(filters.category && { category: filters.category }),
        ...(filters.author && { author: filters.author })
    };
    const total = await Story.countDocuments(query);

    // Create sort object
    let sortOption = { createdAt: -1 }; // Default new
    if (sort === '-upvotes') {
        sortOption = { upvotes: -1 };
    } else if (sort === 'controversial') {
        // controversial: posts with high activity (up + down)
        sortOption = { upvotes: -1, downvotes: -1 };
    }
    const stories = await Story.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username _id') // Don't expose sensitive fields
        .populate('commentsCount') // Populate virtual comments count
        .lean({ virtuals: true }); // Enable virtuals in lean results

    return {
        stories,
        pagination: getPaginationData(page, limit, total)
    };
};

/**
 * Get single story by ID
 */
exports.getStoryById = async (id) => {
    const story = await Story.findOne({ _id: id, isDeleted: false })
        .populate('author', 'username _id');

    if (!story) {
        throw new Error('Story not found');
    }

    return story;
};

/**
 * Get story by share ID
 */
exports.getStoryByShareId = async (shareId) => {
    const story = await Story.findOne({ shareId, isDeleted: false })
        .populate('author', 'username _id');

    if (!story) {
        throw new Error('Story not found');
    }

    return story;
};

/**
 * Delete story (verify ownership first in controller)
 */
exports.deleteStory = async (storyId) => {
    const story = await Story.findById(storyId);
    if (!story) throw new Error('Story not found');

    // Soft delete
    story.isDeleted = true;
    await story.save();

    return true;
};
