const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter for authentication endpoints
 */
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: {
        success: false,
        message: 'Too many login/register attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API rate limiter
 */
exports.apiLimiter = rateLimit({
    windowMs: config.rateLimitWindow,
    max: config.rateLimitMax,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for story creation to prevent spam
 */
exports.createStoryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 stories per hour
    message: {
        success: false,
        message: 'You have reached the limit for creating stories. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
