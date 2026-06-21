const db = require('../config/db');

const getAllQuizzes = (req, res) => {
    db.query('SELECT * FROM quizzes', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
};

const createQuiz = (req, res) => {
    const { title, quiz_data } = req.body;
    const dataString = typeof quiz_data === 'string' ? quiz_data : JSON.stringify(quiz_data);

    db.query('INSERT INTO quizzes (title, quiz_data) VALUES (?, ?)', [title, dataString], (err, result) => {
        if (err) {
            console.error('❌ DATABASE ERROR:', err);
            // 🔥 ALUTH: Error eke wisthara popup eken pennanna frontend ekata yawanawa
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
        }
        res.status(201).json({ message: 'Quiz created successfully!' });
    });
};

const saveHistory = (req, res) => {
    const { username, score, rank_place } = req.body;
    db.query('INSERT INTO game_history (username, score, rank_place) VALUES (?, ?, ?)', [username, score, rank_place], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ message: 'History saved!' });
    });
};

const deleteQuiz = (req, res) => {
    const quizId = req.params.id;
    db.query('DELETE FROM quizzes WHERE id = ?', [quizId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(200).json({ message: 'Quiz deleted successfully!' });
    });
};

module.exports = { getAllQuizzes, createQuiz, saveHistory, deleteQuiz };