const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const { sendRequest, acceptRequest, declineRequest, getFriends } = require('../controllers/friendsController')

router.post('/send/:id', authMiddleware, sendRequest)
router.patch('/accept/:id', authMiddleware, acceptRequest)
router.delete('/decline/:id', authMiddleware, declineRequest)
router.get('/list/', authMiddleware, getFriends)

module.exports = router 