const multer = require('multer');
const path = require('path');

// Use memoryStorage so files land in RAM (req.file.buffer) — never touch disk.
// The processAndUploadImage helper in imageWorkers.js converts + pushes straight to Bunny.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed.'));
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
});
