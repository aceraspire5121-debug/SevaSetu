const express = require('express');
const router = express.Router();
const {
  getSocieties,
  createSociety,
  getMySocietyDashboard,
} = require('../controllers/societyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getSocieties);
router.post('/', protect, authorize('federationAdmin'), createSociety);
router.get('/my-society', protect, authorize('societyAdmin', 'federationAdmin'), getMySocietyDashboard);

module.exports = router;
