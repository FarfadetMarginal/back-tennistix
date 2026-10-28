const {pool} = require('../config/db')

exports.findFinishedMatchs = async () => {

    const { rows } = await pool.query(
        `SELECT DISTINCT m.id_api FROM "Matchs" m INNER JOIN "Pronostics" p ON p.match_id = m.id_api WHERE p.result IS NULL`
    )

    return rows|| null;
}


exports.playerWin = async (winner, id) => {

    const { rows } = await pool.query(
        `UPDATE "Matchs" SET status = 'finished', result = $1 WHERE id_api = $2 RETURNING *`, [winner, id]
    )

    return rows|| null;
}