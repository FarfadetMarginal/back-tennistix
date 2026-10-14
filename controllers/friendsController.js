const { findRequest, sendRequest, findPendingRequest, acceptRequest, declineRequest, findFriends, findAllPendingRequest } = require('../models/friendsModels.js');

exports.sendRequest = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({ 
                title: 'not connected',
                status: 401,
                detail: 'user not connected'
            });
        }
        
        const senderId = req.user.id;
        const receiverId = parseInt(req.params.id, 10);
        
        if (senderId == receiverId) {
            return res.status(400).json({ 
            title: 'self request',
            status: 400,
            detail: "you can't send a friend request to yourself"
        });
        }

        const existingRequest = await findRequest(senderId, receiverId)
        
        if(existingRequest){
            return res.status(409).json({ 
                title: 'existing request',
                status: 409,
                detail: 'friend request already sent'
            });
        }

        const result = await sendRequest(senderId, receiverId)

        return res.status(200).json({
            message : 'friend request sent successfully',
            friendRequest: result
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.acceptRequest = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({ 
                title: 'not connected',
                status: 401,
                detail: 'user not connected'
            });
        }
        
        const senderId = parseInt(req.params.id, 10);
        const receiverId = req.user.id;

        const pendingRequest = await findPendingRequest(senderId, receiverId)
        if(!pendingRequest){
            return res.status(404).json({ 
                title: 'request not found',
                status: 404,
                detail: 'friend request not found'
            });
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
            return res.status(401).json({ 
                title: 'not connected',
                status: 401,
                detail: 'user not connected'
            });
        }
        
        const senderId = parseInt(req.params.id, 10);
        const receiverId = req.user.id; 

        const pendingRequest = await findPendingRequest(senderId, receiverId)
        if(!pendingRequest){
            return res.status(404).json({ 
                title: 'request not found',
                status: 404,
                detail: 'friend request not found'
            });
        }

        await declineRequest(senderId, receiverId)

        return res.status(200).json({ 
                title: 'request declined',
                status: 200,
                detail: 'friend request declined successfully'
            });
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.getFriends = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({ 
                title: 'not connected',
                status: 401,
                detail: 'user not connected'
            });
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
            return res.status(401).json({ 
                title: 'not connected',
                status: 401,
                detail: 'user not connected'
            });
        }
        
        const receiverId = req.user.id; 

        const pendingRequests = await findAllPendingRequest(receiverId)
        if(pendingRequests.length<=0){
            return res.status(404).json({ 
                title: 'request not found',
                status: 404,
                detail: 'pending friend request not found'
            });
        }
        return res.status(200).json({
            message : 'friend list displayed successfully', 
            requestlist : result2})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}

