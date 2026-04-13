const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isStudent, isAdmin } = require('../middleware/auth');

router.get('/viewprofile/:idNum', isAuthenticated, userController.getViewProfileStudent);
router.get('/MyProfile', isAuthenticated, userController.getMyProfile);

router.get('/profile/:email', isAuthenticated, userController.getViewProfileTech);

router.get('/editprofile', isAuthenticated, userController.getEditProfile);
router.post('/editprofile', isAuthenticated, userController.uploadProfilePicture, userController.postEditProfile);

router.get('/change-password', isAuthenticated, userController.getChangePassword);
router.post('/change-password', isAuthenticated, userController.postChangePassword);

router.get('/searchusers', isAuthenticated, userController.getSearchUsers);
router.post('/searchusers', isAuthenticated, userController.postSearchUsers);

router.delete('/deleteaccount/:idNum', isAuthenticated, userController.deleteAccount);

module.exports = router;
