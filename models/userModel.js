const db = require('../config/db');

const User = {
  create: (user, callback) => {
    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(query, [user.email, user.password], callback);
  },

  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  },

  updatePassword: (email, password, callback) => {
    const query = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(query, [password, email], callback);
  },

  updateUsername: (userId, username, callback) => {
    const query = 'UPDATE users SET username = ? WHERE id = ?';
    db.query(query, [username, userId], callback);
  },
};

module.exports = User;
