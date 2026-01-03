const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const { authenticate, isAdmin } = require('../../middleware/authMiddleware');

// Protect all admin routes
router.use(authenticate, isAdmin);

router.get('/stats', adminController.getStats);
router.get('/stories', adminController.getAllStories);
router.route('/stories/:id')
    .delete(adminController.deleteStory);

router.put('/stories/:id/status', adminController.updateStoryStatus);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/block', adminController.toggleBlockUser);

router.get('/reports', adminController.getReports);
router.put('/reports/:id', adminController.updateReportStatus);

module.exports = router;
