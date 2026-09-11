const bcrypt = require('bcryptjs')
const validator = require('validator')
const { pool } = require('../config/db.js') 

//modifier infos
exports.updateUser = async (req, res) => {
    try {
        if(!req.user.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const query = 'SELECT * FROM "Users" WHERE id = $1' 
        const query2 = 'UPDATE "Users" SET pseudo = $1, email = $2, password = $3, pp= $4 WHERE id = $5 RETURNING *'

        const result = await pool.query(query, [req.user.id])
        
        const changedUser = result.rows[0]

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

        const result2 = await pool.query(query2, [changedUser.pseudo, changedUser.email, changedUser.password, changedUser.pp, req.user.id])
        
        const newUser = result2.rows[0]

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


// exports.addFriend = async (req, res) => {
//     try {
//         if(!req.user.id){
//             return res.status(401).json({message : 'not connected'})
//         }
        
//         const query = 'SELECT * FROM "Users" WHERE id = $1' 
//         const query2 = 'UPDATE "Users" SET friends = $1 WHERE id = $2 RETURNING *'

//         const { user_id } = req.body

//         const result = await pool.query(query, [user_id])
        
//         const changedUser = result.rows[0]

//         const currentfriends = changedUser.friends || []
        
//         let newfriends = currentfriends.map(id => parseInt(id, 10));

//          if(newfriends.includes(req.user.id)){
//             newfriends = newfriends.filter(
//                 id => id !== req.user.id
//             )
//         } else {
//             newfriends.push(req.user.id)
//         }

//         const result2 = await pool.query(query2, [newfriends, user_id])
        
//         const newUser = result2.rows[0]

//         return res.status(200).json({
//             message : 'friends request sent / cancelled successfully',
//             user: {
//                 pseudo: newUser.pseudo,
//                 friends: newUser.friends,
//             }
//         })
//     } catch (error) {
//         return res.status(400).json({message : error.message})
//     }
// }


// exports.getFriends = async (req, res) => {
//     try {
//         if(!req.user.id){
//             return res.status(401).json({message : 'not connected'})
//         }
        
//         const query = 'SELECT pseudo, friends FROM "Users" WHERE id = $1' 
//         const query2 = 'SELECT pseudo, friends FROM "Users" WHERE id = ANY($1)' 
//         const query3 = 'SELECT pseudo FROM "Users" WHERE friends = $1' 

//         const result = await pool.query(query, [req.user.id])
        
//         const changedUser = result.rows[0]

//         const currentfriends = changedUser.friends || []

//         const result2 = await pool.query(query2, [currentfriends])
        
//         const realfriends = []

//         for(const item of result2.rows) {
//             const result3 = await pool.query(query3, [req.user.id])
//             realfriends.push(result3.rows[0])
//         }

//         return res.status(200).json({ message : 'friends updated successfully', realfriends })
//     } catch (error) {
//         return res.status(400).json({message : error.message})
//     }
// }


// exports.getFriendRequest = async (req, res) => {
//     try {
//         if(!req.user.id){
//             return res.status(401).json({message : 'not connected'})
//         }
        
//         const query = 'SELECT pseudo, friends FROM "Users" WHERE id = $1' 
//         const query2 = 'SELECT pseudo, friends FROM "Users" WHERE id = ANY($1)' 
//         const query3 = 'SELECT pseudo FROM "Users" WHERE NOT friends = $1' 

//         const result = await pool.query(query, [req.user.id])
        
//         const changedUser = result.rows[0]

//         const currentfriends = changedUser.friends || []

//         const result2 = await pool.query(query2, [currentfriends])
        
//         const notfriends = []

//         for(const item of result2.rows) {
//             const result3 = await pool.query(query3, [req.user.id])
//             notfriends.push(result3.rows[0])
//         }

//         return res.status(200).json({ message : 'friends updated successfully', notfriends })
//     } catch (error) {
//         return res.status(400).json({message : error.message})
//     }
// }


