const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfOwnerController');
const { upload } = require('../middlewares/multer');
router.post('/addturf', upload.single('image'), turfController.addturf);
router.get('/getallturfs', turfController.getAllTurfs);
router.delete('/deleteturf/:turfid', turfController.deleteturf);
module.exports = router;