const { findRequest, sendRequest, findPendingRequest, acceptRequest, declineRequest, findFriends, findAllPendingRequest } = require('../models/friendsModels.js');

exports.sendRequest = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const senderId = req.user.id;
        const receiverId = parseInt(req.params.id, 10);
        
        if (senderId == receiverId) {
            return res.status(400).json({
                message: 'you cannot send a friend request to yourself'
            });
        }

        const existingRequest = await findRequest(senderId, receiverId)
        
        if(existingRequest){
            return res.status(400).json({request : existingRequest})
        }

        const result2 = await sendRequest(senderId, receiverId)

        return res.status(200).json({
            message : 'friend request sent successfully',
            friendRequest: result2
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.acceptRequest = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const senderId = parseInt(req.params.id, 10);
        const receiverId = req.user.id;

        const result2 = await findPendingRequest(senderId, receiverId)
        if(!result2){
            return res.status(404).json({message : 'friend request not found'})
        }

        const result = await acceptRequest(senderId, receiverId)

        return res.status(200).json({
            message : 'friend request accepted successfully', 
            friendship: result})
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.declineRequest = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const senderId = parseInt(req.params.id, 10);
        const receiverId = req.user.id; 

        const result2 = await findPendingRequest(senderId, receiverId)
        if(!result2){
            return res.status(404).json({message : 'friend request not found'})
        }

        await declineRequest(senderId, receiverId)

        return res.status(200).json({
            message : 'friend request declined successfully'})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.getFriends = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const senderId = req.user.id;

        const result = await findFriends(senderId)

        return res.status(200).json({
            message : 'friend list displayed successfully', 
            friendlist : result})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}

exports.getRequest = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const receiverId = req.user.id; 

        const result2 = await findAllPendingRequest(receiverId)
        if(result2.length<=0){
            return res.status(404).json({message : 'no friend request pending'})
        }
        return res.status(200).json({
            message : 'friend list displayed successfully', 
            requestlist : result2})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}

