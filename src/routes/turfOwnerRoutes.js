const express = require('express');
const router = express.Router();
const turfOwnerController = require('../controllers/turfOwnerController');

router.post('/register', turfOwnerController.register);
router.post('/login', turfOwnerController.login);
router.get('/profile/:email', turfOwnerController.getProfile);
router.put('/profile/:email', turfOwnerController.updateProfile);
router.get('/turfs', turfOwnerController.getAllTurfs);
router.post('/forgot-password', turfOwnerController.forgotPassword);
router.post('/reset-password', turfOwnerController.resetPassword);

module.exports = router; 