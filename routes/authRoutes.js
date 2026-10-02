const express = require('express')
const router = express.Router()
const {register, login, forgotPassword, resetPassword, refreshAuth} = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.patch('/forgot-password', forgotPassword)
router.patch('/reset-password/:id', resetPassword)
router.post('/refresh', refreshAuth) //*

module.exports = router 