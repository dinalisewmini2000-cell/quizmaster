import React, { useState } from 'react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!username || !email || !password) return alert("⚠️ Please fill in all details!");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://quizmaster-production-4f7a.up.railway.app'}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert("✅ Registration Successful! You can now log in.");
                window.location.href = '/login';
            } else {
                alert(`❌ ${data.error}`);
            }
        } catch (err) {
            alert("⚠️ Server error! Check if port 5005 is running.");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '36px', fontWeight: '900' }}>Kahoot!</h1>
            <h3 style={{ color: 'gray', marginBottom: '30px' }}>Create an account</h3>

            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '15px', fontSize: '18px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '15px', fontSize: '18px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '15px', fontSize: '18px', marginBottom: '25px', borderRadius: '5px', border: '1px solid #ccc' }} />

            <button onClick={handleRegister} style={{ width: '100%', padding: '15px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#1368ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px' }}>
                Sign up
            </button>
            <p style={{ margin: 0, color: '#333' }}>
                Already have an account? <a href="/login" style={{ color: '#d89e00', fontWeight: 'bold', textDecoration: 'none' }}>Log in</a>
            </p>
        </div>
    );
}