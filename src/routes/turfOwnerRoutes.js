const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/multer');
const turfOwnerController = require('../controllers/turfOwnerController');

router.post('/register',upload.single('image'), turfOwnerController.register);
router.post('/login', turfOwnerController.login);
router.get('/profile/:email', turfOwnerController.getProfile);
router.get('/profile/id/:turfId', turfOwnerController.getProfileById);
router.put('/profile/:email', turfOwnerController.updateProfile);
router.get('/turfs', turfOwnerController.getAllTurfs);
router.post('/forgot-password', turfOwnerController.forgotPassword);
router.post('/reset-password', turfOwnerController.resetPassword);

module.exports = router; 