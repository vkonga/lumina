const pool = require('../config/db');

const tables = [
  'users',
  'orders',
  'order_items',
  'cart_items',
  'products',
  'product_sizes',
  'hero',
  'gallery',
  'testimonial',
  'videos',
  'youtube_slides',
  'portfolio_videos'
];

const fixSequences = async () => {
  try {
    console.log('Starting primary key sequence synchronization...');

    for (const table of tables) {
      try {
        // Check if table exists in active schema
        const checkTable = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);

        if (!checkTable.rows[0].exists) {
          console.log(`- Table "${table}" does not exist in the database. Skipping.`);
          continue;
        }

        // Check if 'id' column exists in table
        const checkColumn = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1 
            AND column_name = 'id'
          );
        `, [table]);

        if (!checkColumn.rows[0].exists) {
          console.log(`- Column "id" does not exist in table "${table}". Skipping.`);
          continue;
        }

        // Get the serial sequence name
        const seqResult = await pool.query(`SELECT pg_get_serial_sequence($1, 'id') AS seq`, [table]);
        const seqName = seqResult.rows[0].seq;

        if (!seqName) {
          console.log(`- Table "${table}" does not use a serial sequence for its "id" column. Skipping.`);
          continue;
        }

        // Reset the sequence based on the maximum ID value
        const resetQuery = `
          SELECT setval(
            $1, 
            COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, 
            false
          ) AS new_value;
        `;
        const resetResult = await pool.query(resetQuery, [seqName]);
        const newValue = resetResult.rows[0].new_value;
        console.log(`✔ Synchronized sequence "${seqName}" to next value: ${newValue}`);

      } catch (err) {
        console.error(`❌ Error synchronizing sequence for table "${table}":`, err.message);
      }
    }

    console.log('Sequence synchronization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Sequence synchronization failed:', error);
    process.exit(1);
  }
};

fixSequences();
