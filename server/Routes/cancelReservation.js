const express = require('express')
const router = express.Router()
const {list, read} = require('../controllers/cancelReservation')
const {auth} = require('../middleware/auth');

router.get('/cancelReserv',auth, list)
router.get('/cancelReserv/:id',auth, read)

module.exports = router