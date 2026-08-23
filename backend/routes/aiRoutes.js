const express = require('express');
const router = express.Router();
const { verifyAadhaarCard, diagnoseProblemImage } = require('../controllers/aiController');

// POST /api/ai/verify-aadhaar
router.post('/verify-aadhaar', verifyAadhaarCard);

// POST /api/ai/diagnose-image
router.post('/diagnose-image', diagnoseProblemImage);

module.exports = router;
