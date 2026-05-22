const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: (process.env.MYSQLHOST || process.env.DB_HOST || 'localhost').trim(),
  user: (process.env.MYSQLUSER || process.env.DB_USER || 'root').trim(),
  password: (process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '').trim(),
  database: (process.env.MYSQLDATABASE || process.env.DB_NAME || 'stress_relief').trim(),
  port: (process.env.MYSQLPORT || process.env.DB_PORT || 3306).toString().trim()
};

if (dbConfig.host !== 'localhost' && dbConfig.host !== '127.0.0.1') {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

module.exports = db;
