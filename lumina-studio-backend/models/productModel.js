const pool = require('../config/db');

const getAllProducts = async () => {
  const result = await pool.query('SELECT id, title, price, category, description, image FROM products ORDER BY id ASC');
  const products = result.rows;

  const sizesResult = await pool.query('SELECT product_id, size, price_modifier FROM product_sizes ORDER BY id ASC');
  const sizesMap = {};
  sizesResult.rows.forEach(row => {
    if (!sizesMap[row.product_id]) {
      sizesMap[row.product_id] = [];
    }
    sizesMap[row.product_id].push({
      size: row.size,
      price_modifier: parseFloat(row.price_modifier)
    });
  });

  return products.map(p => ({
    ...p,
    sizes: sizesMap[p.id] || []
  }));
};

const getProductsByCategory = async (category) => {
  const result = await pool.query(
    'SELECT id, title, price, category, description, image FROM products WHERE LOWER(category) = LOWER($1) ORDER BY id ASC',
    [category]
  );
  const products = result.rows;

  const sizesResult = await pool.query('SELECT product_id, size, price_modifier FROM product_sizes ORDER BY id ASC');
  const sizesMap = {};
  sizesResult.rows.forEach(row => {
    if (!sizesMap[row.product_id]) {
      sizesMap[row.product_id] = [];
    }
    sizesMap[row.product_id].push({
      size: row.size,
      price_modifier: parseFloat(row.price_modifier)
    });
  });

  return products.map(p => ({
    ...p,
    sizes: sizesMap[p.id] || []
  }));
};

const getSiteContent = async () => {
  const result = await pool.query('SELECT key, value FROM site_content');
  const content = {};
  result.rows.forEach(row => {
    content[row.key] = row.value;
  });
  return content;
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getSiteContent,
};
