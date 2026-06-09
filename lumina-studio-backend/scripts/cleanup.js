/**
 * cleanup.js
 * Deletes all non-admin users and all orders from the database.
 * The admin user (is_admin = TRUE) is preserved.
 * Run once: node scripts/cleanup.js
 */

const pool = require('../config/db');

const cleanup = async () => {
  try {
    console.log('Starting database cleanup...\n');

    // 1. Show what we're about to remove
    const usersToDelete = await pool.query(
      'SELECT id, username, email FROM users WHERE is_admin = FALSE'
    );
    const ordersToDelete = await pool.query('SELECT COUNT(*) AS count FROM orders');

    console.log(`Non-admin users to delete (${usersToDelete.rows.length}):`);
    usersToDelete.rows.forEach(u =>
      console.log(`  • [${u.id}] ${u.username} <${u.email}>`)
    );
    console.log(`\nOrders to delete: ${ordersToDelete.rows[0].count}`);
    console.log('');

    // 2. Delete order_items first (FK dependency)
    const itemsResult = await pool.query('DELETE FROM order_items RETURNING id');
    console.log(`✔ Deleted ${itemsResult.rowCount} order item(s)`);

    // 3. Delete all orders
    const ordersResult = await pool.query('DELETE FROM orders RETURNING id');
    console.log(`✔ Deleted ${ordersResult.rowCount} order(s)`);

    // 4. Delete cart items for non-admin users
    const cartResult = await pool.query(
      'DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE is_admin = FALSE) RETURNING id'
    );
    console.log(`✔ Deleted ${cartResult.rowCount} cart item(s)`);

    // 5. Delete all non-admin users
    //    (services & products owned by them cascade automatically)
    const usersResult = await pool.query(
      'DELETE FROM users WHERE is_admin = FALSE RETURNING id, username'
    );
    console.log(`✔ Deleted ${usersResult.rowCount} non-admin user(s):`);
    usersResult.rows.forEach(u => console.log(`    – ${u.username} (id=${u.id})`));

    // 6. Show what remains
    const remaining = await pool.query(
      'SELECT id, username, email, is_admin FROM users ORDER BY id'
    );
    console.log('\n── Remaining users ─────────────────────────────');
    remaining.rows.forEach(u =>
      console.log(`  [${u.id}] ${u.username} <${u.email}> admin=${u.is_admin}`)
    );

    console.log('\n✅ Cleanup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  }
};

cleanup();
