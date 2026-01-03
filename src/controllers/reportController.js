const { Report } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a report for a story
 * @route   POST /api/stories/:id/report
 * @access  Private
 */
exports.createReport = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const storyId = req.params.id;

    // Check if user already reported this story
    const existingReport = await Report.findOne({
        story: storyId,
        reporter: req.user.id
    });

    if (existingReport) {
        return errorResponse(res, 'You have already reported this story', 400);
    }

    const report = await Report.create({
        story: storyId,
        reporter: req.user.id,
        reason
    });

    successResponse(res, report, 'Report submitted successfully', 201);
});
