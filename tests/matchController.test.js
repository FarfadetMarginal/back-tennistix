const { test, describe } = require('node:test')
const assert = require('node:assert')
require('dotenv').config()

const matchHandler = require('../tools/matchHandler.js')

let liveCache, scheduledCache, finishedATPCache, finishedWTACache

matchHandler.getLiveCache = () => liveCache
matchHandler.getScheduledCache = () => scheduledCache
matchHandler.getFinishedATPCache = () => finishedATPCache
matchHandler.getFinishedWTACache = () => finishedWTACache

const { getLive, getIncoming, getFinishedATP, getFinishedWTA } = require('../controllers/matchController')

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

describe('Test unitaire matches', () => {

    test('Get live matches good', () => {
        liveCache = [{ id: 1, status: 'live' }]
        const res = createMockRes()
        getLive({}, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body, liveCache)
    })

    test('Get live matches empty', () => {
        liveCache = []
        const res = createMockRes()
        getLive({}, res)
        assert.strictEqual(res.statusCode, 404)
        assert.strictEqual(res.body.detail, 'no match live')
    })

    test('Get incoming matches good', async () => {
        scheduledCache = [{ id: 2, status: 'scheduled' }]
        const res = createMockRes()
        await getIncoming({}, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body, scheduledCache)
    })

    test('Get incoming matches empty', async () => {
        scheduledCache = null
        const res = createMockRes()
        await getIncoming({}, res)
        assert.strictEqual(res.statusCode, 404)
        assert.strictEqual(res.body.detail, 'no match planned')
    })

    test('Get finished ATP matches good', async () => {
        finishedATPCache = [{ id: 3, tour: 'atp' }]
        const res = createMockRes()
        await getFinishedATP({}, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body, finishedATPCache)
    })

    test('Get finished WTA matches good', async () => {
        finishedWTACache = [{ id: 4, tour: 'wta' }]
        const res = createMockRes()
        await getFinishedWTA({}, res)
        assert.strictEqual(res.statusCode, 200)
        assert.deepStrictEqual(res.body, finishedWTACache)
    })
})
