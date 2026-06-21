import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Join from './pages/Join';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateQuiz from './pages/CreateQuiz';
import Profile from './pages/Profile';

function App() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Router>
      <nav style={{ display: 'flex', gap: '30px', padding: '15px 20px', backgroundColor: '#4b0082', justifyContent: 'center', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>🏠 Home</Link>
        <Link to="/join" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>🎮 Join Game</Link>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>📊 Host Game</Link>

        {/* 🔥 Login unama witharak Create Quiz ekai, My Profile ekai penwanawa */}
        {isLoggedIn && (
          <>
            <Link to="/create" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>🛠️ Create Quiz</Link>
            <Link to="/profile" style={{ color: '#ffca28', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>👤 My Profile</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/create" element={<CreateQuiz />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;