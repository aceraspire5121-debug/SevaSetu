const express = require('express');
const router = express.Router();
const {
  getFederationDashboard,
  getDemandForecast,
  getWorkersByCategory,
  getAllWorkersAdmin,
  getAllAdmins,
  updateMinimumWageFloor,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/federation-dashboard', protect, authorize('federationAdmin'), getFederationDashboard);
router.get('/demand-forecast', protect, authorize('federationAdmin', 'societyAdmin'), getDemandForecast);
router.get('/workers/category/:categoryName', protect, authorize('federationAdmin', 'societyAdmin'), getWorkersByCategory);

// Super Admin (Federation Admin) Global Access Routes
router.get('/workers/all', protect, authorize('federationAdmin'), getAllWorkersAdmin);
router.get('/admins/all', protect, authorize('federationAdmin'), getAllAdmins);
router.put('/wage-floor/:id', protect, authorize('federationAdmin'), updateMinimumWageFloor);

module.exports = router;
