const bcrypt = require('bcryptjs')
const validator = require('validator')
const { findUserById, searchUser, getGlobalWr, getGlobalScore, getTournamentWr, getTournamentScore, getFriendsWr, getFriendsScore, getFriendsTournamentWr, getFriendsTournamentScore, changeUser } = require('../models/userModels.js')

//modifier infos
exports.updateUser = async (req, res) => {
    try {
        if(!req.user.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const changedUser = await findUserById(req.user.id)

        if (req.body.pseudo!=null){
            changedUser.pseudo = req.body.pseudo
        }
        if (req.body.email!=null){
            const isEmailOk = validator.isEmail(req.body.email)
    
            if(!isEmailOk){
                return res.status(400).json({message: "email not valid"})
            }
            changedUser.email = req.body.email
        }
        if (req.body.password!=null){
            const isPasswordOk = validator.isStrongPassword(req.body.password, {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
    
            if(!isPasswordOk){
                return res.status(400).json({message: "password not valid : 1 maj 1 min 1 number 1 special chars 6 total required"})
            }
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            changedUser.password = hashedPassword
        }
        if (req.body.pp!=null){
            changedUser.pp = req.body.pp
        }
        
        const newUser = await changeUser(changedUser.pseudo, changedUser.email, changedUser.password, changedUser.pp, req.user.id)

        return res.status(200).json({
            message : 'User updated successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            }
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}


exports.getUsers = async (req, res) => {
    try {
        if(!req.user.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const querySearch = req.query.q || '';

        if (!querySearch.trim()) {
            return res.status(200).json({ users: [] });
        }

        const result = await searchUser(querySearch , req.user.id)

        return res.status(200).json({
            message : 'research succesful', 
            users: result})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }

        const type = req.query.type || 'score';
        const scope = req.query.scope || 'global';
        const tournament = req.query.tournament;

        let result = [];

        if(scope == 'global' && type == 'wr' && !tournament ){
            result = await getGlobalWr()
        }

        if(scope == 'global' && type == 'score' && !tournament ){
            result = await getGlobalScore()
        }

        if(scope == 'global' && type == 'wr' && tournament ){
            result = await getTournamentWr(tournament)
        }

        if(scope == 'global' && type == 'score' && tournament ){
            result = await getTournamentScore(tournament)
        }
        
        if(scope == 'friends' && type == 'wr' && !tournament ){
            result = await getFriendsWr(req.user.id)
        }

        if(scope == 'friends' && type == 'score' && !tournament ){
            result = await getFriendsScore(req.user.id)
        }

        if(scope == 'friends' && type == 'wr' && tournament ){
            result = await getFriendsTournamentWr(req.user.id, tournament)
        }

        if(scope == 'friends' && type == 'score' && tournament ){
            result = await getFriendsTournamentScore(req.user.id, tournament)
        }
        
        if (!['global', 'friends'].includes(scope) || !['wr', 'score'].includes(type)) {
            return res.status(400).json({ message: 'invalid query parameters' });
        }

        return res.status(200).json({
            message : 'leaderboard displayed succesfully', 
            result})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
};
