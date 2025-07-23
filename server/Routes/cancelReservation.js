const express = require('express')
const router = express.Router()
const {list, read} = require('../controllers/cancelReservation')
const {auth} = require('../middleware/auth');

router.get('/cancelReserv', list)
router.get('/cancelReserv/:id', read)

module.exports = router