const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { validateRegister, validateLogin } = require('../../middleware/validationMiddleware');
const { authLimiter } = require('../../middleware/rateLimitMiddleware');
const { authenticate, verifyFirebaseToken } = require('../../middleware/authMiddleware');

// Routes
// Note: register and login are now handled primarily on frontend via Firebase,
// then synced with /sync. Keeping old routes for potential hybrid or cleanup.
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);

router.get('/me', authenticate, authController.getMe);
router.post('/sync', verifyFirebaseToken, authController.syncUser);
router.put('/profile', authenticate, authController.updateProfile);
router.delete('/delete-account', authenticate, authController.deleteAccount);
router.post('/undo-delete', authenticate, authController.undoDeleteAccount);

module.exports = router;
