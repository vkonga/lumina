const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const migrate = async () => {
  try {
    console.log('Running database migrations...');

    // 1. Add is_admin column to users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    `);
    console.log('✔ Added is_admin column to users table');

    // 2. Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(30) DEFAULT 'pending',           -- pending / confirmed / shipped / delivered / cancelled
        payment_status VARCHAR(20) DEFAULT 'pending',   -- pending / paid / failed / refunded
        payment_method VARCHAR(30) DEFAULT 'cod',       -- cod / upi / card
        total_amount DECIMAL(10,2) NOT NULL,
        delivery_name VARCHAR(255),
        delivery_phone VARCHAR(20),
        delivery_address TEXT,
        delivery_city VARCHAR(100),
        delivery_state VARCHAR(100),
        delivery_pincode VARCHAR(10),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✔ Created orders table');

    // 2b. Add Razorpay columns to orders table if they don't exist
    await pool.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50);
    `);
    console.log('✔ Added Razorpay columns to orders table');

    // 3. Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        title VARCHAR(255),
        category VARCHAR(50),
        image VARCHAR(255),
        size VARCHAR(50),
        unit_price DECIMAL(10,2),
        quantity INTEGER,
        custom_image TEXT,
        custom_color VARCHAR(50)
      );
    `);
    console.log('✔ Created order_items table');

    // 4. Ensure admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lumina.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';

    const adminCheck = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [adminEmail]);

    if (adminCheck.rows.length === 0) {
      console.log(`Admin user does not exist. Creating ${adminEmail}...`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      await pool.query(
        'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4)',
        [adminUsername, adminEmail, passwordHash, true]
      );
      console.log(`✔ Created admin user ${adminEmail}`);
    } else {
      console.log(`Admin user already exists. Promoting ${adminEmail} to admin...`);
      await pool.query('UPDATE users SET is_admin = $1 WHERE LOWER(email) = LOWER($2)', [true, adminEmail]);
      console.log(`✔ Promoted existing ${adminEmail} to admin`);
    }

    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
