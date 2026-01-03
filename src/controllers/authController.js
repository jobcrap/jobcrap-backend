const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
    const { email, password, username, role } = req.body;

    // Allow setting admin role only in development/test or if specific secret is provided
    // For production, prevent role manipulation
    const finalRole = (config.nodeEnv === 'development' && role) ? role : 'user';

    const user = await userService.createUser({
        email,
        password,
        username,
        role: finalRole
    });

    const token = user.generateAuthToken();

    successResponse(res, {
        token,
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        }
    }, 'User registered successfully', 201);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await userService.authenticateUser(email, password);

    if (user.isBlocked) {
        return errorResponse(res, 'Your account has been blocked', 403);
    }

    const token = user.generateAuthToken();

    successResponse(res, {
        token,
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        }
    }, 'Login successful');
});

// ...

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await userService.getUserById(req.user.id);

    successResponse(res, {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt
    });
});

/**
 * @desc    Sync Firebase user with backend
 * @route   POST /api/auth/sync
 * @access  Private (Firebase token verified in middleware)
 */
exports.syncUser = asyncHandler(async (req, res) => {
    // Middleware already verified the Firebase token and attached decodedToken
    const user = await userService.syncFirebaseUser(req.decodedToken);

    if (user.isBlocked) {
        return errorResponse(res, 'Your account has been blocked', 403);
    }

    successResponse(res, {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role
    }, 'User synced successfully');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const { username, avatar } = req.body;

    const updatedUser = await userService.updateUserProfile(req.user._id, {
        username,
        avatar
    });

    successResponse(res, {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        role: updatedUser.role
    }, 'Profile updated successfully');
});
