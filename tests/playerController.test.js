const { test, describe } = require('node:test')
const assert = require('node:assert')
require('dotenv').config()

const matchHandler = require('../tools/matchHandler.js')
const userModels = require('../models/userModels.js')
const playerModels = require('../models/playerModels.js')

let playersCache, playersCacheError, currentUser, savedFavs, savedUserId

matchHandler.getPlayersCache = () => {
    if (playersCacheError) throw playersCacheError
    return playersCache
}
userModels.findUserById = async () => currentUser
playerModels.addFavPlayer = async (favs, id) => {
    savedFavs = favs
    savedUserId = id
    return { pseudo: currentUser.pseudo, favs }
}

const { getPlayers, favPlayer } = require('../controllers/playerController')

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

describe('Test unitaire players', () => {

    test('Get players good', async () => {
        playersCache = { data: [{ player_id: 1, name: 'Alice Player' }] }
        const res = createMockRes()
        await getPlayers({}, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body, playersCache)
    })

    test('Get players error', async () => {
        playersCacheError = new Error('cache error')
        const res = createMockRes()
        await getPlayers({}, res)
        assert.strictEqual(res.statusCode, 500)
        assert.strictEqual(res.body.error, 'cache error')
        playersCacheError = null
    })

    test('Favorite player not connected', async () => {
        const req = { body: { player_id: 12 } }
        const res = createMockRes()
        await favPlayer(req, res)
        assert.strictEqual(res.statusCode, 401)
        assert.strictEqual(res.body.message, 'not connected')
    })

    test('Add favorite player', async () => {
        currentUser = { pseudo: 'Alice', favs: [9] }
        const req = {
            user: { id: 1 },
            body: { player_id: 12 }
        }
        const res = createMockRes()
        await favPlayer(req, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(savedFavs, [9, 12])
        assert.strictEqual(savedUserId, 1)
        assert.deepStrictEqual(res.body.user.favs, [9, 12])
    })

    test('Remove favorite player', async () => {
        currentUser = { pseudo: 'Alice', favs: [12] }
        const req = {
            user: { id: 1 },
            body: { player_id: 12 }
        }
        const res = createMockRes()
        await favPlayer(req, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body.user.favs, [])
    })
})
