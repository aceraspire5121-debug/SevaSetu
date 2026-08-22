const express = require('express');
const router = express.Router();
const {
  getFederationDashboard,
  getDemandForecast,
  getWorkersByCategory,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/federation-dashboard', protect, authorize('federationAdmin'), getFederationDashboard);
router.get('/demand-forecast', protect, authorize('federationAdmin', 'societyAdmin'), getDemandForecast);
router.get('/workers/category/:categoryName', protect, authorize('federationAdmin', 'societyAdmin'), getWorkersByCategory);

module.exports = router;
