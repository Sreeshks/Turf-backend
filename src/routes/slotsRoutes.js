const express = require('express');
const { addSlots, getallSlots } = require('../controllers/slotsController');
const router = express.Router();

router.post('/addslots',addSlots)

router.get('/getslots',getallSlots)

module.exports = router
