require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Import routes
const authRoutes = require("./routes/authRoutes");
const alertRoutes = require("./routes/alertRoutes");
const sosRoutes = require("./routes/sosRoutes");
const userRoutes = require("./routes/userRoutes");

// Test route
app.get('/', (req, res) => {
    res.send('Women Safety System Backend Running');
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/users", userRoutes);

// Connect DB & Start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('ERROR: MONGO_URI is not defined in .env file');
    process.exit(1);
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join room for user-specific updates
    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
    });

    // Join room for admin updates
    socket.on('join-admin-room', () => {
        socket.join('admin-room');
        console.log(`Admin joined admin room`);
    });

    // Join room for guardian updates
    socket.on('join-guardian-room', (userId) => {
        socket.join(`guardian-${userId}`);
        console.log(`Guardian ${userId} joined guardian room`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Socket.io server ready`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

