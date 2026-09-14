const express = require('express')
const router = express.Router()
const { updateUser, getUsers } = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.patch('/update', authMiddleware, updateUser)
router.get('/search', authMiddleware, getUsers)

module.exports = router 