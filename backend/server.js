require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Routes import karanawa
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
require('./config/db');

// API Routes
app.use('/api', authRoutes);
app.use('/api', quizRoutes);

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log(`🟢 User Connected: ${socket.id}`);

    // 1. Host creates a lobby
    socket.on('create_lobby', (quizData) => {
        if (!quizData) return;
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        socket.join(pin);
        socket.emit('lobby_created', { pin, quizData });
        console.log(`Lobby Created: ${pin}`);
    });

    // 2. Player joins the lobby
    socket.on('join_lobby', (data) => {
        if (!data || !data.pin) return;
        const { pin, playerName } = data;
        socket.join(pin);
        io.to(pin).emit('player_joined', playerName);
        console.log(`${playerName} joined lobby ${pin}`);
    });

    // 3. Game eka start karaddi
    socket.on('start_game', (data) => {
        if (!data || !data.pin) return;
        io.to(data.pin).emit('game_started', { quizData: data.quizData, mode: data.mode });
        console.log(`🚀 Game started in lobby ${data.pin} | Mode: ${data.mode}`);
    });

    // 4. Next question ekata yaddi
    socket.on('next_question', (data) => {
        if (!data || !data.pin) return;
        io.to(data.pin).emit('next_question', data);
        console.log(`⏭️ Lobby ${data.pin} next question`);
    });

    // 5. Player score update karaddi
    socket.on('submit_answer', (data) => {
        if (!data || !data.pin) return;
        io.to(data.pin).emit('player_score_updated', data);
    });

    // 6. Mid-Game Leaderboard request
    socket.on('show_mid_leaderboard', (data) => {
        if (!data || !data.pin) return;
        io.to(data.pin).emit('show_mid_leaderboard');
        console.log(`📊 Showing intermediate leaderboard in lobby ${data.pin}`);
    });

    // 7. Game eka end karaddi
    socket.on('end_game', (data) => {
        if (!data || !data.pin) return;
        io.to(data.pin).emit('end_game', { finalScores: data.finalScores });
        console.log(`🏁 Game over in lobby ${data.pin}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 User Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5005;

// Keep track of all raw TCP connections
const activeConnections = new Set();
server.on('connection', (conn) => {
    activeConnections.add(conn);
    conn.once('close', () => {
        activeConnections.delete(conn);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

function forceShutdown(signal) {
    console.log(`[Shutdown] Force killing all ${activeConnections.size} active TCP connections...`);
    for (const conn of activeConnections) {
        conn.destroy();
    }
    
    // Close socket.io and express server
    if (io) io.close();
    server.close(() => {
        if (signal === 'SIGUSR2') {
            process.kill(process.pid, 'SIGUSR2');
        } else {
            process.exit(0);
        }
    });
}

// Gracefully handle nodemon restarts to avoid EADDRINUSE
process.once('SIGUSR2', () => forceShutdown('SIGUSR2'));
process.on('SIGINT', () => forceShutdown('SIGINT'));
process.on('SIGTERM', () => forceShutdown('SIGTERM'));