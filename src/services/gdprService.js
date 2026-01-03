const { User, Story, Comment, Vote } = require('../models');

/**
 * Aggregate all user data for export
 */
exports.aggregateUserData = async (userId) => {
    const [user, stories, comments, votes] = await Promise.all([
        User.findById(userId),
        Story.find({ author: userId }),
        Comment.find({ author: userId }),
        Vote.find({ user: userId })
    ]);

    return {
        profile: user,
        stories,
        comments,
        votes,
        metadata: {
            exportedAt: new Date(),
            storyCount: stories.length,
            commentCount: comments.length,
            voteCount: votes.length
        }
    };
};

/**
 * Permanently delete user account and associated data
 */
exports.deleteAccount = async (userId) => {
    // Start session for transaction if using replica set (not always available in dev)
    // For this implementation, we'll do cascading delete manually without transaction for wider compatibility

    // 1. Delete Votes
    await Vote.deleteMany({ user: userId });

    // 2. Delete Comments
    await Comment.deleteMany({ author: userId });

    // 3. Mark Stories as deleted (or hard delete)
    // We'll hard delete for GDPR "Right to Erasure"
    await Story.deleteMany({ author: userId });

    // 4. Delete User
    await User.findByIdAndDelete(userId);

    return true;
};
