const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
require('dotenv').config()

const { pool } = require('../config/db') 

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
        }
    }
    return res
}

describe('Test unitaire', () => {

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

    test('Register', async () => {
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

        // Register user B
        const reqB = {
            body: {
                pseudo: 'Bob Collaborator',
                email: 'test_us_b@example.com',
                password: 'Password123!'
            }
        }
        const resB = createMockRes()
        await register(reqB, resB)
        assert.strictEqual(resB.statusCode, 201)
        userB = resB.body.user

        // Duplicate email check
        const resDup = createMockRes()
        await register(reqA, resDup)
        assert.strictEqual(resDup.statusCode, 400)


        // weak password
        const reqC = {
            body: {
                pseudo: 'Bob Collaborator nul',
                email: 'test_us_c@example.com',
                password: 'Passwordnul'
            }
        }
        const resC = createMockRes()
        await register(reqC, resC)
        assert.strictEqual(resC.statusCode, 400)
    })

    test('Login', async () => {
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
    
    test('Forgot and reset password', async () => {
        const req = {
            body: {
                email: 'test_us_a@example.com'
            }
        }
        const res = createMockRes()
        await forgotPassword(req, res)
        assert.strictEqual(res.statusCode, 200)

        
        //wrong mail
        const reqA = {
            body: {
                email: 'test_us_x@example.com'
            }
        }
        const resA = createMockRes()
        await forgotPassword(reqA, resA)
        assert.strictEqual(resA.statusCode, 404)

        const dbResult = await pool.query('SELECT reset_token FROM "Users" WHERE email = $1', ['test_us_a@example.com']);
        const token2 = dbResult.rows[0]?.reset_token;
        assert.ok(token2, 'Le token2 doit être enregistré en BDD');

        const reqReset = {
            params: { id: token2 },
            body: {
                email: 'test_us_a@example.com',
                newPassword : 'Pass12345!'
            }
        }
        const resReset = createMockRes()
        await resetPassword(reqReset, resReset)
        assert.strictEqual(resReset.statusCode, 200)

        const reqLogin = {
            body: {
                email: 'test_us_a@example.com',
                password: 'Pass12345!'
            }
        }
        const resLogin = createMockRes()
        await login(reqLogin, resLogin)
        assert.strictEqual(resLogin.statusCode, 200)
    })
})