const {pool} = require('../config/db')

exports.findFinishedMatchs = async () => {

    const { rows } = await pool.query(
        `SELECT DISTINCT m.id_api FROM "Matchs" m INNER JOIN "Pronostics" p ON p.match_id = m.id_api WHERE p.result IS NULL`
    )

    return rows|| null;
}

exports.player1Win = async (id) => {

    const { rows } = await pool.query(
        `UPDATE "Matchs" SET status = 'finished', result = $1 WHERE id_api = $2 RETURNING *`, [1, id]
    )

    return rows|| null;
}

exports.player2Win = async (id) => {

    const { rows } = await pool.query(
        `UPDATE "Matchs" SET status = 'finished', result = $1 WHERE id_api = $2 RETURNING *`, [2, id]
    )

    return rows|| null;
}