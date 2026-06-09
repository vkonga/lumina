/**
 * delete-orders.js
 * Deletes ALL orders and order_items from the database (test data cleanup).
 * Resets sequences so next real order starts from #1.
 * Run via: node scripts/delete-orders.js
 */

const pool = require('../config/db');

const deleteOrders = async () => {
  try {
    // Show what exists
    const orders = await pool.query(
      'SELECT id, user_id, status, payment_status, total_amount, delivery_name, created_at FROM orders ORDER BY id DESC'
    );

    console.log(`\nOrders found: ${orders.rows.length}`);
    if (orders.rows.length === 0) {
      console.log('Nothing to delete.');
      return process.exit(0);
    }

    orders.rows.forEach(o =>
      console.log(`  #${o.id} | ${o.delivery_name || 'N/A'} | ${o.status} | ${o.payment_status} | ₹${o.total_amount} | ${new Date(o.created_at).toLocaleString('en-IN')}`)
    );

    // Delete order_items first (FK)
    const items = await pool.query('DELETE FROM order_items RETURNING id');
    console.log(`\n✔ Deleted ${items.rowCount} order item(s)`);

    // Delete all orders
    const deleted = await pool.query('DELETE FROM orders RETURNING id');
    console.log(`✔ Deleted ${deleted.rowCount} order(s)`);

    // Reset auto-increment sequences so real orders start from #1
    await pool.query("SELECT setval('orders_id_seq', 1, false)");
    await pool.query("SELECT setval('order_items_id_seq', 1, false)");
    console.log('✔ Reset order sequences — next order will be #1');

    console.log('\n✅ All test orders removed successfully.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
};

deleteOrders();
