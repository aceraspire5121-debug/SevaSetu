const express = require('express');
const router = express.Router();
const { verifyAadhaarCard } = require('../controllers/aiController');

// POST /api/ai/verify-aadhaar
router.post('/verify-aadhaar', verifyAadhaarCard);

module.exports = router;
