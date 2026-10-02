const express = require('express')
const { getLive, getIncoming, getFinishedATP, getFinishedWTA } = require('../controllers/matchController')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.get('/live', authMiddleware, getLive)
router.get('/incoming', authMiddleware, getIncoming)
router.get('/finishedatp', authMiddleware, getFinishedATP)
router.get('/finishedwta', authMiddleware, getFinishedWTA)



module.exports = router 