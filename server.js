// server.js
const express = require('express');
const connectDB = require('./db');

// Connect to Database
connectDB();

const app = express();

// Init Middleware to accept JSON data
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
