const { pool } = require('../config/db.js') 

exports.getLive = async (req, res) =>{
    try {
        const {email, password} = req.body
        if(!email || !password){
            res.status(400).json({message : 'empty field'})
        }

        //find user and select password field
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