const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authModel = require('../models/authModel');

const JWT_SECRET = process.env.JWT_SECRET || 'lumina_secret_key_12345';

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields (username, email, password) are required.' });
    }

    // Check if email or username is already taken
    const [existingEmail, existingUsername] = await Promise.all([
      authModel.findByEmail(email),
      authModel.findByUsername(username)
    ]);

    if (existingEmail) {
      return res.status(409).json({ error: 'Email address is already in use.' });
    }
    if (existingUsername) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    // Hash password with cryptographically secure salt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save user to database
    const newUser = await authModel.createUser(username, email, passwordHash);

    // Generate JWT Token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email, is_admin: newUser.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' } // Token valid for 7 days
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        is_admin: newUser.is_admin
      }
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    // Check if user exists
    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await authModel.updatePassword(email, passwordHash);

    res.status(200).json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  forgotPassword,
  getMe,
};

// ── getMe ──────────────────────────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    // Verify the user still exists in DB
    const result = await pool.query('SELECT id, username, email, is_admin FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Account not found. Please sign in again.' });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
}
