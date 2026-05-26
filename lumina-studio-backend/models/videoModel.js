const pool = require('../config/db');

const createVideo = async (title, fileName, filePath, fileSize, mimetype, uploadedBy) => {
  const result = await pool.query(
    `INSERT INTO videos (title, file_name, file_path, file_size, mimetype, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, file_name, file_path, file_size, mimetype, uploaded_by, created_at`,
    [title, fileName, filePath, fileSize, mimetype, uploadedBy]
  );
  return result.rows[0];
};

const getAllVideos = async () => {
  const result = await pool.query(
    `SELECT 
       v.id,
       v.title,
       v.file_name,
       v.file_path,
       v.file_size,
       v.mimetype,
       v.created_at,
       u.username AS uploaded_by_username
     FROM videos v
     LEFT JOIN users u ON v.uploaded_by = u.id
     ORDER BY v.id DESC`
  );
  return result.rows;
};

module.exports = {
  createVideo,
  getAllVideos,
};
