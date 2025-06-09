const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfOwnerController');
const { upload } = require('../middlewares/multer');

router.post('/register', upload.single('image'), turfController.register);
router.post('/login', turfController.login);
router.get('/profile/:email', turfController.getProfile);
router.get('/all', turfController.getAllTurfs);
router.post('/forgot-password', turfController.forgotPassword);
router.post('/reset-password', turfController.resetPassword);
router.post('/addturf/:email', upload.single('image'), turfController.addturf);
module.exports = router;