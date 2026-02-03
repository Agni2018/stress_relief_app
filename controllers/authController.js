// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_123';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 1000 * 60 * 60, // 1 hour
};

// ------------------ SIGNUP ------------------
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await new Promise((resolve, reject) => {
      User.findByEmail(email, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) => {
      User.create({ email, password: hashedPassword }, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.status(201).json({ message: 'Signup successful! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// ------------------ LOGIN ------------------
exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error verifying password' });
      }

      if (!match) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // ✅ Create JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username || null },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // ✅ Set JWT in httpOnly cookie
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(200).json({ message: 'Login successful!' });
    });
  });
};

// ------------------ CHANGE PASSWORD ------------------
exports.changePassword = (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required.' });
  }

  User.findByEmail(email, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Email does not exist in database.' });
    }

    bcrypt.hash(newPassword, 10, (hashErr, hash) => {
      if (hashErr) {
        console.error(hashErr);
        return res.status(500).json({ success: false, message: 'Error hashing password.' });
      }

      User.updatePassword(email, hash, (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ success: false, message: 'Error updating password.' });
        }

        return res.status(200).json({ success: true, message: 'Password updated successfully!' });
      });
    });
  });
};

// ------------------ SET USERNAME ------------------
exports.setUsername = (req, res) => {
  const { username } = req.body;
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    User.updateUsername(userId, username, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error updating username' });
      }

      // Update JWT with new username
      const payload = { ...decoded, username };
      delete payload.iat;
      delete payload.exp;

      const newToken = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.cookie('token', newToken, COOKIE_OPTIONS);
      res.status(200).json({ message: 'Username updated successfully', username });
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ------------------ LOGOUT ------------------
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// ------------------ CHECK SESSION ------------------
exports.checkSession = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ loggedIn: true, user: decoded });
  } catch (error) {
    res.json({ loggedIn: false });
  }
};


