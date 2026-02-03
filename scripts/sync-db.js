const mysql = require('mysql2/promise');
require('dotenv').config();

// Local DB connection
const localConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stress_relief'
};

// Remote DB connection (from environment variables)
const remoteConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    }
};

async function sync() {
    console.log('🚀 Starting Database Sync...');

    if (!remoteConfig.host) {
        console.error('❌ Error: Remote database credentials not found in environment variables.');
        console.log('Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in your environment or .env file.');
        process.exit(1);
    }

    let localConn, remoteConn;

    try {
        console.log('🔗 Connecting to local database...');
        localConn = await mysql.createConnection(localConfig);
        console.log('✅ Local Connected.');

        console.log('🔗 Connecting to remote database...');
        remoteConn = await mysql.createConnection(remoteConfig);
        console.log('✅ Remote Connected.');

        // Disable foreign key checks for the sync process
        console.log('🔗 Disabling foreign key checks on remote...');
        await remoteConn.query('SET FOREIGN_KEY_CHECKS = 0');

        // Get tables
        const [tables] = await localConn.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        for (const tableName of tableNames) {
            console.log(`\n📦 Syncing table: ${tableName}...`);

            // 1. Get Create Table statement
            const [[createTableResult]] = await localConn.query(`SHOW CREATE TABLE \`${tableName}\``);
            const createSql = createTableResult['Create Table'];

            // 2. Drop and Create on remote
            console.log(`   - Recreating table on remote...`);
            await remoteConn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
            await remoteConn.query(createSql);

            // 3. Get local data
            const [rows] = await localConn.query(`SELECT * FROM \`${tableName}\``);

            if (rows.length > 0) {
                console.log(`   - Inserting ${rows.length} rows...`);
                // Use a bulk insert for speed
                const columns = Object.keys(rows[0]).map(col => `\`${col}\``).join(', ');
                const values = rows.map(row => Object.values(row));

                const insertSql = `INSERT INTO \`${tableName}\` (${columns}) VALUES ?`;
                await remoteConn.query(insertSql, [values]);
            } else {
                console.log(`   - Table is empty, skipping data sync.`);
            }

            console.log(`✅ ${tableName} Synced.`);
        }

        // Re-enable foreign key checks
        console.log('\n🔗 Re-enabling foreign key checks on remote...');
        await remoteConn.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n✨ Database sync completed successfully!');

    } catch (err) {
        console.error('❌ Sync failed:', err.message);
    } finally {
        if (localConn) await localConn.end();
        if (remoteConn) await remoteConn.end();
    }
}

sync();
