import React, { useState } from 'react';

export default function GameHistory() {
    const [history, setHistory] = useState([
        { id: 1, title: 'Operating Systems Quiz', date: '2026-06-15', players: 12 },
        { id: 2, title: 'Web Development Basics', date: '2026-06-18', players: 8 }
    ]);

    return (
        <div style={{ padding: '50px', backgroundColor: '#f4f4f8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#46178f', marginBottom: '40px' }}>📜 My Game History</h1>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {history.map(game => (
                    <div key={game.id} style={{
                        backgroundColor: '#fff',
                        padding: '25px',
                        borderRadius: '15px',
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <div>
                            {/* 🔥 MEHENA ME FONT COLOR EKA SHARP KARAMU */}
                            <h3 style={{
                                margin: '0 0 5px 0',
                                fontSize: '24px',
                                fontWeight: '900',       // Bold wadi kara
                                color: '#000000',        // Pure Black damma (Sharp wenawa)
                                letterSpacing: '0.5px'   // Text eka thawa clear wenawa
                            }}>
                                {game.title}
                            </h3>
                            <p style={{ color: '#555', margin: 0, fontWeight: '500' }}>Date: {game.date}</p>
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#1368ce', fontSize: '18px' }}>
                            {game.players} Players
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}