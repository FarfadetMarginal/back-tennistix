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


exports.getUsers = async (req, res) => {
    try {
        if(!req.user.id){
            return res.status(401).json({message : 'not connected'})
        }
        
        const querySearch = req.query.q || '';

        if (!querySearch.trim()) {
            return res.status(200).json({ users: [] });
        }

        const query = `SELECT pseudo, id FROM "Users" WHERE pseudo ILIKE $1 AND id != $2 LIMIT 20`

        const result = await pool.query(query, [querySearch , req.user.id])

        return res.status(200).json({
            message : 'research succesful', 
            users: result.rows})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
};


//lb global, par wr
const queryGlobalWr = `SELECT u.pseudo, COUNT(p.id) as total_pronos, COUNT(CASE WHEN p.result = true THEN 1 END) as wins, ROUND(COUNT(CASE WHEN p.result = true THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0), 1) as winrate 
FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id 
WHERE p.result IS NOT NULL GROUP BY u.id, u.pseudo ORDER BY winrate DESC`

//lb global, par score
const queryGlobalScore = `SELECT u.pseudo, u.score
FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id 
WHERE p.result IS NOT NULL GROUP BY u.id, u.pseudo, u.score ORDER BY u.score DESC`

//lb global par tournoi par wr
const queryTournamentWr = `SELECT u.pseudo, COUNT(p.id) as total_pronos, COUNT(CASE WHEN p.result = true THEN 1 END) as wins, ROUND(COUNT(CASE WHEN p.result = true THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0), 1) as winrate 
FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id JOIN "Matchs" m ON m.id_api = p.match_id 
WHERE p.result IS NOT NULL AND m.tournament_name = $1 GROUP BY u.id, u.pseudo ORDER BY winrate DESC`

//lb global par tournoi par score
const queryTournamentScore = `SELECT u.pseudo, COUNT(CASE WHEN p.result = true THEN 1 END) AS score_tournoi
FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id JOIN "Matchs" m ON m.id_api = p.match_id
WHERE p.result IS NOT NULL AND m.tournament_name = $1 GROUP BY u.id, u.pseudo ORDER BY score_tournoi DESC`

//lb ami par wr
const queryFriendsWr = `SELECT u.pseudo, COUNT(p.id) as total_pronos, COUNT(CASE WHEN p.result = true THEN 1 END) as wins, ROUND(COUNT(CASE WHEN p.result = true THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0), 1) as winrate
FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id
WHERE p.result IS NOT NULL AND u.id IN (SELECT $1 UNION SELECT CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END
FROM "Friends" f WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted')
GROUP BY u.id, u.pseudo
ORDER BY winrate DESC`

//lb ami par score
const queryFriendsScore = `SELECT u.pseudo, u.score
FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id
WHERE p.result IS NOT NULL AND u.id IN (SELECT $1 UNION SELECT CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END
FROM "Friends" f WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted')
GROUP BY u.id, u.pseudo, u.score
ORDER BY u.score DESC`

//lb friends par tournoi par wr
const queryFriendsTournamentWr = `SELECT u.pseudo, COUNT(p.id) as total_pronos, COUNT(CASE WHEN p.result = true THEN 1 END) as wins, ROUND(COUNT(CASE WHEN p.result = true THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0), 1) as winrate 
FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id JOIN "Matchs" m ON m.id_api = p.match_id
WHERE p.result IS NOT NULL AND u.id IN 
    (SELECT $1 UNION SELECT CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END 
    FROM "Friends" f 
    WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted') AND m.tournament_name = $2
GROUP BY u.id, u.pseudo ORDER BY winrate DESC`

//lb friends par tournoi par score
const queryFriendsTournamentScore = `SELECT u.pseudo, COUNT(CASE WHEN p.result = true THEN 1 END) AS score_tournoi
FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id JOIN "Matchs" m ON m.id_api = p.match_id
WHERE p.result IS NOT NULL AND u.id IN 
    (SELECT $1 UNION SELECT CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END 
    FROM "Friends" f 
    WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted') AND m.tournament_name = $2
GROUP BY u.id, u.pseudo ORDER BY score_tournoi DESC`

exports.getLeaderboard = async (req, res) => {
    try {
        if(!req.user?.id){
            return res.status(401).json({message : 'not connected'})
        }

        const type = req.query.type || 'score';
        const scope = req.query.scope || 'global';
        const tournament = req.query.tournament;

        let query = '';
        let values = [];


        if(scope == 'global' && type == 'wr' && !tournament ){
            query = queryGlobalWr
        }

        if(scope == 'global' && type == 'score' && !tournament ){
            query = queryGlobalScore
        }

        if(scope == 'global' && type == 'wr' && tournament ){
            query = queryTournamentWr
            values = [tournament]
        }

        if(scope == 'global' && type == 'score' && tournament ){
            query = queryTournamentScore
            values = [tournament]
        }
        
        if(scope == 'friends' && type == 'wr' && !tournament ){
            query = queryFriendsWr
            values = [req.user.id]
        }

        if(scope == 'friends' && type == 'score' && !tournament ){
            query = queryFriendsScore
            values = [req.user.id]
        }

        if(scope == 'friends' && type == 'wr' && tournament ){
            query = queryFriendsTournamentWr
            values = [req.user.id, tournament]
        }

        if(scope == 'friends' && type == 'score' && tournament ){
            query = queryFriendsTournamentScore
            values = [req.user.id, tournament]
        }
        
        if (!query) {
            return res.status(400).json({ message: 'invalid query parameters' });
        }

        const result = await pool.query(query, values)

        return res.status(200).json({
            message : 'leaderboard displayed succesfully', 
            users: result.rows})
            
    } catch (error) {
        return res.status(400).json({message : error.message})
    }
};
