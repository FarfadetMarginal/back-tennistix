const { pool } = require('../config/db.js') 

exports.sendRequest = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const senderId = req.user.id;
        const receiverId = parseInt(req.params.id, 10);
        
        if (senderId === receiverId) {
            return res.status(400).json({
                message: 'you cannot send a friend request to yourself'
            });
        }

        const query = 'SELECT status FROM "Friends" WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)' 
        const query2 = 'INSERT INTO "Friends"(sender_id, receiver_id) VALUES($1, $2) RETURNING *'

        const result = await pool.query(query, [senderId, receiverId])
        
        const existingRequest = result.rows[0]
        if(existingRequest){
            return res.status(200).json({request : existingRequest})
        }


        const result2 = await pool.query(query2, [senderId, receiverId])

        return res.status(200).json({
            message : 'friend request sent successfully',
            friendRequest: result2.rows[0]
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.acceptRequest = async (req, res) => {
    try {
        if(!req.user.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const senderId = req.user.id;
        const receiverId = parseInt(req.params.id, 10);

        const query = `UPDATE "Friends" SET status = $1 WHERE sender_id = $2 AND receiver_id = $3 AND status = 'pending' RETURNING *`

        const result = await pool.query(query, ["accepted", senderId, receiverId])

        return res.status(200).json({
            message : 'friend request accepted successfully', 
            friendship: result.rows[0]})
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.declineRequest = async (req, res) => {
    try {
        if(!req.user.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const senderId = req.user.id;
        const receiverId = parseInt(req.params.id, 10);


        const query = `DELETE FROM "Friends" WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending' RETURNING *`

        const result = await pool.query(query, [senderId, receiverId])

        if(!result.rows[0]){
            return res.status(404).json({message : 'request not found'})
        }

        return res.status(200).json({
            message : 'friend request declined successfully'})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.getFriends = async (req, res) => {
    try {
        if(!req.user.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const senderId = req.user.id;

        const query = `SELECT u.id, u.pseudo FROM "Friends" f JOIN "Users" u ON u.id = CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted'`

        const result = await pool.query(query, [senderId])

        return res.status(200).json({
            message : 'friend list displayed successfully', 
            friendlist : result.rows})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}

