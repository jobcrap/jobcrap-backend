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

    // For local registration, default to 'user' if not specified.
    // In production, this should be restricted.
    const finalRole = role || 'user';

    const user = await userService.createUser({
        email,
        password,
        username,
        role: finalRole
    });

    const token = user.generateAuthToken();

    const userObj = user.toObject({ virtuals: true });
    successResponse(res, {
        token,
        user: {
            id: userObj._id,
            email: userObj.email,
            username: userObj.username,
            role: userObj.role,
            authProvider: userObj.authProvider,
            storiesCount: userObj.storiesCount || 0,
            isDeletionPending: userObj.isDeletionPending || false,
            deletionScheduledAt: userObj.deletionScheduledAt
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

    const userObj = user.toObject({ virtuals: true });
    successResponse(res, {
        token,
        user: {
            id: userObj._id,
            email: userObj.email,
            username: userObj.username,
            role: userObj.role,
            authProvider: userObj.authProvider,
            storiesCount: userObj.storiesCount || 0,
            isDeletionPending: userObj.isDeletionPending || false,
            deletionScheduledAt: userObj.deletionScheduledAt
        }
    }, 'Login successful');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await userService.getUserById(req.user.id);

    const userObj = user.toObject({ virtuals: true });
    successResponse(res, {
        id: userObj._id,
        email: userObj.email,
        username: userObj.username,
        avatar: userObj.avatar,
        role: userObj.role,
        authProvider: userObj.authProvider,
        storiesCount: userObj.storiesCount || 0,
        isDeletionPending: userObj.isDeletionPending || false,
        deletionScheduledAt: userObj.deletionScheduledAt,
        createdAt: userObj.createdAt
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

    const userObj = user.toObject({ virtuals: true });
    successResponse(res, {
        id: userObj._id,
        email: userObj.email,
        username: userObj.username,
        avatar: userObj.avatar,
        role: userObj.role,
        authProvider: userObj.authProvider,
        storiesCount: userObj.storiesCount || 0,
        isDeletionPending: userObj.isDeletionPending || false,
        deletionScheduledAt: userObj.deletionScheduledAt
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

    const userObj = updatedUser.toObject({ virtuals: true });
    successResponse(res, {
        id: userObj._id,
        email: userObj.email,
        username: userObj.username,
        avatar: userObj.avatar,
        role: userObj.role,
        authProvider: userObj.authProvider,
        storiesCount: userObj.storiesCount || 0,
        isDeletionPending: userObj.isDeletionPending || false,
        deletionScheduledAt: userObj.deletionScheduledAt
    }, 'Profile updated successfully');
});

/**
 * @desc    Schedule account deletion
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
exports.deleteAccount = asyncHandler(async (req, res) => {
    const user = await userService.scheduleAccountDeletion(req.user.id);

    const userObj = user.toObject({ virtuals: true });
    successResponse(res, {
        id: userObj._id,
        email: userObj.email,
        username: userObj.username,
        avatar: userObj.avatar,
        role: userObj.role,
        authProvider: userObj.authProvider,
        storiesCount: userObj.storiesCount || 0,
        isDeletionPending: userObj.isDeletionPending || false,
        deletionScheduledAt: userObj.deletionScheduledAt
    }, 'Account deletion scheduled for 30 days from now');
});

/**
 * @desc    Cancel account deletion
 * @route   POST /api/auth/undo-delete
 * @access  Private
 */
exports.undoDeleteAccount = asyncHandler(async (req, res) => {
    const user = await userService.cancelAccountDeletion(req.user.id);

    const userObj = user.toObject({ virtuals: true });
    successResponse(res, {
        id: userObj._id,
        email: userObj.email,
        username: userObj.username,
        avatar: userObj.avatar,
        role: userObj.role,
        authProvider: userObj.authProvider,
        storiesCount: userObj.storiesCount || 0,
        isDeletionPending: userObj.isDeletionPending || false,
        deletionScheduledAt: userObj.deletionScheduledAt
    }, 'Account deletion cancelled successfully');
});
