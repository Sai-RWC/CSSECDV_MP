// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { isAuthenticated, isStudent, isAdmin, isAdminMod } = require('../middleware/auth');

router.get('/admin/logs', isAuthenticated, isAdmin, adminController.getLogs);
router.post('/admin/change-role', isAuthenticated, userController.changeRole);

module.exports = router; 
