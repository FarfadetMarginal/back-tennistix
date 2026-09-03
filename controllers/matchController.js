const { pool } = require('../config/db.js') 
const { getLiveCache, getScheduledCache, getFinishedATPCache, getFinishedWTACache } = require('../tools/matchHandler.js');


exports.getLive = (req, res) => {
    const data = getLiveCache();
    if (!data || data.length === 0) return res.status(503).json({ message: 'no live matches right now' });
    res.json(data);
};

exports.getIncoming = async (req, res) =>{
    try {
        const data = getScheduledCache();
        if (!data || data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });
        res.json(data);
    } catch (err) {
        res.status(500).json({message : 'server error during incocming matches display', error: err.message})
    }
}

exports.getFinishedATP = async (req, res) => {
    try {
        const data = getFinishedATPCache()
        if (!data || data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getFinishedWTA = async (req, res) => {
    try {
        const data = getFinishedWTACache()
        if (!data || data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
