import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <style>
                {`
                .hero-btn {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .hero-btn:hover {
                    transform: translateY(-5px) scale(1.02);
                }
                .play-btn:hover {
                    box-shadow: 0 10px 25px rgba(38, 137, 12, 0.5);
                }
                .host-btn:hover {
                    box-shadow: 0 10px 25px rgba(255, 255, 255, 0.4);
                }
                .card {
                    transition: transform 0.3s ease;
                }
                .card:hover {
                    transform: translateY(-10px);
                }
                `}
            </style>

            <div style={{
                background: 'linear-gradient(135deg, #46178f 0%, #1368ce 100%)',
                padding: '100px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h1 style={{ fontSize: '60px', fontWeight: '900', marginBottom: '20px', letterSpacing: '1px', textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    Welcome to Quiz Master! 🚀
                </h1>
                <p style={{ fontSize: '22px', maxWidth: '800px', margin: '0 auto 50px auto', lineHeight: '1.6', color: '#e0e0e0' }}>
                    Create, host, and play highly interactive quizzes. Bring the ultimate game-show experience directly to your screen with real-time leaderboards and dynamic challenges.
                </p>

                <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="hero-btn play-btn"
                        onClick={() => navigate('/join')}
                        style={{ padding: '18px 45px', fontSize: '24px', fontWeight: 'bold', backgroundColor: '#26890c', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        🎮 Play a Game
                    </button>
                    <button
                        className="hero-btn host-btn"
                        onClick={() => navigate('/dashboard')}
                        style={{ padding: '18px 45px', fontSize: '24px', fontWeight: 'bold', backgroundColor: '#ffffff', color: '#46178f', border: 'none', borderRadius: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        👑 Host a Live Game
                    </button>
                </div>
            </div>

            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '40px', fontWeight: '900', color: '#000', marginBottom: '50px' }}>
                    Everything you need to engage your audience
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>

                    <div className="card" style={{ backgroundColor: 'white', padding: '50px', borderRadius: '20px', borderTop: '8px solid #e21b3c', width: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                        <h3 style={{ fontSize: '24px', color: '#333', marginBottom: '15px' }}>Engaging Quizzes</h3>
                        <p style={{ color: '#666', fontSize: '18px', lineHeight: '1.5' }}>Create fun and interactive questions to keep everyone on their toes.</p>
                    </div>

                    <div className="card" style={{ backgroundColor: 'white', padding: '50px', borderRadius: '20px', borderTop: '8px solid #1368ce', width: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                        <h3 style={{ fontSize: '24px', color: '#333', marginBottom: '15px' }}>Live Leaderboards</h3>
                        <p style={{ color: '#666', fontSize: '18px', lineHeight: '1.5' }}>Track scores in real-time and display the ultimate winners on the podium.</p>
                    </div>

                    <div className="card" style={{ backgroundColor: 'white', padding: '50px', borderRadius: '20px', borderTop: '8px solid #d89e00', width: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                        <h3 style={{ fontSize: '24px', color: '#333', marginBottom: '15px' }}>Play Anywhere</h3>
                        <p style={{ color: '#666', fontSize: '18px', lineHeight: '1.5' }}>Join easily from any device using just a simple game PIN.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}