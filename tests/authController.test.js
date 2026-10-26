const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
require('dotenv').config()

const { pool } = require('../config/db') 
const jwt = require('jsonwebtoken')
const { findUserByEmail, createPassToken } = require('../models/userModels')
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController')

const createMockRes = () => {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code
            return this
        },
        json(data) {
            this.body = data
            return this
        },
        cookie() {
            return this
        }
    }
    return res
}

describe('Auth test unit', () => {

    let userA, userB, userC, tokenA, tokenB
    const testEmails = ['test_us_a@example.com', 'test_us_b@example.com', 'test_us_c@example.com']

    before(async () => {
        await pool.query(
            'DELETE FROM "Users" WHERE "email" = ANY($1)', [testEmails]
        )
    })

    after(async () => {
        await pool.query(
            'DELETE FROM "Users" WHERE "email" = ANY($1)', [testEmails]
        )
        await pool.end()
    })

    test('Register good ', async () => {
        const reqA = {
            body: {
                pseudo: 'Alice Tester',
                email: 'test_us_a@example.com',
                password: 'Password123!'
            }
        }
        const resA = createMockRes()
        await register(reqA, resA)
        assert.strictEqual(resA.statusCode, 201)
        assert.ok(resA.body.token)
        userA = resA.body.user
    })
    

    test('Register duplicate', async () => {
        // Duplicate email check
        const reqB = {
            body: {
                pseudo: 'Alice Tester',
                email: 'test_us_b@example.com',
                password: 'Password123!'
            }
        }
        const resB = createMockRes()
        await register(reqB, resB)
        assert.strictEqual(resB.statusCode, 201)
        assert.ok(resB.body.token)
        userB = resB.body.user

        const resDup = createMockRes()
        await register(reqB, resDup)
        assert.strictEqual(resDup.statusCode, 409)
    })


    test('Register with weak password', async () => {
        // weak password
        const req = {
            body: {
                pseudo: 'Bob Collaborator nul',
                email: 'test_us_c@example.com',
                password: 'Passwordnul'
            }
        }
        const res = createMockRes()
        await register(req, res)
        assert.strictEqual(res.statusCode, 400)
    })


    test('Login good', async () => {
        const req = {
            body: {
                email: 'test_us_a@example.com',
                password: 'Password123!'
            }
        }
        const res = createMockRes()
        await login(req, res)
        assert.strictEqual(res.statusCode, 200)
        assert.ok(res.body.token)
        tokenA = res.body.token
    })

    test('Login wrong password', async () => {
        //wrong password
        const reqB = {
            body: {
                email: 'test_us_b@example.com',
                password: 'Password12345!'
            }
        }
        const resB = createMockRes()
        await login(reqB, resB)
        assert.strictEqual(resB.statusCode, 401)
    })

    test('Login w wrong mail', async () => {
        //wrong mail
        const reqA = {
            body: {
                email: 'test_us_x@example.com',
                password: 'Password123!'
            }
        }
        const resA = createMockRes()
        await login(reqA, resA)
        assert.strictEqual(resA.statusCode, 401)
    })
    
    test('Forgot password good', async () => {
        const email = 'bapt935@gmail.com'
        let user = await findUserByEmail(email)
        let createdForTest = false

        if (!user) {
            const resRegister = createMockRes()
            await register({
                body: {
                    pseudo: 'Temporary mail test',
                    email,
                    password: 'Password123!'
                }
            }, resRegister)
            assert.strictEqual(resRegister.statusCode, 201)
            createdForTest = true
            user = await findUserByEmail(email)
        }

        try {
            const res = createMockRes()
            await forgotPassword({ body: { email } }, res)
            assert.strictEqual(res.statusCode, 200)
        } finally {
            if (createdForTest) {
                await pool.query('DELETE FROM "Users" WHERE email = $1', [email])
            } else {
                await createPassToken(user.reset_token, email)
            }
        }
    })

    test('forgot password w wrong mail', async () => {    
        //wrong mail
        const reqA = {
            body: {
                email: 'test_us_x@example.com'
            }
        }
        const resA = createMockRes()
        await forgotPassword(reqA, resA)
        assert.strictEqual(resA.statusCode, 404)

    })

    test('reset password good', async () => {    
        const user = await findUserByEmail('test_us_b@example.com')
        const token2 = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' })
        await createPassToken(token2, 'test_us_b@example.com')

        const reqReset = {
            params: { id: token2 },
            body: {
                email: 'test_us_b@example.com',
                newPassword : 'Pass12345!'
            }
        }
        const resReset = createMockRes()
        await resetPassword(reqReset, resReset)
        assert.strictEqual(resReset.statusCode, 200)

    })

    test('Login w new password', async () => {    
        const reqLogin = {
            body: {
                email: 'test_us_b@example.com',
                password: 'Pass12345!'
            }
        }
        const resLogin = createMockRes()
        await login(reqLogin, resLogin)
        assert.strictEqual(resLogin.statusCode, 200)
    })
})
