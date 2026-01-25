const { Story, Vote, Comment, User } = require('../models');
const { getPaginationData } = require('../utils/pagination');
const translationService = require('./translationService');

/**
 * Create a new story
 */
exports.createStory = async (storyData, userId) => {
    const originalText = storyData.text;
    let text = originalText;
    let originalLanguage = storyData.originalLanguage;

    // Detect and translate if needed
    if (originalText) {
        if (!originalLanguage) {
            // No language provided, use translateText to both detect and translate to English
            try {
                const result = await translationService.translateText(originalText, 'en');
                text = result.translation;
                originalLanguage = result.detectedSourceLanguage || 'en';

                // If the detected language IS English, the translation result is same as original
                // We don't need to do anything special here as text is already updated
            } catch (error) {
                console.error('Auto-detection/translation failed:', error);
                originalLanguage = 'en'; // Fallback
            }
        } else if (originalLanguage !== 'en') {
            // Language provided and it's not English, so translate
            try {
                const result = await translationService.translateText(originalText, 'en');
                text = result.translation;
            } catch (error) {
                console.error('Auto-translation failed:', error);
            }
        }
    }

    // Clean tags if any
    let tags = storyData.tags || [];
    if (typeof tags === 'string') {
        tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else if (Array.isArray(tags)) {
        tags = tags.map(tag => (typeof tag === 'string' ? tag.trim() : tag)).filter(tag => !!tag);
    }

    const story = await Story.create({
        ...storyData,
        text,
        originalText,
        tags,
        originalLanguage: originalLanguage || 'en',
        author: userId
    });
    return story;
};

/**
 * Get stories with filters and pagination
 */
exports.getStories = async (filters, page, limit, sort = '-createdAt', currentUserId = null) => {
    const query = {
        isDeleted: false,
        status: { $in: ['approved', 'flagged'] },
        ...(filters.country && { country: filters.country }),
        ...(filters.category && { category: filters.category }),
        ...(filters.author && { author: filters.author }),
        ...(filters.tag && { tags: filters.tag }), // Filter by tag
    };

    // Simplified Search Logic (Text and Tags only)
    if (filters.search) {
        const searchRegex = { $regex: filters.search, $options: 'i' };

        query.$or = [
            { text: searchRegex },
            { tags: searchRegex }
        ];
    }
    const total = await Story.countDocuments(query);

    // Create sort object
    let sortOption = { createdAt: -1 }; // Default: Latest
    if (sort === '-upvotes') {
        // Top Rated: Most likes, then most comments, then newest
        sortOption = { upvotes: -1, commentCount: -1, createdAt: -1 };
    } else if (sort === 'trending') {
        // Trending: Combination of votes and comments, then newest
        // This ensures posts with high engagement across both metrics appear first
        sortOption = { upvotes: -1, commentCount: -1, createdAt: -1 };
    } else if (sort === 'discussed') {
        // Most Discussed: Most comments, then most likes, then newest
        sortOption = { commentCount: -1, upvotes: -1, createdAt: -1 };
    } else if (sort === 'controversial') {
        // Controversial: High engagement on both sides (high up + high down)
        // For simplicity and performance, we'll sort by downvotes then upvotes
        sortOption = { downvotes: -1, upvotes: -1, createdAt: -1 };
    }

    let stories = await Story.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'username _id avatar')
        .populate('commentsCount')
        .lean({ virtuals: true });

    // Handle anonymity: Hide author details if isAnonymous is true
    stories = stories.map(story => {
        if (story.isAnonymous) {
            return {
                ...story,
                author: { _id: story.author?._id, username: 'Anonymous' } // Keep only ID for internal logic, hide username/avatar
            };
        }
        return story;
    });

    // Add userVote if currentUserId is provided
    if (currentUserId) {
        const storyIds = stories.map(s => s._id);
        const userVotes = await Vote.find({
            user: currentUserId,
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
    }

    return {
        stories,
        pagination: getPaginationData(page, limit, total)
    };
};

/**
 * Get single story by ID
 */
exports.getStoryById = async (id, currentUserId = null) => {
    const story = await Story.findOne({ _id: id, isDeleted: false })
        .populate('author', 'username _id avatar');

    if (!story) {
        throw new Error('Story not found');
    }

    if (currentUserId) {
        const vote = await Vote.findOne({ story: id, user: currentUserId });
        story.userVote = vote ? vote.voteType : null;
    }

    return story;
};

/**
 * Get story by share ID
 */
exports.getStoryByShareId = async (shareId, currentUserId = null) => {
    const story = await Story.findOne({ shareId, isDeleted: false })
        .populate('author', 'username _id avatar');

    if (!story) {
        throw new Error('Story not found');
    }

    const storyObj = story.toObject();

    // Mask author details if anonymous
    if (storyObj.isAnonymous) {
        storyObj.author = { _id: storyObj.author?._id, username: 'Anonymous' };
    }

    if (currentUserId) {
        const vote = await Vote.findOne({ story: storyObj._id, user: currentUserId });
        storyObj.userVote = vote ? vote.voteType : null;
    }

    return storyObj;
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
