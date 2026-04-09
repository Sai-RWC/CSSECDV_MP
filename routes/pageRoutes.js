const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// index
router.get('/', pageController.getIndex);

// landing page
router.get('/landingpage', pageController.getLanding);

module.exports = router;