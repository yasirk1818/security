// routes/devices.js
const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// Android app se naye device ko register karne ka route
router.post('/register', async (req, res) => {
    const { deviceId, deviceModel, androidVersion } = req.body;
    try {
        let device = await Device.findOne({ deviceId });
        if (device) {
            return res.status(400).json({ msg: 'Device already registered' });
        }
        device = new Device({ deviceId, deviceModel, androidVersion });
        await device.save();
        res.status(201).json(device);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Panel ke liye sab devices ki list hasil karne ka route
router.get('/', async (req, res) => {
    try {
        const devices = await Device.find().sort({ createdAt: -1 });
        res.json(devices);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Isi tarah dosray routes (SMS, Calls, Location update) banayen.
module.exports = router;
