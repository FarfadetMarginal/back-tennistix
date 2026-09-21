const { findMatchById, createProno, createMatch, findExistingProno } = require('../models/pronoModels.js');
const { getScheduledCache } = require('../tools/matchHandler.js');


exports.newProno = async (req, res) =>{
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }
        const data = getScheduledCache();
        const { match_id, prono } = req.body

        if (!match_id || !prono) {
            return res.status(400).json({ message: 'missing parameters' });
        }

        if (!data?.data || data.data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });

        const match = data.data.find(m => m.match_id == match_id)

        if(!match){
            return res.status(404).json({ message: 'match not found' })
        }

        const result3 = await findMatchById(match_id)
        if(!result3){
            await createMatch(match.match_id, match.player1_id, match.player2_id, null, match.tournament, match.start_time, match.status)
        }

        const existingProno = await findExistingProno(req.user.id, match.match_id);
        if (existingProno) {
            return res.status(400).json({ message: 'you have already placed a prono for this match' });
        }
        
        const result2 = await createProno(req.user.id, match.match_id, prono, null)

        res.status(201).json(result2)
    } catch (err) {
        res.status(500).json({message : 'server error during prono', error: err.message})
    }
}
