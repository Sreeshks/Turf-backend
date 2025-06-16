const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:email', userController.getProfile);
router.put('/profile/:email', userController.updateProfile);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/booking', bookingController.booking);

module.exports = router; 