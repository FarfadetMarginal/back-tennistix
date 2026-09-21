const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const mailSender2 = require('../tools/mailSender2')
const { findUserByEmail, createUser, createPassToken, changePassword } = require('../models/userModels')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '150d'

//helper : on génère des tokens
const generateToken = (id) =>{
    return jwt.sign({id}, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    })
}
const generateToken2 = (id) =>{
    return jwt.sign({id}, JWT_SECRET, {
        expiresIn: '15m'
    })
}

//créer un compte
exports.register = async(req, res)=>{
    try {
        const {pseudo, email, password, role} = req.body
        
        //on check si champs non vide
        if(!pseudo ||!email || !password){
            return res.status(400).json({message : 'empty field'})
        }

        const isPasswordOk = validator.isStrongPassword(password, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })

        if(!isPasswordOk){
            return res.status(400).json({message: "password not valid : 1 maj 1 min 1 number 1 special chars 6 total required"})
        }

        const isEmailOk = validator.isEmail(email)

        if(!isEmailOk){
            return res.status(400).json({message: "email not valid"})
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'email already in use' });
        }

        const user = await createUser(pseudo, email, hashedPassword, role)

        const token = generateToken(user.id)

        return res.status(201).json({
            message : 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        })
    } catch (err) {
        res.status(500).json({error : err.message})
    }
}


exports.login = async (req, res) =>{
    try {
        const {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({message : 'empty field'})
        }
        
        //find user and select password field
        const user = await findUserByEmail(email);

        if(!user){
            return res.status(401).json({message : 'invalid credantials'})
        }

        //check password match
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).json({message : 'incorrect password'})
        }
        const token = generateToken(user.id)

        return res.status(200).json({
            message : 'User login successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        })

    } catch (err) {
        res.status(500).json({message : 'server error during login', error: err.message})
    }
}

//reset password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        if(!email){
            return res.status(400).json({message : 'empty field'})
        }
        
        const changedUser = await findUserByEmail(email);
        
        if(!changedUser){
            return res.status(404).json({message : 'user not found'})
        }

        const token2 = generateToken2(changedUser.id)

        await mailSender2(email, changedUser.pseudo, token2);

        await createPassToken(token2, email)

        return res.status(200).json({
            message : 'mail sent'
        })
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
}

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    const token2 = req.params.id
    try {
        const decoded = jwt.verify(token2, JWT_SECRET); 

        const changedUser = await findUserByEmail(email)

        if(!changedUser){
            return res.status(404).json({message : 'user not found'})
        }

        if(token2 != changedUser.reset_token){
            return res.status(401).json({ message: 'unvalid token' });
        }

        if(decoded.id != changedUser.id){
            return res.status(401).json({ message: 'unvalid token' });
        }

        const isPasswordOk = validator.isStrongPassword(newPassword, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })

        if(!isPasswordOk){
            return res.status(400).json({message: "password not valid : 1 maj 1 min 1 number 1 special chars 6 total required"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await changePassword(hashedPassword, decoded.id)

        return res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        return res.status(401).json({ message: 'unvalid token' });
    }
}