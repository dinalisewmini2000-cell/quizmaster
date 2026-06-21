import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5005');
const SHAPES = ['▲', '◆', '●', '■'];
const BG_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];

const Confetti = () => {
    const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#4b0082', '#ffca28'];
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
            <style>{`@keyframes fall { to { transform: translateY(100vh) rotate(720deg); } }`}</style>
            {[...Array(80)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute', top: '-20px', left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 12 + 6}px`, height: `${Math.random() * 24 + 12}px`,
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    animation: `fall ${Math.random() * 3 + 2}s linear infinite`, animationDelay: `-${Math.random() * 5}s`
                }} />
            ))}
        </div>
    );
};

export default function Join() {
    const [pin, setPin] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [joined, setJoined] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [waitingForNext, setWaitingForNext] = useState(false);

    // Score, Timer, & Leaderboard States
    const [score, setScore] = useState(0);
    const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(null);
    const [totalTime, setTotalTime] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);

    const [gameMode, setGameMode] = useState('');
    const [fullQuiz, setFullQuiz] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (currentQuestion && !answered && !gameEnded) {
            interval = setInterval(() => {
                setTotalTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [currentQuestion, answered, gameEnded]);

    useEffect(() => {
        socket.on('next_question', (data) => {
            setJoined(false); setWaitingForNext(false); setAnswered(false);
            setCurrentQuestion(data.question);
            setGameMode(data.mode);
            if (data.fullQuiz) { setFullQuiz(data.fullQuiz); setQuestionIndex(data.questionIndex || 0); }
        });
        socket.on('show_mid_leaderboard', () => { setCurrentQuestion(null); setWaitingForNext(true); });

        socket.on('end_game', (data) => {
            setGameEnded(true); setCurrentQuestion(null); setWaitingForNext(false);

            if (data.finalScores) {
                const sorted = Object.entries(data.finalScores)
                    .map(([name, pts]) => ({ name, score: pts }))
                    .sort((a, b) => b.score - a.score);
                setLeaderboard(sorted);

                if (data.finalScores[playerName] !== undefined) {
                    setScore(data.finalScores[playerName]);
                }
            }
        });

        return () => { socket.off('next_question'); socket.off('show_mid_leaderboard'); socket.off('end_game'); };
    }, [playerName]);

    const handleJoin = () => {
        if (!pin || !playerName) return alert("⚠️ Please enter Game PIN and Nickname!");
        socket.emit('join_lobby', { pin, playerName });
        setJoined(true);
    };

    const handleAnswer = (answerIndex) => {
        const correctAnswers = currentQuestion.correctAnswers;
        const correctVal = currentQuestion.correctAnswer;
        const selectedText = currentQuestion.answerOptions[answerIndex];

        let isCorrect = false;
        if (Array.isArray(correctAnswers) && correctAnswers.length > 0) {
            isCorrect = correctAnswers.includes(answerIndex) || correctAnswers.includes(String(answerIndex));
        } else {
            isCorrect = Number(correctVal) === Number(answerIndex) ||
                (selectedText && String(correctVal).trim().toLowerCase() === String(selectedText).trim().toLowerCase());
        }

        setIsLastAnswerCorrect(isCorrect);
        setAnswered(true);

        const pointsEarned = isCorrect ? 1000 : 0;

        setScore(prevScore => {
            const newScore = Number(prevScore) + pointsEarned;
            socket.emit('submit_answer', { pin, playerName, score: newScore });
            return newScore;
        });
    };

    const handleNextSelfPaced = () => {
        const nextIdx = questionIndex + 1;
        if (nextIdx < fullQuiz.questions.length) {
            setQuestionIndex(nextIdx);
            setCurrentQuestion(fullQuiz.questions[nextIdx]);
            setAnswered(false);
        } else {
            setGameEnded(true);
            setCurrentQuestion(null);
        }
    };

    if (gameEnded) {
        const first = leaderboard[0] || { name: 'No Player', score: 0 };
        const second = leaderboard[1] || { name: '-', score: 0 };
        const third = leaderboard[2] || { name: '-', score: 0 };

        return (
            <div style={{ textAlign: 'center', backgroundColor: '#1f1135', color: 'white', minHeight: 'calc(100vh - 70px)', padding: '50px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", position: 'relative', overflow: 'hidden' }}>
                <Confetti />
                <h1 style={{ fontSize: '50px', marginBottom: '40px', fontWeight: '900', zIndex: 1, position: 'relative', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>GAME OVER! 🏁</h1>

                {/* Podium with "Points" instead of "pts" */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', height: '300px', alignItems: 'flex-end', marginBottom: '40px', zIndex: 1, position: 'relative' }}>
                    <div style={{ width: '130px', backgroundColor: '#4b0082', height: '150px', borderTop: '5px solid #1368ce', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '15px 15px 0 0', boxShadow: '0 -10px 20px rgba(0,0,0,0.3)' }}>
                        <div style={{ marginTop: '-50px', backgroundColor: '#1368ce', padding: '6px 10px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.4)', width: '110px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{second.name}</div>
                            <div style={{ fontWeight: '900', fontSize: '14px', color: '#ffca28', marginTop: '2px' }}>{second.score} Points</div>
                        </div>
                        <h2 style={{ color: '#1368ce', fontSize: '50px', margin: 'auto 0' }}>2</h2>
                    </div>
                    <div style={{ width: '150px', backgroundColor: '#4b0082', height: '220px', borderTop: '8px solid #ffca28', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '15px 15px 0 0', boxShadow: '0 -10px 30px rgba(0,0,0,0.4)' }}>
                        <div style={{ marginTop: '-60px', backgroundColor: '#ffca28', padding: '8px 15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.4)', width: '130px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{first.name}</div>
                            <div style={{ fontWeight: '900', fontSize: '16px', color: '#4b0082', marginTop: '2px' }}>{first.score} Points</div>
                        </div>
                        <h2 style={{ color: '#ffca28', fontSize: '70px', margin: 'auto 0' }}>1</h2>
                    </div>
                    <div style={{ width: '130px', backgroundColor: '#4b0082', height: '110px', borderTop: '5px solid #cd7f32', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '15px 15px 0 0', boxShadow: '0 -10px 20px rgba(0,0,0,0.3)' }}>
                        <div style={{ marginTop: '-50px', backgroundColor: '#cd7f32', padding: '6px 10px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.4)', width: '110px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{third.name}</div>
                            <div style={{ fontWeight: '900', fontSize: '14px', color: '#ffca28', marginTop: '2px' }}>{third.score} Points</div>
                        </div>
                        <h2 style={{ color: '#cd7f32', fontSize: '40px', margin: 'auto 0' }}>3</h2>
                    </div>
                </div>

                <div style={{ display: 'inline-block', backgroundColor: '#222', padding: '15px 30px', borderRadius: '20px', border: '2px solid #ffca28', zIndex: 1, position: 'relative', marginBottom: '30px' }}>
                    <h3 style={{ margin: 0, color: '#ffca28', fontSize: '24px' }}>Your Final Score: {score} Points</h3>
                </div>
                <br />
                <button onClick={() => window.location.href = '/dashboard'} style={{ padding: '15px 40px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#fff', color: '#4b0082', border: 'none', borderRadius: '30px', cursor: 'pointer', zIndex: 1, position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>Go to Dashboard</button>
            </div>
        );
    }

    if (answered) {
        return (
            <div style={{ backgroundColor: isLastAnswerCorrect ? '#26890c' : '#e21b3c', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <h1 style={{ fontSize: '60px', fontWeight: '900', marginBottom: '20px' }}>{isLastAnswerCorrect ? "Correct! ✅" : "Wrong! ❌"}</h1>

                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px 40px', borderRadius: '15px', marginBottom: '40px' }}>
                    <h2 style={{ margin: 0, fontSize: '30px' }}>Points: {isLastAnswerCorrect ? "+1000" : "0"}</h2>
                </div>

                {gameMode === 'self_paced' ? (
                    <button onClick={handleNextSelfPaced} style={{ padding: '20px 50px', fontSize: '26px', fontWeight: 'bold', backgroundColor: '#fff', color: '#333', border: 'none', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                        {questionIndex + 1 < fullQuiz.questions.length ? "Next Question ➔" : "See Results ➔"}
                    </button>
                ) : (
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }} className="pulse-anim">Waiting for host...</p>
                )}
            </div>
        );
    }

    if (waitingForNext) {
        return (
            <div style={{ backgroundColor: '#1368ce', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div className="pulse-anim">
                    <h1 style={{ fontSize: '50px', fontWeight: '900' }}>Get Ready!</h1>
                    <h2 style={{ fontSize: '28px', opacity: 0.9 }}>Loading next question... ⏳</h2>
                </div>
            </div>
        );
    }

    if (currentQuestion && !answered) {
        return (
            <div style={{ backgroundColor: '#f2f2f2', minHeight: 'calc(100vh - 70px)', padding: '20px', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

                <div style={{ backgroundColor: '#ffffff', padding: '30px 20px', borderRadius: '16px', textAlign: 'center', marginBottom: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '5px solid #4b0082', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ffca28', padding: '5px 20px', borderRadius: '20px', fontWeight: 'bold', color: '#333', fontSize: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        Question
                    </div>
                    <h2 style={{ fontSize: '32px', color: '#333', margin: '15px 0 0 0', fontWeight: '900' }}>
                        {currentQuestion.questionText}
                    </h2>
                </div>

                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '15px' }}>
                    {currentQuestion.answerOptions.map((opt, i) => opt && (
                        <button key={i} onClick={() => handleAnswer(i)} className="answer-btn" style={{
                            backgroundColor: BG_COLORS[i], color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s, filter 0.2s', padding: '20px'
                        }}>
                            <div style={{ fontSize: '45px', marginBottom: '10px', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>{SHAPES[i]}</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>{opt}</div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (joined) {
        return (
            <div style={{ backgroundColor: '#26890c', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                <style>
                    {`
                    @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                    .pulse-anim { animation: pulse 2s infinite ease-in-out; }
                    .answer-btn:hover { filter: brightness(1.1); transform: scale(0.98); }
                    .answer-btn:active { transform: scale(0.95); }
                    `}
                </style>
                <div className="pulse-anim" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '60px', fontWeight: '900', marginBottom: '15px', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>You're in! 🎉</h1>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>See your nickname on screen</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#222', minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '40px 35px', borderRadius: '12px', textAlign: 'center', width: '100%', maxWidth: '400px', border: '4px solid #4b0082', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
                <h1 style={{ fontSize: '45px', fontWeight: '900', margin: '0 0 35px 0', color: '#333', letterSpacing: '1px' }}>Kahoot!</h1>
                <input type="text" placeholder="Game PIN" value={pin} onChange={e => setPin(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '16px', marginBottom: '15px', fontSize: '20px', textAlign: 'center', border: '2px solid #ccc', borderRadius: '8px', fontWeight: 'bold', outline: 'none', color: '#333' }} />
                <input type="text" placeholder="Nickname" value={playerName} onChange={e => setPlayerName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '16px', marginBottom: '30px', fontSize: '20px', textAlign: 'center', border: '2px solid #ccc', borderRadius: '8px', fontWeight: 'bold', outline: 'none', color: '#333' }} />
                <button onClick={handleJoin} style={{ width: '100%', boxSizing: 'border-box', padding: '18px', fontSize: '24px', fontWeight: '900', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', letterSpacing: '1px' }}>Enter</button>
            </div>
        </div>
    );
}