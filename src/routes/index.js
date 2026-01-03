const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const storyRoutes = require('./stories');
const commentRoutes = require('./comments');
const adminRoutes = require('./admin');
const translationRoutes = require('./translation');
const gdprRoutes = require('./gdpr');
const settingRoutes = require('./settingRoutes');

router.use('/auth', authRoutes);
router.use('/stories', storyRoutes);
router.use('/comments', commentRoutes); // For delete api/comments/:id
router.use('/admin', adminRoutes);
router.use('/translate', translationRoutes);
router.use('/gdpr', gdprRoutes);
router.use('/settings', settingRoutes);

module.exports = router;
