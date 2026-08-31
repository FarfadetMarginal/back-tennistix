const { pool } = require('../config/db.js') 
const { getLiveCache, getScheduledCache } = require('../tools/matchSaver');


exports.getLive = async (req, res) =>{
    try {
        const data = getLiveCache();
        if (!data) return res.status(503).json({ message: 'no live matches right now' });
        res.json(data);
    } catch (err) {
        res.status(500).json({message : 'server error during live matches display', error: err.message})
    }
}

exports.getIncoming = async (req, res) =>{
    try {
        const data = getScheduledCache();
        if (!data || data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });
        res.json(data);
    } catch (err) {
        res.status(500).json({message : 'server error during incocming matches display', error: err.message})
    }
}

exports.getFinished = async (req, res) =>{
    try {
        const query = `SELECT * FROM "Matchs" WHERE status='finished' ORDER BY scheduled_at DESC `
        const result = await pool.query(query)

        if (result.rows.length === 0) {
            return res.status(404).json({message: 'no finished matches found'})
        }
        res.json(result.rows);

    } catch (err) {
        res.status(500).json({message : 'server error during finished matches display', error: err.message})
    }
}