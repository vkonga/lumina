const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'lumina',
  password: 'LuminaSecurePass!2026',
  port: 5433,
});

client.connect()
  .then(() => {
    console.log('CONNECTED SUCCESSFULLY to Cloud SQL via proxy!');
    return client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  })
  .then((res) => {
    console.log('Existing Tables in Cloud SQL:', res.rows.map(r => r.tablename));
    process.exit(0);
  })
  .catch((err) => {
    console.error('CONNECTION ERROR:', err.message);
    process.exit(1);
  });
