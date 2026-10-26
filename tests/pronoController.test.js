const { test, describe } = require('node:test')
const assert = require('node:assert')
require('dotenv').config()

const pronoModels = require('../models/pronoModels.js')
const matchHandler = require('../tools/matchHandler.js')

let scheduledCache, existingProno, existingMatch, createdMatch, createdProno

matchHandler.getScheduledCache = () => scheduledCache
pronoModels.findMatchById = async () => existingMatch
pronoModels.createMatch = async (...args) => {
    createdMatch = args
    return { id_api: args[0] }
}
pronoModels.findExistingProno = async () => existingProno
pronoModels.createProno = async (...args) => {
    createdProno = args
    return { id: 1, user_id: args[0], match_id: args[1], prono: args[2] }
}

const { newProno } = require('../controllers/pronoController')

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

describe('Test unitaire pronostics', () => {

    test('New prono not connected', async () => {
        const req = { body: { match_id: 10, prono: 1 } }
        const res = createMockRes()
        await newProno(req, res)
        assert.strictEqual(res.statusCode, 401)
        assert.strictEqual(res.body.message, 'not connected')
    })

    test('New prono missing parameters', async () => {
        const req = {
            user: { id: 1 },
            body: { match_id: 10 }
        }
        const res = createMockRes()
        await newProno(req, res)
        assert.strictEqual(res.statusCode, 400)
        assert.strictEqual(res.body.message, 'missing parameters')
    })

    test('New prono with no planned matches', async () => {
        scheduledCache = { data: [] }
        const req = {
            user: { id: 1 },
            body: { match_id: 10, prono: 1 }
        }
        const res = createMockRes()
        await newProno(req, res)
        assert.strictEqual(res.statusCode, 503)
        assert.strictEqual(res.body.message, 'no matches planned right now')
    })

    test('New prono match not found', async () => {
        scheduledCache = { data: [{ match_id: 11 }] }
        const req = {
            user: { id: 1 },
            body: { match_id: 10, prono: 1 }
        }
        const res = createMockRes()
        await newProno(req, res)
        assert.strictEqual(res.statusCode, 404)
        assert.strictEqual(res.body.message, 'match not found')
    })

    test('New prono good', async () => {
        const match = {
            match_id: 12,
            player1_id: 31,
            player2_id: 32,
            tournament: 'Test Open',
            start_time: '2026-10-26T12:00:00Z',
            status: 'scheduled'
        }
        scheduledCache = { data: [match] }
        existingMatch = null
        existingProno = null
        const req = {
            user: { id: 1 },
            body: { match_id: 12, prono: 1 }
        }
        const res = createMockRes()
        await newProno(req, res)
        assert.strictEqual(res.statusCode, 201)
        assert.strictEqual(createdMatch[0], 12)
        assert.deepStrictEqual(createdProno, [1, 12, 1, null])
        assert.strictEqual(res.body.match_id, 12)
    })

    test('New prono already exists', async () => {
        scheduledCache = { data: [{ match_id: 12 }] }
        existingMatch = { id_api: 12 }
        existingProno = { id: 1 }
        const req = {
            user: { id: 1 },
            body: { match_id: 12, prono: 1 }
        }
        const res = createMockRes()
        await newProno(req, res)
        assert.strictEqual(res.statusCode, 400)
        assert.strictEqual(res.body.message, 'you have already placed a prono for this match')
    })
})
