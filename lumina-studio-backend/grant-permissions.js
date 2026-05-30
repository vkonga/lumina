const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'lumina',
  password: 'LuminaSecurePass!2026',
  port: 5433,
});

const run = async () => {
  try {
    await client.connect();
    console.log('Connected to Cloud SQL as postgres via proxy!');

    console.log('Granting permissions to lumina_user...');
    await client.query("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lumina_user;");
    await client.query("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lumina_user;");
    await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lumina_user;");
    await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lumina_user;");
    
    console.log('[OK] Permissions successfully granted to lumina_user!');
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
};

run();
