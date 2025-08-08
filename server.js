const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// DB Connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Static folder for file downloads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
// Note: Make sure to create these route files in your 'routes' folder
// app.use('/api/devices', require('./routes/devices'));
app.use('/api/files', require('./routes/fileManager'));
// app.use('/api/data', require('./routes/data'));


// === CONFIGURATION ROUTES ===

let webviewUrl = process.env.WEBVIEW_URL || 'https://www.google.com'; // Default URL

// Endpoint to get the current WebView URL (for Android app)
app.get('/api/config/webview-url', (req, res) => {
    res.json({ url: webviewUrl });
});

// Endpoint to update the WebView URL (for Admin Panel, secured)
app.post('/api/config/webview-url', authMiddleware, (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ msg: 'A valid URL is required' });
    }
    webviewUrl = url;
    console.log(`WebView URL updated to: ${webviewUrl}`);
    res.json({ msg: 'WebView URL updated successfully!', url: webviewUrl });
});


// === SERVER AND SOCKET.IO SETUP ===

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // React app ka URL
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    socket.on('joinRoom', (deviceId) => {
        socket.join(deviceId);
        console.log(`Socket ${socket.id} joined room for device: ${deviceId}`);
    });

    socket.on('updateLocation', (data) => {
        // TODO: Save location to DB
        io.to(data.deviceId).emit('locationUpdated', data);
        console.log('Location update received and broadcasted for', data.deviceId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
