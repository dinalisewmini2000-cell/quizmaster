import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5005');
const SHAPES = ['▲', '◆', '●', '■'];
const BG_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];

const Confetti = () => {
    const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#4b0082', '#ffca28'];
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
            <style>{`@keyframes fall { to { transform: translateY(100vh) rotate(720deg); } }`}</style>
            {[...Array(80)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute', top: '-20px', left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 15 + 5}px`, height: `${Math.random() * 25 + 10}px`,
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    animation: `fall ${Math.random() * 3 + 2}s linear infinite`, animationDelay: `-${Math.random() * 5}s`
                }} />
            ))}
        </div>
    );
};

export default function Dashboard() {
    const [quizzes, setQuizzes] = useState([]);
    const [lobbyPin, setLobbyPin] = useState('');
    const [players, setPlayers] = useState([]);
    const [playerScores, setPlayerScores] = useState({});

    const [activeQuiz, setActiveQuiz] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameMode, setGameMode] = useState('');
    const [showPodium, setShowPodium] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showMidLeaderboard, setShowMidLeaderboard] = useState(false);
    const [expandedQuizId, setExpandedQuizId] = useState(null);

    const isLoggedIn = localStorage.getItem('token');

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchQuizzes();

        socket.on('lobby_created', (data) => {
            setLobbyPin(data.pin); setActiveQuiz(data.quizData);
            setPlayers([]); setPlayerScores({}); setShowPodium(false);
            setGameMode(''); setShowMidLeaderboard(false); setCurrentQuestionIndex(0);
        });

        socket.on('player_joined', (playerName) => {
            setPlayers((prev) => [...new Set([...prev, playerName])]);
            setPlayerScores((prev) => ({ ...prev, [playerName]: 0 }));
        });

        socket.on('player_score_updated', (data) => {
            setPlayerScores((prev) => ({ ...prev, [data.playerName]: data.score }));
        });

        return () => { socket.off('lobby_created'); socket.off('player_joined'); socket.off('player_score_updated'); };
    }, [isLoggedIn]);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/quizzes`);
            const data = await response.json();
            if (Array.isArray(data)) setQuizzes(data);
            else if (data && Array.isArray(data.quizzes)) setQuizzes(data.quizzes);
            else setQuizzes([]);
        } catch (error) { console.error(error); setQuizzes([]); }
    };

    const handleDeleteQuiz = async (id) => {
        if (window.confirm("Are you sure you want to delete this quiz?")) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/quizzes/${id}`, { method: 'DELETE' });
                if (response.ok) setQuizzes(quizzes.filter(q => q.id !== id));
            } catch (error) { console.error(error); }
        }
    };



    const handleStartGame = (selectedMode) => {
        if (players.length === 0) return;
        setGameMode(selectedMode);
        socket.emit('start_game', { pin: lobbyPin, quizData: activeQuiz, mode: selectedMode });
        setGameStarted(true); setShowPodium(false); setShowMidLeaderboard(false);
        socket.emit('next_question', { pin: lobbyPin, questionIndex: 0, question: activeQuiz.questions[0], fullQuiz: selectedMode === 'self_paced' ? activeQuiz : null, mode: selectedMode });
    };

    const handleShowMidLeaderboard = () => { setShowMidLeaderboard(true); socket.emit('show_mid_leaderboard', { pin: lobbyPin }); };

    const handleNextQuestion = () => {
        setShowMidLeaderboard(false);
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < activeQuiz.questions.length) {
            setCurrentQuestionIndex(nextIndex);
            socket.emit('next_question', { pin: lobbyPin, questionIndex: nextIndex, question: activeQuiz.questions[nextIndex] });
        }
    };

    const handleEndGame = () => {
        socket.emit('end_game', { pin: lobbyPin, finalScores: playerScores });
        setGameStarted(false); setShowPodium(true);
    };

    const handleReset = () => {
        setShowPodium(false); setLobbyPin(''); setActiveQuiz(null);
        setPlayers([]); setPlayerScores({}); setCurrentQuestionIndex(0);
        setGameMode(''); setShowMidLeaderboard(false);
    };

    const getSortedLeaders = () => Object.entries(playerScores).map(([name, score]) => ({ name, score })).sort((a, b) => b.score - a.score);
    const toggleExpand = (id) => setExpandedQuizId(expandedQuizId === id ? null : id);

    if (!isLoggedIn) { return (<div style={{ backgroundColor: '#222', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '15px', maxWidth: '600px' }}> <h1 style={{ fontSize: '40px', color: '#4b0082', fontWeight: '900', marginBottom: '20px' }}>Hold up!</h1> <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}> <a href="/login" style={{ padding: '15px 40px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#d89e00', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>Log In</a> <a href="/register" style={{ padding: '15px 40px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#1368ce', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>Sign Up</a> </div> </div> </div>); }

    if (showPodium) {
        const leaders = getSortedLeaders();
        const first = leaders[0] || { name: 'No Player', score: 0 };
        const second = leaders[1] || { name: '-', score: 0 };
        const third = leaders[2] || { name: '-', score: 0 };

        return (
            <div style={{ textAlign: 'center', backgroundColor: '#1f1135', color: 'white', minHeight: 'calc(100vh - 70px)', padding: '50px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", position: 'relative', overflow: 'hidden' }}>
                <Confetti />
                <h1 style={{ fontSize: '60px', marginBottom: '60px', fontWeight: '900', zIndex: 1, position: 'relative', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>WINNERS</h1>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', height: '350px', alignItems: 'flex-end', marginBottom: '60px', zIndex: 1, position: 'relative' }}>
                    <div style={{ width: '150px', backgroundColor: '#4b0082', height: '180px', borderTop: '5px solid #1368ce', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '15px 15px 0 0', boxShadow: '0 -10px 20px rgba(0,0,0,0.3)' }}>
                        <div style={{ marginTop: '-60px', backgroundColor: '#1368ce', padding: '8px 15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.4)', width: '130px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{second.name}</div>
                            <div style={{ fontWeight: '900', fontSize: '16px', color: '#ffca28', marginTop: '2px' }}>{second.score} Points</div>
                        </div>
                        <h2 style={{ color: '#1368ce', fontSize: '60px', margin: 'auto 0' }}>2</h2>
                    </div>
                    <div style={{ width: '170px', backgroundColor: '#4b0082', height: '260px', borderTop: '8px solid #ffca28', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '15px 15px 0 0', boxShadow: '0 -10px 30px rgba(0,0,0,0.4)' }}>
                        <div style={{ marginTop: '-70px', backgroundColor: '#ffca28', padding: '10px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.4)', width: '150px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '22px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{first.name}</div>
                            <div style={{ fontWeight: '900', fontSize: '18px', color: '#4b0082', marginTop: '2px' }}>{first.score} Points</div>
                        </div>
                        <h2 style={{ color: '#ffca28', fontSize: '80px', margin: 'auto 0' }}>1</h2>
                    </div>
                    <div style={{ width: '150px', backgroundColor: '#4b0082', height: '130px', borderTop: '5px solid #cd7f32', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '15px 15px 0 0', boxShadow: '0 -10px 20px rgba(0,0,0,0.3)' }}>
                        <div style={{ marginTop: '-60px', backgroundColor: '#cd7f32', padding: '8px 15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.4)', width: '130px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{third.name}</div>
                            <div style={{ fontWeight: '900', fontSize: '16px', color: '#ffca28', marginTop: '2px' }}>{third.score} Points</div>
                        </div>
                        <h2 style={{ color: '#cd7f32', fontSize: '50px', margin: 'auto 0' }}>3</h2>
                    </div>
                </div>
                <button onClick={handleReset} style={{ padding: '15px 40px', fontSize: '22px', fontWeight: 'bold', backgroundColor: '#fff', color: '#4b0082', border: 'none', borderRadius: '30px', cursor: 'pointer', zIndex: 1, position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>Back to Dashboard</button>
            </div>
        );
    }

    if (gameStarted && activeQuiz) {
        if (gameMode === 'self_paced') {
            const leaders = getSortedLeaders();
            return (
                <div style={{ padding: '40px', backgroundColor: '#222', minHeight: 'calc(100vh - 70px)', textAlign: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '40px' }}>
                        <h2>PIN: {lobbyPin}</h2><h2 style={{ color: '#26890c' }}>Self-Paced Mode Active</h2><h2>Players: {players.length}</h2>
                    </div>
                    <h1 style={{ fontSize: '40px', marginBottom: '40px' }}>Live Leaderboard</h1>
                    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#333', padding: '30px', borderRadius: '15px', border: '2px solid #444' }}>
                        {leaders.map((l, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', padding: '15px', borderBottom: '1px solid #444', backgroundColor: i === 0 ? '#4b0082' : 'transparent', borderRadius: i === 0 ? '8px' : '0' }}>
                                <span>{i + 1}. {l.name}</span><span style={{ fontWeight: 'bold', color: '#ffca28' }}>{l.score} Points</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleEndGame} style={{ marginTop: '50px', padding: '15px 40px', fontSize: '24px', fontWeight: 'bold', backgroundColor: '#e21b3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>End Game</button>
                </div>
            );
        }

        const currentQ = activeQuiz.questions[currentQuestionIndex] || {};
        const isLastQuestion = activeQuiz.questions ? currentQuestionIndex === activeQuiz.questions.length - 1 : true;

        return (
            <div style={{ backgroundColor: '#222', minHeight: 'calc(100vh - 70px)', padding: '40px', textAlign: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: 'white' }}>
                    <h2>PIN: {lobbyPin}</h2><h2 style={{ color: '#1368ce' }}>Live Mode</h2>
                </div>
                {showMidLeaderboard ? (
                    <div style={{ color: 'white' }}>
                        <h1 style={{ fontSize: '40px', marginBottom: '30px' }}>Top 5 Players</h1>
                        {getSortedLeaders().slice(0, 5).map((l, i) => (
                            <div key={i} style={{ fontSize: '24px', padding: '15px', fontWeight: 'bold', backgroundColor: '#333', margin: '10px auto', maxWidth: '600px', borderRadius: '8px' }}>{i + 1}. {l.name} - <span style={{ color: '#ffca28' }}>{l.score} Points</span></div>
                        ))}
                        <button onClick={handleNextQuestion} style={{ marginTop: '30px', padding: '15px 40px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#1368ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Next Question</button>
                    </div>
                ) : (
                    <>
                        <h1 style={{ fontSize: '45px', marginBottom: '40px', color: 'white', backgroundColor: '#333', padding: '30px', borderRadius: '15px', border: '4px solid #1368ce' }}>{currentQ.questionText || "Question Loading..."}</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {Array.isArray(currentQ.answerOptions) && currentQ.answerOptions.map((opt, i) => opt && (
                                <div key={i} style={{ backgroundColor: BG_COLORS[i], padding: '30px', borderRadius: '15px', color: 'white', fontSize: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ fontSize: '40px' }}>{SHAPES[i]}</span> {opt}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '40px' }}>
                            {!isLastQuestion ? (
                                <button onClick={handleShowMidLeaderboard} style={{ padding: '15px 40px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#26890c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginRight: '15px' }}>Show Leaderboard</button>
                            ) : (
                                <button onClick={handleEndGame} style={{ padding: '15px 40px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#e21b3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>End Game</button>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (lobbyPin && !gameStarted) {
        return (
            <div style={{ backgroundColor: '#222', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: '20px' }}>
                <h2 style={{ fontSize: '30px', color: '#fff', margin: '0 0 20px 0' }}>Join with Game PIN:</h2>
                <div style={{ padding: '20px 60px', backgroundColor: '#fff', border: '6px solid #4b0082', borderRadius: '15px', marginBottom: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                    <h1 style={{ fontSize: '90px', margin: '0', letterSpacing: '8px', color: '#000', fontWeight: '900' }}>{lobbyPin}</h1>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(lobbyPin); alert("PIN Copied! 📋"); }} style={{ marginTop: '10px', padding: '10px 25px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#4b0082', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '30px' }}>📋 Copy PIN</button>
                <div style={{ backgroundColor: '#333', width: '100%', maxWidth: '750px', padding: '30px', borderRadius: '15px', border: '2px solid #444', textAlign: 'center', marginBottom: '40px' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '24px' }}>Players Joined ({players.length})</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', minHeight: '50px' }}>
                        {players.length === 0 ? <span style={{ color: '#888', fontSize: '20px', fontStyle: 'italic' }}>Waiting for players...</span> : players.map((p, i) => <span key={i} style={{ backgroundColor: '#4b0082', color: 'white', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', fontSize: '20px' }}>{p}</span>)}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button onClick={() => handleStartGame('live')} disabled={players.length === 0} style={{ backgroundColor: players.length === 0 ? '#444' : '#1368ce', color: players.length === 0 ? '#888' : 'white', padding: '20px 40px', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '22px', cursor: players.length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>Start Live Mode</button>
                    <button onClick={() => handleStartGame('self_paced')} disabled={players.length === 0} style={{ backgroundColor: players.length === 0 ? '#444' : '#26890c', color: players.length === 0 ? '#888' : 'white', padding: '20px 40px', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '22px', cursor: players.length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>Start Self-Paced</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#222', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '15px' }}>
                    <span style={{ fontSize: '38px' }}>📊</span>
                    <h2 style={{ margin: 0, fontSize: '34px', color: '#ffffff', fontWeight: '900', letterSpacing: '1px' }}>Host Game (My Quizzes)</h2>
                </div>
                {(!quizzes || quizzes.length === 0) && <div style={{ textAlign: 'center', color: '#888', marginTop: '50px', fontSize: '20px' }}>No quizzes found. Create a quiz to get started!</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Array.isArray(quizzes) && quizzes.map((q) => {
                        let parsed = { title: "Untitled Quiz", questions: [] };
                        if (q.quiz_data) { try { parsed = typeof q.quiz_data === 'string' ? JSON.parse(q.quiz_data) : q.quiz_data; } catch (e) { } }
                        const isExpanded = expandedQuizId === q.id;
                        const questionList = Array.isArray(parsed.questions) ? parsed.questions : [];

                        return (
                            <div key={q.id} style={{ backgroundColor: '#333', borderRadius: '12px', border: isExpanded ? '2px solid #1368ce' : '1px solid #444', boxShadow: isExpanded ? '0 8px 20px rgba(19, 104, 206, 0.2)' : '0 4px 6px rgba(0,0,0,0.3)', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                                <div style={{ padding: '25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div onClick={() => toggleExpand(q.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                                        <div style={{ width: '35px', height: '35px', backgroundColor: '#444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▼</div>
                                        <div>
                                            <h3 style={{ color: '#ffffff', margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>{parsed.title || 'Untitled Quiz'}</h3>
                                            <p style={{ color: '#aaa', margin: '0', fontSize: '15px' }}>{questionList.length} Questions • Click to {isExpanded ? 'hide' : 'view'} details</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button onClick={() => handleDeleteQuiz(q.id)} style={{ backgroundColor: '#e21b3c', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.2s' }}>Delete</button>
                                        <button onClick={() => socket.emit('create_lobby', parsed)} style={{ backgroundColor: '#26890c', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.2s' }}>Create Lobby</button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ backgroundColor: '#2a2a2a', padding: '25px 30px', borderTop: '1px solid #444' }}>
                                        <h4 style={{ color: '#fff', fontSize: '18px', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #555', paddingBottom: '10px' }}>Quiz Questions Preview:</h4>

                                        {questionList.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {questionList.map((question, index) => (
                                                    <div key={index} style={{ backgroundColor: '#383838', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #1368ce' }}>
                                                        <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                                                            {index + 1}. {question.questionText || 'No question text'}
                                                        </p>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                            {Array.isArray(question.answerOptions) && question.answerOptions.map((opt, optIndex) => opt && (
                                                                <span key={optIndex} style={{
                                                                    padding: '8px 15px',
                                                                    backgroundColor: (question.correctAnswers?.includes(optIndex) || Number(question.correctAnswer) === optIndex) ? '#26890c' : '#444',
                                                                    color: 'white',
                                                                    borderRadius: '6px',
                                                                    fontSize: '15px',
                                                                    fontWeight: (question.correctAnswers?.includes(optIndex) || Number(question.correctAnswer) === optIndex) ? 'bold' : 'normal',
                                                                    boxShadow: (question.correctAnswers?.includes(optIndex) || Number(question.correctAnswer) === optIndex) ? '0 2px 5px rgba(38, 137, 12, 0.4)' : 'none'
                                                                }}>
                                                                    {opt} {(question.correctAnswers?.includes(optIndex) || Number(question.correctAnswer) === optIndex) && '✓'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#888', fontStyle: 'italic', fontSize: '16px' }}>No questions found in this quiz.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}