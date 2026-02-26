const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Block a user
 * @route   POST /api/block/:userId
 * @access  Private
 */
exports.blockUser = asyncHandler(async (req, res) => {
    const userIdToBlock = req.params.userId;
    const currentUser = req.user;

    // Prevent self-blocking
    if (userIdToBlock === currentUser._id.toString()) {
        return errorResponse(res, 'You cannot block yourself', 400);
    }

    // Check if user to block exists
    const userToBlock = await User.findById(userIdToBlock);
    if (!userToBlock) {
        return errorResponse(res, 'User not found', 404);
    }

    // Check if already blocked
    if (currentUser.blockedUsers && currentUser.blockedUsers.map(id => id.toString()).includes(userIdToBlock)) {
        return errorResponse(res, 'User is already blocked', 400);
    }

    // Add to blocked list
    await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { blockedUsers: userIdToBlock }
    });

    successResponse(res, null, 'User blocked successfully');
});

/**
 * @desc    Unblock a user
 * @route   DELETE /api/block/:userId
 * @access  Private
 */
exports.unblockUser = asyncHandler(async (req, res) => {
    const userIdToUnblock = req.params.userId;
    const currentUser = req.user;

    // Check if user is actually blocked
    if (!currentUser.blockedUsers || !currentUser.blockedUsers.map(id => id.toString()).includes(userIdToUnblock)) {
        return errorResponse(res, 'User is not blocked', 400);
    }

    // Remove from blocked list
    await User.findByIdAndUpdate(currentUser._id, {
        $pull: { blockedUsers: userIdToUnblock }
    });

    successResponse(res, null, 'User unblocked successfully');
});

/**
 * @desc    Get all blocked users
 * @route   GET /api/block
 * @access  Private
 */
exports.getBlockedUsers = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('blockedUsers', 'username avatar _id email');

    successResponse(res, {
        blockedUsers: user.blockedUsers || []
    });
});
