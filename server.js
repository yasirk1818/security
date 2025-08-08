// server.js (updated)
const express = require('express');
const http = require('http'); // http module ko require karen
const { Server } = require("socket.io"); // socket.io se Server class import karen

// ... baaqi ka code (mongoose, cors, etc.)

const app = express();
const server = http.createServer(app); // Express app se http server banayen
const io = new Server(server, { // Socket.IO ko server se attach karen
    cors: {
        origin: "http://localhost:3000", // Aapke React panel ka URL
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Jab koi device ya panel room join karna chahe
    socket.on('joinRoom', (deviceId) => {
        socket.join(deviceId);
        console.log(`Socket ${socket.id} joined room: ${deviceId}`);
    });

    // Jab Android app location update bheje
    socket.on('updateLocation', (data) => {
        const { deviceId, latitude, longitude } = data;
        
        // 1. Database me location save karen (aap iske liye alag function bana sakte hain)
        // Device.findOneAndUpdate({ deviceId }, { location: { latitude, longitude, lastUpdate: new Date() }});
        
        // 2. Usi device ke room me baithay admin panel ko live location bhejen
        io.to(deviceId).emit('locationUpdated', { latitude, longitude });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ... baaqi ka code (routes, etc.)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // app.listen ki jagah server.listen
