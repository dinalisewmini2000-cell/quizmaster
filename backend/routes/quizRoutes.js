const express = require('express');
const router = express.Router();
const { getAllQuizzes, createQuiz, saveHistory, deleteQuiz } = require('../controllers/quizController');

// API Routes
router.get('/quizzes', getAllQuizzes);
router.post('/quizzes', createQuiz);
router.post('/history', saveHistory);
router.delete('/quizzes/:id', deleteQuiz);

module.exports = router;