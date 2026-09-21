const {pool} = require('../config/db')

exports.createUser = async (pseudo, email, hashedPassword, role) => {

    const { rows } = await pool.query(
        `INSERT INTO "Users"(pseudo, email, password, role) VALUES($1, $2, $3, $4) RETURNING *`,
        [pseudo, email.toLowerCase().trim(), hashedPassword, role || 'user']
    )

    return rows[0];
}

exports.findUserByEmail = async (email) => {
    const { rows } = await pool.query(
        `SELECT * FROM "Users" WHERE email = $1`,
        [email.toLowerCase().trim()]
    )

    return rows[0] || null;
}

exports.findUserById = async (id) => {
    const { rows } = await pool.query(
        `SELECT * FROM "Users" WHERE id = $1`,
        [id]
    )

    return rows[0] || null;
}

exports.createPassToken = async (token2, email) => {
    const { rows } = await pool.query(
        `UPDATE "Users" SET reset_token = $1 WHERE email = $2 RETURNING *`,
        [token2, email]
    )

    return rows[0];
}

exports.changePassword = async (hashedPassword, id) => {
    const { rows } = await pool.query(
        `UPDATE "Users" SET password = $1, reset_token = $2 WHERE id = $3`,
        [hashedPassword, null, id]
    )

    return rows[0];
}

exports.changeUser = async (pseudo, email, hashedPassword, pp, id) => {
    const { rows } = await pool.query(
        `UPDATE "Users" SET pseudo = $1, email = $2, password = $3, pp= $4 WHERE id = $5 RETURNING *`,
        [pseudo, email, hashedPassword, pp, id], 
    )

    return rows[0];
}

exports.searchUser = async (search, id) => {
    const { rows } = await pool.query(
        `SELECT pseudo, id FROM "Users" WHERE pseudo ILIKE $1 AND id != $2 LIMIT 20`,
        [`%${search}%`, id], 
    )

    return rows || null;
}

exports.getGlobalWr = async () => {

    const { rows } = await pool.query(
        `SELECT u.pseudo, COUNT(p.id) as total_pronos, COUNT(CASE WHEN p.result = true THEN 1 END) as wins, ROUND(COUNT(CASE WHEN p.result = true THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0), 1) as winrate 
        FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id 
        WHERE p.result IS NOT NULL GROUP BY u.id, u.pseudo ORDER BY winrate DESC`
    )

    return rows || null;
}

exports.getGlobalScore = async () => {

    const { rows } = await pool.query(
        `SELECT u.pseudo, u.score
        FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id 
        WHERE p.result IS NOT NULL GROUP BY u.id, u.pseudo, u.score ORDER BY u.score DESC`
    )

    return rows || null;
}

exports.getTournamentWr = async (tournament) => {

    const { rows } = await pool.query(
        `SELECT u.pseudo, COUNT(p.id) as total_pronos, COUNT(CASE WHEN p.result = true THEN 1 END) as wins, ROUND(COUNT(CASE WHEN p.result = true THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0), 1) as winrate 
        FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id JOIN "Matchs" m ON m.id_api = p.match_id 
        WHERE p.result IS NOT NULL AND m.tournament_name = $1 GROUP BY u.id, u.pseudo ORDER BY winrate DESC`,
        [tournament]
    )

    return rows || null;
}

exports.getTournamentScore = async (tournament) => {

    const { rows } = await pool.query(
        `SELECT u.pseudo, COUNT(CASE WHEN p.result = true THEN 1 END) AS score_tournoi
        FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id JOIN "Matchs" m ON m.id_api = p.match_id
        WHERE p.result IS NOT NULL AND m.tournament_name = $1 GROUP BY u.id, u.pseudo ORDER BY score_tournoi DESC`, 
        [tournament]
    )

    return rows || null;
}

exports.getFriendsWr = async (id) => {

    const { rows } = await pool.query(
        `SELECT u.pseudo, COUNT(p.id) as total_pronos, COUNT(CASE WHEN p.result = true THEN 1 END) as wins, ROUND(COUNT(CASE WHEN p.result = true THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0), 1) as winrate
        FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id
        WHERE p.result IS NOT NULL AND u.id IN (SELECT $1 UNION SELECT CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END
        FROM "Friends" f WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted')
        GROUP BY u.id, u.pseudo
        ORDER BY winrate DESC`,
        [id]
    )

    return rows || null;
}

exports.getFriendsScore = async (id) => {

    const { rows } = await pool.query(
        `SELECT u.pseudo, u.score
        FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id
        WHERE p.result IS NOT NULL AND u.id IN (SELECT $1 UNION SELECT CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END
        FROM "Friends" f WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted')
        GROUP BY u.id, u.pseudo, u.score
        ORDER BY u.score DESC`, 
        [id]
    )

    return rows || null;
}

exports.getFriendsTournamentWr = async (id, tournament) => {

    const { rows } = await pool.query(
        `SELECT u.pseudo, COUNT(p.id) as total_pronos, COUNT(CASE WHEN p.result = true THEN 1 END) as wins, ROUND(COUNT(CASE WHEN p.result = true THEN 1 END) * 100.0 / NULLIF(COUNT(p.id), 0), 1) as winrate 
        FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id JOIN "Matchs" m ON m.id_api = p.match_id
        WHERE p.result IS NOT NULL AND u.id IN 
            (SELECT $1 UNION SELECT CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END 
            FROM "Friends" f 
            WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted') AND m.tournament_name = $2
        GROUP BY u.id, u.pseudo ORDER BY winrate DESC`, 
        [id, tournament]
    )

    return rows || null;
}

exports.getFriendsTournamentScore = async (id, tournament) => {

    const { rows } = await pool.query(
        `SELECT u.pseudo, COUNT(CASE WHEN p.result = true THEN 1 END) AS score_tournoi
        FROM "Users" u JOIN "Pronostics" p ON p.user_id = u.id JOIN "Matchs" m ON m.id_api = p.match_id
        WHERE p.result IS NOT NULL AND u.id IN 
            (SELECT $1 UNION SELECT CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END 
            FROM "Friends" f 
            WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted') AND m.tournament_name = $2
        GROUP BY u.id, u.pseudo ORDER BY score_tournoi DESC`,
        [id, tournament]
    )

    return rows || null;
}

exports.updateScoreUser = async (id, winner) => {

    const { rows } = await pool.query(
        `UPDATE "Users" SET score = score + 1 WHERE id IN (SELECT user_id FROM "Pronostics" WHERE match_id = $1 AND prono = $2 AND result = true) RETURNING *`,
        [id, winner]
    )

    return rows || null;
}