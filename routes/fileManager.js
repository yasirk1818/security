const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join('uploads', req.params.deviceId, req.body.filePath || '');
        // Directory banayen agar mojood na ho
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// === ANDROID APP ENDPOINTS ===

// 1. Endpoint for Android app to upload a file
// Android app is endpoint par file bhejay gi
router.post('/upload/:deviceId', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.status(200).json({
        message: 'File uploaded successfully!',
        path: req.file.path.replace(/\\/g, "/") // Windows paths ko fix karna
    });
});


// === REACT PANEL ENDPOINTS ===

// 2. Endpoint for React panel to get a list of files/folders
// Is par authMiddleware lagaya hai taake sirf login admin hi access kar sake
router.get('/list/:deviceId', authMiddleware, (req, res) => {
    const deviceId = req.params.deviceId;
    const requestedPath = req.query.path || ''; // e.g., ?path=DCIM/Camera
    const directoryPath = path.join(__dirname, '..', 'uploads', deviceId, requestedPath);

    if (!fs.existsSync(directoryPath)) {
        return res.status(404).json({ msg: 'Directory not found.' });
    }

    try {
        const items = fs.readdirSync(directoryPath, { withFileTypes: true });
        const fileDetails = items.map(item => {
            const itemPath = path.join(directoryPath, item.name);
            const relativePath = path.join(requestedPath, item.name).replace(/\\/g, "/");
            const stats = fs.statSync(itemPath);

            return {
                name: item.name,
                path: relativePath,
                isDirectory: item.isDirectory(),
                size: stats.size,
                // Thumbnails ke liye, hum sirf image files ke liye ek path bhej rahe hain
                thumbnail: item.isDirectory() ? null : `/uploads/${deviceId}/${relativePath}`
            };
        });
        res.json(fileDetails);
    } catch (error) {
        res.status(500).json({ msg: 'Failed to read directory.', error: error.message });
    }
});

module.exports = router;
