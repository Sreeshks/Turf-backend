const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfOwnerController');
const { upload } = require('../utils/multer');

router.post('/register', upload.single('image'), turfController.register);
router.post('/login', turfController.login);
router.get('/profile/:email', turfController.getProfile);
router.get('/profile/id/:turfId', turfController.getProfileById);
router.put('/profile/:email', turfController.updateProfile);
router.get('/all', turfController.getAllTurfs);
router.post('/forgot-password', turfController.forgotPassword);
router.post('/reset-password', turfController.resetPassword);
module.exports = router;