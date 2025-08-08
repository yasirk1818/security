const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = 'jsonwebtoken';
const Admin = require('../models/Admin');

// Register (sirf ek baar use karen, ya alag tool se admin banayen)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    let admin = new Admin({ username, password });
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    await admin.save();
    res.send('Admin registered');
});

// Login
router.post('/login', async (req, res) => {
    // ... pichli post wala login code yahan daal den ...
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
    
    const payload = { admin: { id: admin.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
    });
});

module.exports = router;
