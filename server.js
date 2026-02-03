// server.js
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes'); // ✅ new
const moodRoutes = require("./routes/moodRoutes");


const app = express();

// Global Error Handlers
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// ------------------ MIDDLEWARE ------------------

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_123';

// ✅ Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ message: 'Not logged in' });
    }
    return res.redirect('/index.html');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.clearCookie('token');
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      return res.redirect('/index.html');
    }
    req.user = user;
    next();
  });
};

// ✅ Middleware to prevent caching on protected routes
const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
};

// ------------------ ROUTES ------------------
app.use('/api/auth', authRoutes);
app.use('/api/games', authenticateToken, gameRoutes); // ✅ protected
app.use("/api/mood", authenticateToken, moodRoutes); // ✅ protected




// ✅ Protect dashboard and other pages
app.get(['/dashboard.html', '/games.html', '/journal.html', '/relaxation.html', '/self-assessment.html'], authenticateToken, noCache, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path));
});

// ✅ Specialized handling for index.html (Login Page)
app.get(['/', '/index.html'], (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard.html');
    } catch (e) {
      res.clearCookie('token');
    }
  }
  next();
}, noCache, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Serve static files (after protected routes)
app.use(express.static(path.join(__dirname, 'public')));

// ------------------ SERVER ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));


