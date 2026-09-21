const { pool } = require('../config/db'); 
const { findMatchById, createProno, createMatch } = require('../models/pronoModels.js');
const { getScheduledCache } = require('../tools/matchHandler.js');


exports.newProno = async (req, res) =>{
    try {
        const data = getScheduledCache();
        const { match_id, prono } = req.body

        if (!data?.data || data.data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });

        const match = data.data.find(m => m.match_id == match_id)

        if(!match){
            return res.status(404).json({ message: 'match not found' })
        }

        const result3 = await findMatchById(match_id)
        if(result3.rows.length === 0){
            await createMatch(match.match_id, match.player1_id, match.player2_id, null, match.tournament, match.start_time, match.status)
        }
        
        const result2 = await createProno(req.user.id, match.match_id, prono, null)

        res.status(201).json(result2)
    } catch (err) {
        res.status(500).json({message : 'server error during prono', error: err.message})
    }
}
