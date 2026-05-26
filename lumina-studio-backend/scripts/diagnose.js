const { Client } = require('pg');
require('dotenv').config();

async function checkConnection() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres', // Connect to default db first
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL successfully!');

        const res = await client.query('SELECT datname FROM pg_database WHERE datname = $1', [process.env.DB_NAME]);
        if (res.rows.length === 0) {
            console.log(`Database "${process.env.DB_NAME}" does not exist.`);
        } else {
            console.log(`Database "${process.env.DB_NAME}" exists.`);
        }

        await client.end();
    } catch (err) {
        console.error('Connection error:', err.stack);
        process.exit(1);
    }
}

checkConnection();
