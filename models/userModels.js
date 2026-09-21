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
        `UPDATE "Users" SET reset_token = $1 WHERE email = $2`,
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