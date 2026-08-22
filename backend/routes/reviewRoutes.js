const express = require('express');
const router = express.Router();
const { addReview, getWorkerReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/worker/:workerId', getWorkerReviews);

module.exports = router;
