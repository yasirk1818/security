// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Parent = require('../models/Parent');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new parent
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Check if parent already exists
        let parent = await Parent.findOne({ email });
        if (parent) {
            return res.status(400).json({ msg: 'User with this email already exists.' });
        }

        // 2. Create a new parent instance
        parent = new Parent({ name, email, password });

        // 3. Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        parent.password = await bcrypt.hash(password, salt);

        // 4. Save the parent to the database
        await parent.save();

        res.status(201).json({ msg: 'Parent registered successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
