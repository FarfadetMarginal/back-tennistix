const express = require('express')
const { getLive, getIncoming, getFinished } = require('../controllers/matchController')
const router = express.Router()


router.get('/live', getLive)
router.get('/incoming', getIncoming)
router.get('/finished', getFinished)

module.exports = router 