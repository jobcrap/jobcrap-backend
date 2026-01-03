const { Vote, Story, Comment } = require('../models');
const { VOTE_TYPES } = require('../constants');

/**
 * Handle user vote on a story or comment
 * @param {string} targetId - ID of the story or comment
 * @param {string} userId - ID of the user voting
 * @param {string} voteType - Type of vote (upvote/downvote)
 * @param {string} targetType - 'story' or 'comment'
 */
exports.handleVote = async (targetId, userId, voteType, targetType = 'story') => {
    const Model = targetType === 'story' ? Story : Comment;
    const voteQuery = targetType === 'story' ? { story: targetId, user: userId } : { comment: targetId, user: userId };

    // Check if vote already exists
    let vote = await Vote.findOne(voteQuery);
    const target = await Model.findById(targetId);

    if (!target) throw new Error(`${targetType === 'story' ? 'Story' : 'Comment'} not found`);

    if (vote) {
        // If voting same type, remove vote (toggle)
        if (vote.voteType === voteType) {
            await vote.deleteOne();

            // Update target counts
            if (voteType === VOTE_TYPES.UPVOTE) {
                target.upvotes = Math.max(0, target.upvotes - 1);
            } else {
                target.downvotes = Math.max(0, target.downvotes - 1);
            }
        } else {
            // Changing vote type
            const oldType = vote.voteType;
            vote.voteType = voteType;
            await vote.save();

            // Update target counts
            if (oldType === VOTE_TYPES.UPVOTE) {
                target.upvotes = Math.max(0, target.upvotes - 1);
                target.downvotes += 1;
            } else {
                target.downvotes = Math.max(0, target.downvotes - 1);
                target.upvotes += 1;
            }
        }
    } else {
        // New vote
        const voteData = { user: userId, voteType };
        if (targetType === 'story') {
            voteData.story = targetId;
        } else {
            voteData.comment = targetId;
        }

        await Vote.create(voteData);

        if (voteType === VOTE_TYPES.UPVOTE) {
            target.upvotes += 1;
        } else {
            target.downvotes += 1;
        }
    }

    await target.save();
    return {
        vote: vote ? (vote.voteType === voteType ? null : voteType) : voteType,
        stats: {
            upvotes: target.upvotes,
            downvotes: target.downvotes
        }
    };
};

/**
 * Get user's vote for a story or comment
 */
exports.getUserVote = async (targetId, userId, targetType = 'story') => {
    const voteQuery = targetType === 'story' ? { story: targetId, user: userId } : { comment: targetId, user: userId };
    const vote = await Vote.findOne(voteQuery);
    return vote ? vote.voteType : null;
};
