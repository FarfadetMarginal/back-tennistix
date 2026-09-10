const express = require('express')
const { favPlayer, getPlayers } = require('../controllers/playerController')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.get('/players', getPlayers)
router.patch('/addfav', authMiddleware, favPlayer)


module.exports = router 