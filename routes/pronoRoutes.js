const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { newProno } = require('../controllers/pronoController')

router.post('/new', authMiddleware, newProno)

module.exports = router 