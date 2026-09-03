const { pool } = require('../config/db') 

exports.tryProno = async (req, res) =>{
    try {
        const data = getScheduledCache();

        if (!data || data.length === 0) return res.status(503).json({ message: 'no matches planned right now' });

        const query = 'INSERT INTO "Matchs"(id_api, id_player1, id_player2, result, tournament_name, tournament_id, scheduled, status) VALUES($1, $2, $3, $4) RETURNING *' 
        const result = await pool.query(query, [email])
        res.json(data);
    } catch (err) {
        res.status(500).json({message : 'server error during incocming matches display', error: err.message})
    }
}
