const {pool} = require('../config/db')

exports.findMatchById = async (id) => {

    const { rows } = await pool.query(
        `SELECT * FROM "Matchs" WHERE id_api=$1`,
        [id]
    )

    return rows[0];
}

exports.createMatch = async (id_api, id_player1, id_player2, result, tournament_name, scheduled, status) => {

    const { rows } = await pool.query(
        `INSERT INTO "Matchs"(id_api, id_player1, id_player2, result, tournament_name, scheduled, status) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [id_api, id_player1, id_player2, result, tournament_name, scheduled, status]
    )

    return rows[0];
}

exports.createProno = async (user_id, match_id, prono, result) => {

    const { rows } = await pool.query(
        `INSERT INTO "Pronostics"(user_id, match_id, prono, result) VALUES($1, $2, $3, $4) RETURNING *`,
        [user_id, match_id, prono, result]
    )

    return rows[0];
}