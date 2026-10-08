const express = require('express')
const router = express.Router()
const {register, login, forgotPassword, resetPassword, refreshAuth} = require('../controllers/authController')
const validate = require('../middleware/validateMiddleware')
const { registerSchema, loginSchema } = require('../schemas/authSchemas')

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.patch('/forgot-password', forgotPassword)
router.patch('/reset-password/:id', resetPassword)
router.post('/refresh', refreshAuth) //*

module.exports = router 