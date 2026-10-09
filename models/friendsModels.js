const {pool} = require('../config/db')

exports.findRequest = async (senderId, receiverId) => {

    const { rows } = await pool.query(
        `SELECT status FROM "Friends" WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
        [senderId, receiverId]
    )

    return rows[0] || null;
}

exports.sendRequest = async (senderId, receiverId) => {

    const { rows } = await pool.query(
        `INSERT INTO "Friends"(sender_id, receiver_id) VALUES($1, $2) RETURNING *`,
        [senderId, receiverId]
    )

    return rows[0];
}

exports.findPendingRequest = async (senderId, receiverId) => {

    const { rows } = await pool.query(
        `SELECT * FROM "Friends" WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'`,
        [senderId, receiverId]
    )

    return rows[0] || null;
}

exports.findAllPendingRequest = async (receiverId) => {

    const { rows } = await pool.query(
        `SELECT f.sender_id, f.id, u.pseudo, u.pp FROM "Friends" f JOIN "Users" u ON u.id_user = f.sender_id WHERE f.receiver_id = $1 AND f.status = 'pending'`,
        [receiverId]
    )

    return rows;
}


exports.acceptRequest = async (senderId, receiverId) => {

    const { rows } = await pool.query(
        `UPDATE "Friends" SET status = $1 WHERE sender_id = $2 AND receiver_id = $3 AND status = 'pending' RETURNING *`,
        ["accepted", senderId, receiverId]
    )

    return rows[0];
}

exports.declineRequest = async (senderId, receiverId) => {

    const { rows } = await pool.query(
        `DELETE FROM "Friends" WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending' RETURNING *`,
        [senderId, receiverId]
    )

    return rows[0];
}

exports.findFriends = async (senderId) => {

    const { rows } = await pool.query(
        `SELECT u.id, u.pseudo FROM "Friends" f JOIN "Users" u ON u.id = CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END WHERE (f.sender_id = $1 OR f.receiver_id = $1) AND f.status = 'accepted'`,
        [senderId]
    )

    return rows;
}
