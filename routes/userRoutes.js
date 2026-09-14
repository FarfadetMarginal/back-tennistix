const express = require('express')
const router = express.Router()
const { updateUser, getUsers, getLeaderboard } = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.patch('/update', authMiddleware, updateUser)
router.get('/search', authMiddleware, getUsers)
router.get('/leaderboard', authMiddleware, getLeaderboard)

module.exports = router 