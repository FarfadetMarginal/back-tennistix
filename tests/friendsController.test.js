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

    test('Send friend request and accept', async () => {
        const reqA = {
            user: { id: userAId },
            params: { id: userBId }
        }
        const resA = createMockRes()
        await sendRequest(reqA, resA)
        assert.strictEqual(resA.statusCode, 200)
        assert.ok(resA.body.message)
        
        //existing request
        const resA2 = createMockRes()
        await sendRequest(reqA, resA2)
        assert.strictEqual(resA2.statusCode, 400)

        //request to self
        const reqB = {
            user: { id: userAId },
            params: { id: userAId }
        }
        const resB = createMockRes()
        await sendRequest(reqB, resB)
        assert.strictEqual(resB.statusCode, 400)
        assert.strictEqual(resB.body.message, 'you cannot send a friend request to yourself')

        //not connected
        const reqC = {
            user: undefined,
            params: { id: userBId }
        }
        const resC = createMockRes()
        await sendRequest(reqC, resC)
        assert.strictEqual(resC.statusCode, 401)
        assert.strictEqual(resC.body.message, 'not connected')

        
        //not connected (accept)
        const reqD = {
            user: undefined,
            params: { id: userBId }
        }
        const resD = createMockRes()
        await acceptRequest(reqD, resD)
        assert.strictEqual(resD.statusCode, 401)
        assert.strictEqual(resD.body.message, 'not connected')

        const reqAccept = {
            user: { id: userBId },
            params: { id: userAId }
        }
        const resAccept = createMockRes()
        await acceptRequest(reqAccept, resAccept)
        assert.strictEqual(resAccept.statusCode, 200)
        assert.ok(resAccept.body.message)
    })
})