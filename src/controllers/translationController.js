const translationService = require('../services/translationService');
const { successResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Translate text
 * @route   POST /api/translate
 * @access  Public
 */
exports.translateText = asyncHandler(async (req, res) => {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
        throw new Error('Text and targetLang are required');
    }

    const result = await translationService.translateText(text, targetLang);

    successResponse(res, {
        original: text,
        translated: result.translation,
        targetLang
    });
});
