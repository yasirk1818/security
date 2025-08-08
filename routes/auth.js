const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator'); // Import karen

const Admin = require('../models/Admin');

// Register (sirf ek baar use karen)
router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        let admin = await Admin.findOne({ username });
        if (admin) {
            return res.status(400).json({ msg: 'Admin already exists' });
        }
        admin = new Admin({ username, password });
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);
        await admin.save();
        res.status(201).send('Admin registered');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', [
    check('username', 'Username is required').exists(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { admin: { id: admin.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
