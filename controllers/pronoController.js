const { pool } = require('../config/db') 
const { getScheduledCache } = require('../tools/matchHandler.js');


exports.newProno = async (req, res) =>{
    try {
        const data = getScheduledCache();
        const { match_id, prono } = req.body

        if (!data?.data || data.data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });

        const match = data.data.find(m => m.id == match_id)

        if(!match){
            return res.status(404).json({ message: 'match not found' })
        }

        const query3 = 'SELECT * FROM "Matchs" WHERE id_api=$1'
        const result3 = await pool.query(query3, [match_id])
        if(result3.rows.length === 0){
            const query = 'INSERT INTO "Matchs"(id_api, id_player1, id_player2, result, tournament_name, scheduled, status) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *' 
            const result = await pool.query(query, [match.id, match.player1_id, match.player2_id, null, match.tournament, match.start_time, match.status ])
        }

        const query2 = 'INSERT INTO "Pronostics"(user_id, match_id, prono, result) VALUES($1, $2, $3, $4) RETURNING *'
        const result2 = await pool.query(query2, [req.user.id, match.id, prono, null])

        res.status(201).json(result2)
    } catch (err) {
        res.status(500).json({message : 'server error during incoming matches display', error: err.message})
    }
}

exports.endProno = async (req, res) =>{
    try {
        

        res.status(201).json(result)
    } catch (err) {
        res.status(500).json({message : 'server error during incoming matches display', error: err.message})
    }
}

