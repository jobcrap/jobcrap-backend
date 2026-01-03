const config = require('../config');
const admin = require('../config/firebase');
const { User } = require('../models');
const { errorResponse } = require('../utils/responseHandler');
const { USER_ROLES } = require('../constants');

/**
 * Protect routes - verify JWT token
 */
/**
 * Verify Firebase ID Token
 */
exports.verifyFirebaseToken = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return errorResponse(res, 'Not authorized to access this route', 401);
    }

    try {
        // Verify token using Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.decodedToken = decodedToken;
        next();
    } catch (error) {
        console.error('Firebase Auth Error:', error.message);
        return errorResponse(res, 'Not authorized to access this route', 401);
    }
};

/**
 * Protect routes - ensure user exists in MongoDB
 */
exports.authenticate = async (req, res, next) => {
    await exports.verifyFirebaseToken(req, res, async () => {
        try {
            // Check if user exists in MongoDB by firebaseUid
            let user = await User.findOne({ firebaseUid: req.decodedToken.uid });

            if (!user) {
                return errorResponse(res, 'User record not found in database', 401);
            }

            if (user.isBlocked) {
                return errorResponse(res, 'Your account has been blocked', 403);
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            console.error('Database Auth Error:', error);
            return errorResponse(res, 'Internal server error during authentication', 500);
        }
    });
};

/**
 * Grant access to specific roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return errorResponse(
                res,
                `User role ${req.user.role} is not authorized to access this route`,
                403
            );
        }
        next();
    };
};

/**
 * Check if user is blocked
 */
exports.checkBlocked = (req, res, next) => {
    if (req.user && req.user.isBlocked) {
        return errorResponse(res, 'Your account has been blocked', 403);
    }
    next();
};

exports.isAdmin = exports.authorize(USER_ROLES.ADMIN);

/**
 * Optional authentication - check token if present, otherwise proceed as guest
 */
exports.optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        exports.authenticate(req, res, next);
    } else {
        next();
    }
};
