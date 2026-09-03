const express = require('express')
const { getLive, getIncoming, getFinishedATP, getFinishedWTA } = require('../controllers/matchController')
const router = express.Router()

router.get('/live', getLive)
router.get('/incoming', getIncoming)
router.get('/finishedatp', getFinishedATP)
router.get('/finishedwta', getFinishedWTA)

module.exports = router 