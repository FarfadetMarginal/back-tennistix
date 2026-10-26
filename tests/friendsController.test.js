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

    let userAId, userBId, userCId
    const testEmails = ['test_us_a@example.com', 'test_us_b@example.com', 'test_us_c@example.com']

    const cleanTestData = async () => {
        await pool.query(
            `DELETE FROM "Friends"
            WHERE sender_id IN (SELECT id FROM "Users" WHERE email = ANY($1))
               OR receiver_id IN (SELECT id FROM "Users" WHERE email = ANY($1))`,
            [testEmails]
        )
        await pool.query('DELETE FROM "Users" WHERE email = ANY($1)', [testEmails])
    }

    before(async () => {
        await cleanTestData()

        const users = await pool.query(
            'INSERT INTO "Users"(pseudo, email, password) VALUES($1, $2, $3), ($4, $5, $6), ($7, $8, $9) RETURNING id',
            ['Alice', testEmails[0], 'hashed_pass', 'Bob', testEmails[1], 'hashed_pass', 'Charlie', testEmails[2], 'hashed_pass']
        )

        userAId = users.rows[0].id
        userBId = users.rows[1].id
        userCId = users.rows[2].id
    })

    after(async () => {
        try {
            await cleanTestData()
        } finally {
            await pool.end()
        }
    })

    test('Send, accept, decline friend requests and display friends', async () => {
        const reqA = {
            user: { id: userAId },
            params: { id: userBId }
        }
        const resA = createMockRes()
        await sendRequest(reqA, resA)
        assert.strictEqual(resA.statusCode, 200)
        assert.strictEqual(resA.body.message, 'friend request sent successfully')

        const resDuplicate = createMockRes()
        await sendRequest(reqA, resDuplicate)
        assert.strictEqual(resDuplicate.statusCode, 409)
        assert.strictEqual(resDuplicate.body.detail, 'friend request already sent')

        const resSelf = createMockRes()
        await sendRequest({ user: { id: userAId }, params: { id: userAId } }, resSelf)
        assert.strictEqual(resSelf.statusCode, 400)
        assert.strictEqual(resSelf.body.detail, "you can't send a friend request to yourself")

        const resUnauthenticated = createMockRes()
        await sendRequest({ user: undefined, params: { id: userBId } }, resUnauthenticated)
        assert.strictEqual(resUnauthenticated.statusCode, 401)
        assert.strictEqual(resUnauthenticated.body.detail, 'user not connected')

        const resUnauthenticatedAccept = createMockRes()
        await acceptRequest({ user: undefined, params: { id: userAId } }, resUnauthenticatedAccept)
        assert.strictEqual(resUnauthenticatedAccept.statusCode, 401)
        assert.strictEqual(resUnauthenticatedAccept.body.detail, 'user not connected')

        const resAccept = createMockRes()
        await acceptRequest({ user: { id: userBId }, params: { id: userAId } }, resAccept)
        assert.strictEqual(resAccept.statusCode, 200)
        assert.strictEqual(resAccept.body.message, 'friend request accepted successfully')

        const resFriends = createMockRes()
        await getFriends({ user: { id: userAId } }, resFriends)
        assert.strictEqual(resFriends.statusCode, 200)
        assert.deepStrictEqual(resFriends.body.friendlist.map(friend => friend.id), [userBId])

        const resDeclineUnauthenticated = createMockRes()
        await declineRequest({ user: undefined, params: { id: userCId } }, resDeclineUnauthenticated)
        assert.strictEqual(resDeclineUnauthenticated.statusCode, 401)

        const resSendPending = createMockRes()
        await sendRequest({ user: { id: userCId }, params: { id: userBId } }, resSendPending)
        assert.strictEqual(resSendPending.statusCode, 200)

        const resDecline = createMockRes()
        await declineRequest({ user: { id: userBId }, params: { id: userCId } }, resDecline)
        assert.strictEqual(resDecline.statusCode, 200)
        assert.strictEqual(resDecline.body.detail, 'friend request declined successfully')

        const resFriendsAfterDecline = createMockRes()
        await getFriends({ user: { id: userBId } }, resFriendsAfterDecline)
        assert.deepStrictEqual(resFriendsAfterDecline.body.friendlist.map(friend => friend.id), [userAId])
    })
})
