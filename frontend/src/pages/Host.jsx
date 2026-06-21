import React, { useState } from 'react';

export default function Host() {
    const [title, setTitle] = useState('');

    // ALUTH: 'timeLimit: 20' kiyala default welawa add kala
    const [questions, setQuestions] = useState([
        { type: 'quiz', questionText: '', answerOptions: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 20 }
    ]);

    const addQuestion = (type) => {
        if (type === 'quiz') {
            setQuestions([...questions, { type: 'quiz', questionText: '', answerOptions: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 20 }]);
        } else {
            setQuestions([...questions, { type: 'boolean', questionText: '', answerOptions: ['True', 'False'], correctAnswerIndex: 0, timeLimit: 20 }]);
        }
    };

    const updateQuestion = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const updateOption = (qIndex, optIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].answerOptions[optIndex] = value;
        setQuestions(updatedQuestions);
    };

    const saveQuiz = async () => {
        for (let q of questions) {
            if (!title || !q.questionText || (q.type === 'quiz' && q.answerOptions.includes(''))) {
                alert("⚠️ Please fill in all the fields before saving!");
                return;
            }
        }

        const quizData = { title, questions };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/quizzes/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizData)
            });

            if (response.ok) {
                alert("✅ Quiz saved successfully! You can now host it from the Dashboard.");
                setTitle('');
                setQuestions([{ type: 'quiz', questionText: '', answerOptions: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 20 }]);
            } else {
                alert("❌ An error occurred while saving the quiz.");
            }
        } catch (err) {
            console.error(err);
            alert("❌ Backend seems to be offline. Please check your server.");
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            <h2>🛠️ Create a New Kahoot</h2>

            <input
                type="text"
                placeholder="Quiz Title (e.g., General Knowledge)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '15px', fontSize: '20px', marginBottom: '30px', borderRadius: '5px', border: 'none' }}
            />

            {questions.map((q, qIndex) => (
                <div key={qIndex} style={{ backgroundColor: '#222', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #444' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ color: q.type === 'boolean' ? '#9d61ea' : '#1368ce', margin: 0 }}>
                            Question {qIndex + 1} {q.type === 'boolean' ? '(True/False)' : '(Quiz)'}
                        </h3>

                        {/* ALUTH KALLA: Time Limit Dropdown Eka */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ color: 'gray', fontSize: '14px' }}>Time Limit:</label>
                            <select
                                value={q.timeLimit || 20}
                                onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value))}
                                style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '5px', backgroundColor: '#333', color: 'white', border: '1px solid #555', cursor: 'pointer' }}
                            >
                                <option value={10}>10 Seconds</option>
                                <option value={20}>20 Seconds</option>
                                <option value={30}>30 Seconds</option>
                                <option value={60}>60 Seconds</option>
                            </select>
                        </div>
                    </div>

                    <input
                        type="text"
                        placeholder="Type your question here..."
                        value={q.questionText}
                        onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                        style={{ width: '100%', padding: '15px', fontSize: '20px', marginBottom: '20px', borderRadius: '5px', border: 'none', textAlign: 'center' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {q.answerOptions.map((opt, optIndex) => {
                            const bgColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
                            return (
                                <div key={optIndex} style={{ display: 'flex', alignItems: 'center', backgroundColor: bgColors[optIndex], padding: '10px', borderRadius: '5px' }}>
                                    <input
                                        type="radio"
                                        name={`correctAnswer_${qIndex}`}
                                        checked={q.correctAnswerIndex === optIndex}
                                        onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', optIndex)}
                                        style={{ transform: 'scale(1.5)', marginRight: '10px', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder={`Answer ${optIndex + 1}`}
                                        value={opt}
                                        disabled={q.type === 'boolean'}
                                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px', fontSize: '18px', border: 'none', borderRadius: '3px',
                                            backgroundColor: q.type === 'boolean' ? 'transparent' : 'white',
                                            color: q.type === 'boolean' ? 'white' : 'black',
                                            fontWeight: q.type === 'boolean' ? 'bold' : 'normal',
                                            textAlign: q.type === 'boolean' ? 'center' : 'left',
                                            fontSize: q.type === 'boolean' ? '24px' : '18px'
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                <button
                    onClick={() => addQuestion('quiz')}
                    style={{ padding: '15px 20px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#1368ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    ➕ Add Quiz (4 Options)
                </button>

                <button
                    onClick={() => addQuestion('boolean')}
                    style={{ padding: '15px 20px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#9d61ea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    ➕ Add True/False
                </button>
            </div>

            <div style={{ marginTop: '30px' }}>
                <button
                    onClick={saveQuiz}
                    style={{ width: '100%', maxWidth: '400px', padding: '15px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#26890c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    💾 Save Kahoot!
                </button>
            </div>
        </div>
    );
}