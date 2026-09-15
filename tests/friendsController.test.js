const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
require('dotenv').config()

const { pool } = require('../config/db') 

const { sendRequest, acceptRequest, declineRequest, getFriends } = require('../controllers/friendsController')

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

describe('Test unitaire friends', () => {

    let userAId, userBId
    const testEmails = ['test_us_a@example.com', 'test_us_b@example.com', 'test_us_c@example.com']

    before(async () => {
        await pool.query('DELETE FROM "Friends"');
        await pool.query('DELETE FROM "Users" WHERE email = ANY($1)', [testEmails]);
        const resA = await pool.query(
            'INSERT INTO "Users"(pseudo, email, password) VALUES($1, $2, $3) RETURNING id',
            ['Alice', 'test_us_a@example.com', 'hashed_pass']
        );
        const resB = await pool.query(
            'INSERT INTO "Users"(pseudo, email, password) VALUES($1, $2, $3) RETURNING id',
            ['Bob', 'test_us_b@example.com', 'hashed_pass']
        );

        userAId = resA.rows[0].id;
        userBId = resB.rows[0].id;
    })

    after(async () => {
        await pool.query('DELETE FROM "Friends"');
        await pool.query('DELETE FROM "Users" WHERE "email" = ANY($1)', [testEmails])
        await pool.end()
    })

    test('Send request', async () => {
        const reqA = {
            user: { id: userAId },
            params: { id: userBId }
        }
        const resA = createMockRes()
        await sendRequest(reqA, resA)
        assert.strictEqual(resA.statusCode, 200)
        assert.ok(resA.body.message)

    })
})