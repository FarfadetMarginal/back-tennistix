const express = require('express')
const router = express.Router()
const { updateUser, addFriend, getFriends } = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.patch('/update', authMiddleware, updateUser)
router.patch('/addfriend', authMiddleware, addFriend)
router.get('/friend', authMiddleware, getFriends)

module.exports = router 