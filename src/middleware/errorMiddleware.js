const { errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * 404 Not Found Handler
 */
exports.notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * Global Error Handler
 */
exports.errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error with stack trace for debugging
    logger.error(err.message, { stack: err.stack, path: req.originalUrl, method: req.method });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { message, statusCode: 401 };
    }

    // Send response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server Error';

    // In development, return stack trace
    const responseData = {
        success: false,
        message
    };

    if (config.nodeEnv === 'development' && statusCode === 500) {
        responseData.stack = err.stack;
    }

    res.status(statusCode).json(responseData);
};
