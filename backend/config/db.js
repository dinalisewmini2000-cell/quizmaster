const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kahoot_clone_db' // 👈 Hari database eka thiyenawa
});

db.connect((err) => {
    if (err) {
        console.error('⚠️ Database connection failed:', err);
        return;
    }
    // 🔥 ALUTH: Oya kalin dakka kiyapu message eka kelinma damma!
    console.log('📦 Connected to kahoot_clone_db!');
});

module.exports = db;