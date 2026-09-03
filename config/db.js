const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const connectDB = async () => {
    try {
        await pool.query('SELECT 1'); // test connexion
        console.log('connection good');
    } catch (err) {
        console.error('unable to connect to db', err);
    }
};

module.exports = { pool, connectDB };