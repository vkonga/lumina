const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL (postgres database).');

        const dbName = process.env.DB_NAME;
        const res = await client.query('SELECT datname FROM pg_database WHERE datname = $1', [dbName]);

        if (res.rows.length === 0) {
            console.log(`Creating database "${dbName}"...`);
            // CREATE DATABASE cannot be run inside a transaction/pool easily, but with a Client it's fine
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully.`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }

        await client.end();
    } catch (err) {
        console.error('Error creating database:', err.stack);
        process.exit(1);
    }
}

createDatabase();
