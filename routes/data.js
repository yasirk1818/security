const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Models import karen
const SmsLog = require('../models/SmsLog'); // Farz karen aap ne yeh model banaya hai
const CallLog = require('../models/CallLog');

// === Android App Endpoints ===

// Android app se call log save karne ka endpoint
router.post('/:deviceId/call', async (req, res) => {
    try {
        const { phoneNumber, type, duration, date } = req.body;
        const newLog = new CallLog({
            deviceId: req.params.deviceId,
            phoneNumber,
            type,
            duration,
            date: new Date(date)
        });
        await newLog.save();
        res.status(201).json({ msg: 'Call log saved' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Yahan SMS save karne ka endpoint bhi bana sakte hain.

// === React Panel Endpoints ===

// Panel ke liye call logs fetch karne ka endpoint
router.get('/:deviceId/calls', authMiddleware, async (req, res) => {
    try {
        const logs = await CallLog.find({ deviceId: req.params.deviceId }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Yahan SMS fetch karne ka endpoint bhi bana sakte hain.

module.exports = router;
