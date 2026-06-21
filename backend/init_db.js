const mysql = require('mysql2');
const db = mysql.createConnection({host: 'localhost', user: 'root', password: '', database: 'kahoot_clone_db'});
db.connect((err) => {
  if (err) throw err;
  const queries = [
    "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'user')",
    "CREATE TABLE IF NOT EXISTS quizzes (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, quiz_data LONGTEXT NOT NULL)",
    "CREATE TABLE IF NOT EXISTS game_history (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, score INT NOT NULL, rank_place INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
  ];
  let count = 0;
  queries.forEach(q => db.query(q, (err) => {
    if (err) throw err;
    count++;
    if (count === queries.length) {
      console.log("Tables created");
      process.exit(0);
    }
  }));
});
