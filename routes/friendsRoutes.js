const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const { sendRequest, acceptRequest, declineRequest, getFriends, getRequest } = require('../controllers/friendsController')

router.post('/send/:id', authMiddleware, sendRequest)
router.patch('/accept/:id', authMiddleware, acceptRequest)
router.delete('/decline/:id', authMiddleware, declineRequest)
router.get('/list', authMiddleware, getFriends)
router.get('/requestlist', authMiddleware, getRequest)

module.exports = router 