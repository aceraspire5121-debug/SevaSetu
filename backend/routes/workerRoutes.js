const express = require('express');
const router = express.Router();
const {
  getVerifiedWorkers,
  getWorkerById,
  toggleAvailability,
  approveRejectWorker,
  getWorkerStats,
  resubmitWorkerApplication,
} = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getVerifiedWorkers);
router.get('/stats/me', protect, authorize('worker'), getWorkerStats);
router.put('/availability', protect, authorize('worker'), toggleAvailability);
router.put('/resubmit-application', protect, authorize('worker'), resubmitWorkerApplication);
router.get('/:id', getWorkerById);
router.put('/:id/approve-reject', protect, authorize('societyAdmin', 'federationAdmin'), approveRejectWorker);

module.exports = router;
