const SystemSetting = require('../models/SystemSetting');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all settings or setting by key
 * @route   GET /api/settings
 * @route   GET /api/settings/:key
 * @access  Public
 */
exports.getSettings = asyncHandler(async (req, res) => {
    const { key } = req.params;

    if (key) {
        const setting = await SystemSetting.findOne({ key });
        if (!setting) {
            return errorResponse(res, `Setting with key '${key}' not found`, 404);
        }
        return successResponse(res, setting, `Setting '${key}' fetched successfully`);
    }

    const settings = await SystemSetting.find();
    successResponse(res, settings, 'All settings fetched successfully');
});

/**
 * @desc    Update or create a setting
 * @route   PUT /api/settings/:key
 * @access  Admin Only
 */
exports.updateSetting = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
        return errorResponse(res, 'Value is required', 400);
    }

    let setting = await SystemSetting.findOne({ key });

    if (setting) {
        setting.value = value;
        if (description !== undefined) setting.description = description;
        setting.updatedBy = req.user._id;
        await setting.save();
    } else {
        setting = await SystemSetting.create({
            key,
            value,
            description,
            updatedBy: req.user._id
        });
    }

    successResponse(res, setting, `Setting '${key}' updated successfully`);
});
