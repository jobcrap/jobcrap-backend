const express = require('express');
const router = express.Router();
const gdprController = require('../../controllers/gdprController');
const { authenticate } = require('../../middleware/authMiddleware');

router.use(authenticate);

router.get('/export', gdprController.exportUserData);
router.delete('/delete-account', gdprController.deleteAccount);

module.exports = router;
