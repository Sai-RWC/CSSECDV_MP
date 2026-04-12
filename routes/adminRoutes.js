// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isStudent, isAdmin, isAdminMod } = require('../middleware/auth');

router.get('/admin/logs', isAuthenticated, isAdmin, adminController.getLogs);

module.exports = router; 
