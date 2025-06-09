const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfOwnerController');
const { upload } = require('../middlewares/multer');

router.post('/addturf', upload.single('image'), turfController.addturf);
module.exports = router;