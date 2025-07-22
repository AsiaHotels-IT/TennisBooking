const express = require('express')
const router = express.Router()
const {list, read, create, update, remove} = require('../controllers/member')
const {auth} = require('../middleware/auth');

router.get('/member',auth, list)
router.get('/member/:id',auth, read)
router.post('/member',auth, create)
router.put('/member/:id',auth, update)
router.delete('/member/:id', remove)

module.exports = router