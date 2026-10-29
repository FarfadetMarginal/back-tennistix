const express = require('express')
const router = express.Router()
const { updateUser, getUsers, getLeaderboard, deleteUsers } = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.patch('/update', authMiddleware, updateUser)
router.get('/search', authMiddleware, getUsers)
router.get('/leaderboard', authMiddleware, getLeaderboard)
router.delete('/delete', authMiddleware, deleteUsers)

module.exports = router 