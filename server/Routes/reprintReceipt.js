const express = require('express')
const router = express.Router()
const {list, read, create, remove} = require('../controllers/reprintReceipt')
const {auth} = require('../middleware/auth');

router.get('/reprintReceipt',auth, list)
router.get('/reprintReceipt/:id',auth, read)
router.post('/reprintReceipt',auth, create)
router.delete('/reprintReceipt/:id',auth, remove)

module.exports = router