const { validationResult, body } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');
const { STORY_CATEGORIES, TRIGGER_WARNINGS, VOTE_TYPES, LIMITS } = require('../constants');

/**
 * Middleware to handle validation results
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation Error', 400, errors.array());
    }
    next();
};

/**
 * Validation rules for user registration
 */
exports.validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    handleValidationErrors
];

/**
 * Validation rules for user login
 */
exports.validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required'),
    handleValidationErrors
];

/**
 * Validation rules for stories
 */
exports.validateStory = [
    body('profession')
        .trim()
        .notEmpty()
        .withMessage('Profession is required')
        .isLength({ max: LIMITS.PROFESSION_MAX })
        .withMessage(`Profession cannot exceed ${LIMITS.PROFESSION_MAX} characters`),
    body('country')
        .trim()
        .notEmpty()
        .withMessage('Country is required'),
    body('category')
        .isIn(STORY_CATEGORIES)
        .withMessage(`Category must be one of: ${STORY_CATEGORIES.join(', ')}`),
    body('text')
        .trim()
        .isLength({ min: LIMITS.STORY_TEXT_MIN, max: LIMITS.STORY_TEXT_MAX })
        .withMessage(`Story must be between ${LIMITS.STORY_TEXT_MIN} and ${LIMITS.STORY_TEXT_MAX} characters`)
        .custom((text) => {
            const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
            if (wordCount > 700) {
                throw new Error(`Your story is too long. Please keep it under 700 words (found ${wordCount})`);
            }
            return true;
        }),
    body('triggerWarnings')
        .optional()
        .isArray()
        .withMessage('Trigger warnings must be an array')
        .custom((warnings) => {
            if (!warnings) return true;
            const valid = warnings.every(w => TRIGGER_WARNINGS.includes(w));
            if (!valid) throw new Error(`Invalid trigger warning. Allowed: ${TRIGGER_WARNINGS.join(', ')}`);
            return true;
        }),
    handleValidationErrors
];

/**
 * Validation rules for comments
 */
exports.validateComment = [
    body('text')
        .trim()
        .notEmpty()
        .withMessage('Comment text is required')
        .isLength({ max: LIMITS.COMMENT_TEXT_MAX })
        .withMessage(`Comment cannot exceed ${LIMITS.COMMENT_TEXT_MAX} characters`),
    handleValidationErrors
];

/**
 * Validation rules for voting
 */
exports.validateVote = [
    body('voteType')
        .isIn(Object.values(VOTE_TYPES))
        .withMessage('Invalid vote type'),
    handleValidationErrors
];
