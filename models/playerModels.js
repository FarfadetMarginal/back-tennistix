const {pool} = require('../config/db')

exports.addFavPlayer = async (newfav, id) => {

    const { rows } = await pool.query(
        `UPDATE "Users" SET favs = $1 WHERE id = $2 RETURNING *`,
        [newfav, id]
    )

    return rows[0];
}