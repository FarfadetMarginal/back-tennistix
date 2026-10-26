const { test, describe } = require('node:test')
const assert = require('node:assert')
require('dotenv').config()

const userModels = require('../models/userModels.js')

let userData, searchedUsers, changedUser, leaderboardResult

userModels.findUserById = async () => ({ ...userData })
userModels.searchUser = async () => searchedUsers
userModels.changeUser = async (pseudo, email, password, pp, id) => {
    changedUser = { pseudo, email, password, pp, id }
    return { id, email, role: 'user' }
}
userModels.getGlobalWr = async () => leaderboardResult
userModels.getGlobalScore = async () => leaderboardResult
userModels.getTournamentWr = async () => leaderboardResult
userModels.getTournamentScore = async () => leaderboardResult
userModels.getFriendsWr = async () => leaderboardResult
userModels.getFriendsScore = async () => leaderboardResult
userModels.getFriendsTournamentWr = async () => leaderboardResult
userModels.getFriendsTournamentScore = async () => leaderboardResult

const { updateUser, getUsers, getLeaderboard } = require('../controllers/userController')

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

describe('Test unitaire users', () => {

    test('Update user not connected', async () => {
        const req = { user: {}, body: {} }
        const res = createMockRes()
        await updateUser(req, res)
        assert.strictEqual(res.statusCode, 401)
        assert.strictEqual(res.body.message, 'not connected')
    })

    test('Update user with invalid email', async () => {
        userData = { pseudo: 'Alice', email: 'alice@example.com', password: 'hashed', pp: null }
        const req = {
            user: { id: 1 },
            body: { email: 'invalid-email' }
        }
        const res = createMockRes()
        await updateUser(req, res)
        assert.strictEqual(res.statusCode, 400)
        assert.strictEqual(res.body.message, 'email not valid')
    })

    test('Update user with invalid password', async () => {
        userData = { pseudo: 'Alice', email: 'alice@example.com', password: 'hashed', pp: null }
        const req = {
            user: { id: 1 },
            body: { password: 'weak' }
        }
        const res = createMockRes()
        await updateUser(req, res)
        assert.strictEqual(res.statusCode, 400)
        assert.strictEqual(res.body.message, 'password not valid : 1 maj 1 min 1 number 1 special chars 6 total required')
    })

    test('Update user good', async () => {
        userData = { pseudo: 'Alice', email: 'alice@example.com', password: 'hashed', pp: null }
        const req = {
            user: { id: 1 },
            body: { pseudo: 'Alice Updated', email: 'alice.updated@example.com' }
        }
        const res = createMockRes()
        await updateUser(req, res)
        assert.strictEqual(res.statusCode, 200)
        assert.strictEqual(res.body.message, 'User updated successfully')
        assert.strictEqual(changedUser.pseudo, 'Alice Updated')
        assert.strictEqual(changedUser.email, 'alice.updated@example.com')
    })

    test('Get users not connected', async () => {
        const req = { user: {}, query: {} }
        const res = createMockRes()
        await getUsers(req, res)
        assert.strictEqual(res.statusCode, 401)
        assert.strictEqual(res.body.message, 'not connected')
    })

    test('Get users with empty search', async () => {
        const req = {
            user: { id: 1 },
            query: { q: '   ' }
        }
        const res = createMockRes()
        await getUsers(req, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body.users, [])
    })

    test('Get users good', async () => {
        searchedUsers = [{ id: 2, pseudo: 'Alice Friend' }]
        const req = {
            user: { id: 1 },
            query: { q: 'Alice' }
        }
        const res = createMockRes()
        await getUsers(req, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body.users, searchedUsers)
    })

    test('Get global leaderboard good', async () => {
        leaderboardResult = [{ pseudo: 'Alice', score: 4 }]
        const req = {
            user: { id: 1 },
            query: { type: 'score', scope: 'global' }
        }
        const res = createMockRes()
        await getLeaderboard(req, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body.result, leaderboardResult)
    })

    test('Get friends tournament leaderboard good', async () => {
        leaderboardResult = [{ pseudo: 'Alice', winrate: '100.0' }]
        const req = {
            user: { id: 1 },
            query: { type: 'wr', scope: 'friends', tournament: 'Test Open' }
        }
        const res = createMockRes()
        await getLeaderboard(req, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body.result, leaderboardResult)
    })

    test('Get leaderboard with invalid parameters', async () => {
        const req = {
            user: { id: 1 },
            query: { type: 'invalid', scope: 'global' }
        }
        const res = createMockRes()
        await getLeaderboard(req, res)
        assert.strictEqual(res.statusCode, 400)
        assert.strictEqual(res.body.message, 'invalid query parameters')
    })
})
