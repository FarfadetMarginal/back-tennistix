const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const { pool } = require('../config/db') 
const mailSender = require('../tools/mailSender')

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
        
        const query = 'INSERT INTO "Users"(pseudo, email, password, role) VALUES($1, $2, $3, $4) RETURNING *'

        const result = await pool.query(query, [pseudo, email, hashedPassword, role || 'user'])

        const user = result.rows[0]

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
            res.status(400).json({message : 'empty field'})
        }
        
        //find user and select password field
        const query = 'SELECT * FROM "Users" WHERE email = $1' 
        
        const result = await pool.query(query, [email])
        
        const user = result.rows[0]

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
        const query = 'SELECT * FROM "Users" WHERE email = $1' 
        const query2 = 'UPDATE "Users" SET reset_token = $2 WHERE email = $1'
        const { email } = req.body
        if(!email){
            res.status(400).json({message : 'empty field'})
        }
        const result = await pool.query(query, [email])
        
        const changedUser = result.rows[0]
        
        if(!changedUser){
            return res.status(404).json({message : 'user not found'})
        }

        const token2 = generateToken2(changedUser.id)

        const send = await mailSender(email, changedUser.pseudo, token2);

        const result2 = await pool.query(query2, [email, token2])

        const changedUser2 = result2.rows[0]

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
    const query = 'UPDATE "Users" SET password = $1, reset_token = $3 WHERE id = $2'
    const query2 = 'SELECT id, reset_token FROM "Users" WHERE email = $1'
    try {
        const decoded = jwt.verify(token2, JWT_SECRET); 

        const result = await pool.query(query2, [email]);
        const changedUser = result.rows[0]

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

        await pool.query(query, [hashedPassword, decoded.id, null]);

        return res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        return res.status(401).json({ message: 'unvalid token' });
    }
}