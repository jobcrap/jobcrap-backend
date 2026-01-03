const { User, Story, Report } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationData } = require('../utils/pagination');

/**
 * @desc    Get all stories (including deleted) for moderation
 * @route   GET /api/admin/stories
 * @access  Admin
 */
/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Admin
 */
exports.getStats = asyncHandler(async (req, res) => {
    const [totalPosts, flaggedPosts, totalUsers, blockedUsers, pendingReports] = await Promise.all([
        Story.countDocuments({ isDeleted: false }),
        Story.countDocuments({ status: 'flagged', isDeleted: false }),
        User.countDocuments(),
        User.countDocuments({ isBlocked: true }),
        Report.countDocuments({ status: 'pending' })
    ]);

    successResponse(res, {
        totalPosts,
        flaggedPosts,
        totalUsers,
        activeUsers: totalUsers - blockedUsers,
        blockedUsers,
        pendingReports
    });
});

/**
 * @desc    Get all stories (including deleted) for moderation
 * @route   GET /api/admin/stories
 * @access  Admin
 */
exports.getAllStories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, isDeleted, status } = req.query;
    const query = {
        isDeleted: isDeleted === 'true'
    };

    if (isDeleted === undefined) {
        query.isDeleted = false;
    }

    if (status) {
        query.status = status;
    }

    const total = await Story.countDocuments(query);
    const stories = await Story.find(query)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('author', 'email username')
        .lean();

    successResponse(res, {
        stories,
        pagination: getPaginationData(page, limit, total)
    });
});

/**
 * @desc    Hard delete a story
 * @route   DELETE /api/admin/stories/:id
 * @access  Admin
 */
exports.deleteStory = asyncHandler(async (req, res) => {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return errorResponse(res, 'Story not found', 404);
    successResponse(res, null, 'Story permanently deleted');
});

/**
 * @desc    Update story status (approve/reject)
 * @route   PUT /api/admin/stories/:id/status
 * @access  Admin
 */
exports.updateStoryStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'approved', 'rejected', 'pending'
    const story = await Story.findById(req.params.id);

    if (!story) return errorResponse(res, 'Story not found', 404);

    if (status) story.status = status;
    await story.save();

    successResponse(res, story, `Story status updated to ${status}`);
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const total = await User.countDocuments();
    const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean();

    successResponse(res, {
        users,
        pagination: getPaginationData(page, limit, total)
    });
});

/**
 * @desc    Block/Unblock user
 * @route   PUT /api/admin/users/:id/block
 * @access  Admin
 */
exports.toggleBlockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    // Prevent blocking self
    if (user._id.toString() === req.user.id) {
        return errorResponse(res, 'Cannot block yourself', 400);
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    successResponse(res, { isBlocked: user.isBlocked }, `User ${user.isBlocked ? 'blocked' : 'unblocked'}`);
});

/**
 * @desc    Get all reports
 * @route   GET /api/admin/reports
 * @access  Admin
 */
exports.getReports = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('story')
        .populate('reporter', 'email username')
        .lean();

    successResponse(res, {
        reports,
        pagination: getPaginationData(page, limit, total)
    });
});

/**
 * @desc    Update report status
 * @route   PUT /api/admin/reports/:id
 * @access  Admin
 */
exports.updateReportStatus = asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) return errorResponse(res, 'Report not found', 404);

    if (status) report.status = status;
    if (adminNote) report.adminNote = adminNote;

    await report.save();
    successResponse(res, report, 'Report updated');
});
