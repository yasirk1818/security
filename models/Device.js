// models/Device.js
const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    deviceModel: { type: String, required: true },
    androidVersion: { type: String },
    lastSeen: { type: Date, default: Date.now },
    // Yahan dosri details bhi save kar saktay hain
    battery: {
        level: Number,
        isCharging: Boolean
    },
    network: {
        networkName: String,
        wifiStatus: String
    },
    location: {
        latitude: Number,
        longitude: Number,
        lastUpdate: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Device', DeviceSchema);
