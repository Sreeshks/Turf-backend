const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:email', userController.getProfile);
router.put('/profile/:email', userController.updateProfile);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/all', userController.getAllUsers);

// Get all turfs
router.get('/turfs', userController.getAllTurfs);

module.exports = router; 