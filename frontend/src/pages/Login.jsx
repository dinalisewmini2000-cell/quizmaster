import React, { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) return alert("⚠️ Please fill in all details!");

        try {
            const response = await fetch(`https://quizmaster-production-4f7a.up.railway.app/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();


            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard';
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
            <h3 style={{ color: 'gray', marginBottom: '30px' }}>Log in to your account</h3>

            <input type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '15px', fontSize: '18px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '15px', fontSize: '18px', marginBottom: '25px', borderRadius: '5px', border: '1px solid #ccc' }} />

            <button onClick={handleLogin} style={{ width: '100%', padding: '15px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#d89e00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px' }}>
                Log in
            </button>
            <p style={{ margin: 0, color: '#333' }}>
                Don't have an account? <a href="/register" style={{ color: '#1368ce', fontWeight: 'bold', textDecoration: 'none' }}>Sign up</a>
            </p>
        </div>
    );
}