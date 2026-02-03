const db = require('../config/db');
db.query('SHOW COLUMNS FROM users', (err, results) => {
    if (err) {
        console.error(err);
    } else {
        const columns = results.map(r => r.Field);
        console.log('Columns in users table:', columns);
    }
    db.end();
});
