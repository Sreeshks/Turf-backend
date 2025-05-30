const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:email', userController.getProfile);
router.put('/profile/:email', userController.updateProfile);

module.exports = router; 