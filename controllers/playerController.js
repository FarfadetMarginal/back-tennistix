const { getPlayersCache } = require('../tools/matchHandler.js');
const { pool } = require('../config/db.js') 


exports.getPlayers = async (req, res) => {
    try {
        const data = getPlayersCache()
        if (!data || data.length === 0) return res.status(503).json({ message: 'no players found' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.favPlayer = async (req, res) => {
    try {
        if(!req.user.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const query = 'SELECT * FROM "Users" WHERE id = $1' 
        const query2 = 'UPDATE "Users" SET favs = $1 WHERE id = $2 RETURNING *'

        const { player_id } = req.body

        const result = await pool.query(query, [req.user.id])
        
        const changedUser = result.rows[0]

        const currentfav = changedUser.favs || []
        
        let newfav = currentfav.map(id => parseInt(id, 10));

         if(newfav.includes(player_id)){
            newfav = newfav.filter(
                id => id !== player_id
            )
        } else {
            newfav.push(player_id)
        }

        const result2 = await pool.query(query2, [newfav, req.user.id])
        
        const newUser = result2.rows[0]

        return res.status(200).json({
            message : 'User registered successfully',
            user: {
                pseudo: newUser.pseudo,
                favs: newUser.favs,
            }
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}
