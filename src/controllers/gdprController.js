const gdprService = require('../services/gdprService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Export user data (GDPR)
 * @route   GET /api/gdpr/export
 * @access  Private
 */
exports.exportUserData = asyncHandler(async (req, res) => {
    const data = await gdprService.aggregateUserData(req.user.id);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=user_data_${req.user.id}.json`);

    successResponse(res, data);
});

/**
 * @desc    Delete account (Right to Erasure)
 * @route   DELETE /api/gdpr/delete-account
 * @access  Private
 */
exports.deleteAccount = asyncHandler(async (req, res) => {
    // Confirm password could be added here for security

    await gdprService.deleteAccount(req.user.id);
    successResponse(res, null, 'Account and all data deleted successfully');
});
