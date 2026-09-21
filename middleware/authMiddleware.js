const jwt = require('jsonwebtoken')
const { findUserById } = require('../models/userModels')

const JWT_SECRET = process.env.JWT_SECRET

const authMiddleware = async (req, res, next) =>{
    try {
        let token

        if(req.headers.authorization?.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1]
        }

        if(!token){
            return res.status(401).json({message : 'not authorized, token missing'})
        }

        const decoded = jwt.verify(token, JWT_SECRET)

        //get user from token payload        
        const user = await findUserById(decoded.id)

        if(!user){
            return res.status(401).json({message : 'user no longer exists'})
        }

        req.user = user;
        next()
        
    } catch (err) {
        return res.status(401).json({message : 'not authorized, invalid token', error : err.message})
    }
}

module.exports = authMiddleware