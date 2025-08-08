const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// DB Connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Static folder for file downloads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
// ... doosray routes ...

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000" } // React app ka URL
});

// Socket.IO Logic
// ... Pichli post wala Socket.IO connection code yahan daal den ...
io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);
    socket.on('joinRoom', (deviceId) => socket.join(deviceId));
    socket.on('updateLocation', (data) => {
        io.to(data.deviceId).emit('locationUpdated', data);
    });
});

// WebView URL Route
let webviewUrl = process.env.WEBVIEW_URL;
app.get('/api/config/webview-url', (req, res) => res.json({ url: webviewUrl }));
app.post('/api/config/webview-url', require('./middleware/authMiddleware'), (req, res) => {
    webviewUrl = req.body.url;
    res.json({ msg: 'URL updated successfully', url: webviewUrl });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
