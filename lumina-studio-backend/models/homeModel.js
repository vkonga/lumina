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
  const result = await pool.query('SELECT quote, author, location FROM testimonial LIMIT 1');
  return result.rows[0];
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

module.exports = {
  getHeroData,
  getServicesData,
  getGalleryData,
  getTestimonialData,
  getSiteContent,
  getYoutubeSlides,
  getPortfolioVideos,
};
