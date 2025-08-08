const mongoose = require('mongoose');
const DeviceSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    deviceModel: { type: String, required: true },
    androidVersion: { type: String },
    battery: { level: Number, isCharging: Boolean },
    network: { name: String, wifiStatus: String },
    location: {
        latitude: Number,
        longitude: Number,
        lastUpdate: Date,
    },
    lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose.model('Device', DeviceSchema);
