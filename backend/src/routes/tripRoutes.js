// backend/src/routes/tripRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { parseTripDocument } = require('../controllers/tripController');

const router = express.Router();

// configure multer storage (store uploads in uploads/ folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    // keep original name with timestamp to avoid collisions
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// POST /api/trip/parse
router.post('/parse', upload.single('document'), parseTripDocument);

module.exports = router;
