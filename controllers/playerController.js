const { getPlayersCache } = require('../tools/matchHandler.js');
const { findUserById } = require('../models/userModels.js');
const { addFavPlayer } = require('../models/playerModels.js');


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
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }

        const { player_id } = req.body
        
        const changedUser = await findUserById(req.user.id)

        const currentfav = changedUser.favs || []
        
        let newfav = currentfav.map(id => parseInt(id, 10));

         if(newfav.includes(player_id)){
            newfav = newfav.filter(
                id => id !== player_id
            )
        } else {
            newfav.push(player_id)
        }
        
        const newUser = await addFavPlayer(newfav, req.user.id)

        return res.status(200).json({
            message : 'fav updated successfully',
            user: {
                pseudo: newUser.pseudo,
                favs: newUser.favs,
            }
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}
