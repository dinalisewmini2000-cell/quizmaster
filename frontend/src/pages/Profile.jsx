import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
    const [quizzes, setQuizzes] = useState([]);
    const [userData, setUserData] = useState({
        username: 'Awesome Host',
        email: 'Loading email...'
    });

    useEffect(() => {
        // 1. Token eka decode karala Username ekai Email ekai gannawa
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // JWT eka base64 walin decode karanawa
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));

                setUserData({
                    username: payload.username || 'Host',
                    email: payload.email || 'Logged in successfully'
                });
            } catch (e) {
                console.error("Token decode error:", e);
            }
        }

        // 2. Quiz history eka pennanna quizzes tika fetch karanawa
        const fetchQuizzes = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/quizzes`);
                const data = await response.json();
                setQuizzes(data);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        };

        fetchQuizzes();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div style={{
            backgroundColor: '#f4f6f8',
            minHeight: 'calc(100vh - 70px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            padding: '40px 20px'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                width: '100%',
                maxWidth: '550px',
                overflow: 'hidden'
            }}>
                {/* Header Section (Purple Gradient) */}
                <div style={{
                    background: 'linear-gradient(135deg, #4b0082 0%, #6a0dad 100%)',
                    padding: '40px 20px 60px 20px',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div style={{
                        fontSize: '60px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px auto',
                        backdropFilter: 'blur(5px)',
                        border: '3px solid rgba(255,255,255,0.5)'
                    }}>
                        👨‍💻
                    </div>
                    <h1 style={{ margin: '0', fontSize: '32px', fontWeight: '900', letterSpacing: '1px' }}>
                        Welcome, {userData.username}!
                    </h1>
                    <p style={{ margin: '5px 0 0 0', fontSize: '16px', opacity: '0.9' }}>
                        ✉️ {userData.email}
                    </p>
                </div>

                {/* Content Section */}
                <div style={{ padding: '30px 40px', marginTop: '-30px', backgroundColor: '#fff', borderRadius: '30px 30px 0 0' }}>

                    {/* Stats Box */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '15px',
                        marginBottom: '30px',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ margin: '0', fontSize: '32px', color: '#4b0082', fontWeight: '900' }}>{quizzes.length}</h2>
                            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>Total Quizzes</p>
                        </div>
                        <div style={{ width: '1px', backgroundColor: '#ddd' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ margin: '0', fontSize: '32px', color: '#26890c', fontWeight: '900' }}>Active</h2>
                            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>Host Status</p>
                        </div>
                    </div>

                    {/* Quiz History Quick Links */}
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '15px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                            📚 Recent Quizzes
                        </h3>
                        {quizzes.length === 0 ? (
                            <p style={{ color: '#888', fontStyle: 'italic', fontSize: '15px' }}>You haven't created any quizzes yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {quizzes.slice(0, 3).map((q, i) => {
                                    const parsed = typeof q.quiz_data === 'string' ? JSON.parse(q.quiz_data) : q.quiz_data;
                                    return (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', backgroundColor: '#f0f4ff', borderRadius: '8px', borderLeft: '4px solid #1368ce' }}>
                                            <span style={{ fontWeight: 'bold', color: '#333' }}>{parsed.title}</span>
                                            <span style={{ color: '#666', fontSize: '14px' }}>{parsed.questions?.length || 0} Qs</span>
                                        </div>
                                    );
                                })}
                                {quizzes.length > 3 && (
                                    <Link to="/dashboard" style={{ textAlign: 'center', color: '#1368ce', textDecoration: 'none', fontWeight: 'bold', marginTop: '10px', fontSize: '15px' }}>View all {quizzes.length} quizzes ➔</Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#c11730'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#e21b3c'}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            backgroundColor: '#e21b3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 15px rgba(226, 27, 60, 0.3)'
                        }}
                    >
                        🚪 Log Out Securely
                    </button>

                </div>
            </div>
        </div>
    );
}