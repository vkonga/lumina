const pool = require('../config/db');

const getHeroData = async () => {
  const result = await pool.query('SELECT title, subtitle, image FROM hero LIMIT 1');
  return result.rows[0];
};

const getServicesData = async () => {
  const result = await pool.query('SELECT id, title, img, price, reference_images FROM services ORDER BY id ASC');
  return result.rows;
};

const getGalleryData = async () => {
  const result = await pool.query('SELECT image_url FROM gallery ORDER BY id ASC');
  return result.rows.map(row => row.image_url);
};

const getTestimonialData = async () => {
  const result = await pool.query('SELECT id, quote, author, location FROM testimonial ORDER BY id DESC');
  return result.rows;
};

const getSiteContent = async () => {
  const result = await pool.query('SELECT key, value FROM site_content');
  const content = {};
  result.rows.forEach(row => {
    content[row.key] = row.value;
  });
  return content;
};

const getYoutubeSlides = async () => {
  const result = await pool.query('SELECT id, title, url FROM youtube_slides ORDER BY id ASC');
  return result.rows;
};

const getPortfolioVideos = async () => {
  const result = await pool.query('SELECT id, title, url FROM portfolio_videos ORDER BY id ASC');
  return result.rows;
};

const createTestimonial = async (data) => {
  const result = await pool.query(
    'INSERT INTO testimonial (quote, author, location) VALUES ($1, $2, $3) RETURNING *',
    [data.quote, data.author, data.location]
  );
  return result.rows[0];
};

const getActiveOffersData = async () => {
  const result = await pool.query('SELECT id, title, description, image_url, discount_code FROM offers WHERE is_active = true ORDER BY id DESC');
  return result.rows;
};

module.exports = {
  getHeroData,
  getServicesData,
  getGalleryData,
  getTestimonialData,
  getSiteContent,
  getYoutubeSlides,
  getPortfolioVideos,
  createTestimonial,
  getActiveOffersData,
};
