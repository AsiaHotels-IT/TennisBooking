const express = require('express')
const router = express.Router()
const {list, read, create, update, remove, checkAvailability} = require('../controllers/ReservationStadium')
const {auth} = require('../middleware/auth');

router.get('/reservation',auth, list)
router.get('/reservation/:id',auth, read)
router.post('/reservation',auth, create)
router.put('/reservation/:id',auth, update)
router.delete('/reservation/:id',auth, remove)
router.post('/reservation/check',auth, checkAvailability)

module.exports = router
