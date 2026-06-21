import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SHAPES = ['▲', '◆', '●', '■'];
const BG_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];

export default function CreateQuiz() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');

    const [questions, setQuestions] = useState([
        { questionText: '', answerOptions: ['', '', '', ''], correctAnswers: [], timeLimit: 20, answerType: 'single' }
    ]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    const activeQuestion = questions[activeQuestionIndex];

    const handleQuestionChange = (text) => {
        const newQuestions = [...questions];
        newQuestions[activeQuestionIndex].questionText = text;
        setQuestions(newQuestions);
    };

    const handleAnswerChange = (index, text) => {
        const newQuestions = [...questions];
        newQuestions[activeQuestionIndex].answerOptions[index] = text;
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerSelect = (index) => {
        const newQuestions = [...questions];
        const q = newQuestions[activeQuestionIndex];

        if (q.answerType === 'multiple') {
            if (q.correctAnswers.includes(index)) {
                q.correctAnswers = q.correctAnswers.filter(i => i !== index);
            } else {
                q.correctAnswers.push(index);
            }
        } else {
            q.correctAnswers = [index];
        }

        setQuestions(newQuestions);
    };

    const handleTimeLimitChange = (time) => {
        const newQuestions = [...questions];
        newQuestions[activeQuestionIndex].timeLimit = Number(time);
        setQuestions(newQuestions);
    };

    const handleAnswerTypeChange = (type) => {
        const newQuestions = [...questions];
        newQuestions[activeQuestionIndex].answerType = type;
        newQuestions[activeQuestionIndex].correctAnswers = [];
        setQuestions(newQuestions);
    };

    const addNewQuestion = () => {
        setQuestions([
            ...questions,
            { questionText: '', answerOptions: ['', '', '', ''], correctAnswers: [], timeLimit: 20, answerType: 'single' }
        ]);
        setActiveQuestionIndex(questions.length);
    };

    const saveQuiz = async () => {
        if (!title) return alert("Please enter a Quiz Title!");

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText) return alert(`Question ${i + 1} is empty!`);
            if (q.correctAnswers.length === 0) return alert(`Please select at least one correct answer for Question ${i + 1}!`);
        }

        const quizData = { title, questions };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/quizzes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title, quiz_data: quizData })
            });

            if (response.ok) {
                alert("Quiz saved successfully! 🎉");
                navigate('/dashboard');
            } else {
                alert("Failed to save quiz.");
            }
        } catch (error) {
            console.error("Error saving quiz:", error);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f8', fontFamily: 'sans-serif' }}>

            {/* --- LEFT SIDEBAR (Palala adu kala) --- */}
            <div style={{ width: '200px', backgroundColor: '#fff', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0, color: '#46178f', fontWeight: '900', fontSize: '20px' }}>Questions</h3>
                </div>
                <div style={{ padding: '15px', flex: 1, overflowY: 'auto' }}>
                    {questions.map((q, idx) => (
                        <div
                            key={idx}
                            onClick={() => setActiveQuestionIndex(idx)}
                            style={{
                                padding: '12px',
                                marginBottom: '10px',
                                backgroundColor: activeQuestionIndex === idx ? '#e6f0ff' : '#f9f9f9',
                                border: activeQuestionIndex === idx ? '2px solid #1368ce' : '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                color: activeQuestionIndex === idx ? '#1368ce' : '#555',
                                transition: 'all 0.2s'
                            }}
                        >
                            {idx + 1}. Quiz
                        </div>
                    ))}
                    <button
                        onClick={addNewQuestion}
                        style={{ width: '100%', padding: '12px', backgroundColor: '#1368ce', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 6px rgba(19,104,206,0.3)' }}
                    >
                        + Add Question
                    </button>
                </div>
            </div>

            {/* --- MIDDLE SECTION (Padding adu kala, MaxWidth wadi kala) --- */}
            <div style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>

                <input
                    placeholder="Enter Kahoot Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', maxWidth: '1000px', padding: '15px 20px', fontSize: '22px', fontWeight: 'bold', border: '2px solid #ccc', borderRadius: '10px', marginBottom: '20px', backgroundColor: '#fff', color: '#000', outline: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
                />

                <textarea
                    placeholder="Start typing your question..."
                    value={activeQuestion.questionText}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    style={{ width: '100%', maxWidth: '1000px', height: '140px', padding: '20px', fontSize: '26px', fontWeight: 'bold', textAlign: 'center', border: '2px solid #ccc', borderRadius: '10px', marginBottom: '30px', backgroundColor: '#fff', color: '#000', outline: 'none', resize: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}
                />

                {/* Grid eke gap eka adu kala */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%', maxWidth: '1000px' }}>
                    {activeQuestion.answerOptions.map((opt, i) => {
                        const isCorrect = activeQuestion.correctAnswers.includes(i);
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '10px', border: `3px solid ${BG_COLORS[i]}`, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>

                                {/* Shape box eke size eka adu kala */}
                                <div style={{ backgroundColor: BG_COLORS[i], width: '45px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', flexShrink: 0 }}>
                                    {SHAPES[i]}
                                </div>

                                {/* Font size eka 18px kala loku word ekak liyanna */}
                                <input
                                    placeholder={`Add answer ${i + 1}`}
                                    value={opt}
                                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                                    style={{ flex: 1, padding: '15px 10px', border: 'none', fontSize: '18px', fontWeight: 'bold', outline: 'none', color: '#000', backgroundColor: '#fff', minWidth: '0' }}
                                />

                                {/* Tick eke size eka adu kala */}
                                <button
                                    onClick={() => handleCorrectAnswerSelect(i)}
                                    style={{
                                        width: '35px', height: '35px', margin: '0 10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s', flexShrink: 0,
                                        backgroundColor: isCorrect ? '#26890c' : '#fff',
                                        border: isCorrect ? 'none' : '3px solid #ddd',
                                        color: isCorrect ? '#fff' : 'transparent',
                                        boxShadow: isCorrect ? '0 0 10px rgba(38, 137, 12, 0.5)' : 'none'
                                    }}
                                >
                                    ✔
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                    <button
                        onClick={saveQuiz}
                        style={{ padding: '15px 50px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#46178f', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 6px 15px rgba(70, 23, 143, 0.4)' }}
                    >
                        💾 Save Full Quiz
                    </button>
                </div>
            </div>

            {/* --- RIGHT SIDEBAR (Palala adu kala) --- */}
            <div style={{ width: '260px', backgroundColor: '#fff', borderLeft: '1px solid #ddd', padding: '25px 20px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <h3 style={{ margin: '0 0 25px 0', color: '#000', fontWeight: '900', fontSize: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    Question properties
                </h3>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '8px', fontSize: '14px' }}>Question type</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#000', fontWeight: 'bold', fontSize: '15px', outline: 'none' }}>
                        <option>Quiz</option>
                        <option>True / False</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '8px', fontSize: '14px' }}>Time limit</label>
                    <select
                        value={activeQuestion.timeLimit}
                        onChange={(e) => handleTimeLimitChange(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#000', fontWeight: 'bold', fontSize: '15px', outline: 'none' }}
                    >
                        <option value={5}>5 seconds</option>
                        <option value={10}>10 seconds</option>
                        <option value={20}>20 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>1 minute</option>
                        <option value={90}>1.5 minutes</option>
                        <option value={120}>2 minutes</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '8px', fontSize: '14px' }}>Points</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#000', fontWeight: 'bold', fontSize: '15px', outline: 'none' }}>
                        <option>Standard</option>
                        <option>Double points</option>
                        <option>No points</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', color: '#555', marginBottom: '8px', fontSize: '14px' }}>Answer options</label>
                    <select
                        value={activeQuestion.answerType || 'single'}
                        onChange={(e) => handleAnswerTypeChange(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#000', fontWeight: 'bold', fontSize: '15px', outline: 'none' }}
                    >
                        <option value="single">Single select</option>
                        <option value="multiple">Multi-select</option>
                    </select>
                </div>

            </div>
        </div>
    );
}