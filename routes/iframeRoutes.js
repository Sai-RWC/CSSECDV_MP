const express = require('express');
const router = express.Router();
const iframeController = require('../controllers/iframeController');
const { isAuthenticated, isStudent, isAdmin } = require('../middleware/auth');

router.get('/unavailiframe', isAuthenticated, iframeController.getUnavailFrame);
router.get('/reserveiframe', isAuthenticated, iframeController.getResIframe);

module.exports = router;
