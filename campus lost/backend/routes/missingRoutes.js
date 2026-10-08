const express = require('express');
const router = express.Router();
const missingRequestController = require('../controllers/missingRequestController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, missingRequestController.createMissingRequest);
router.get('/my', authenticateToken, missingRequestController.getMyMissingRequests);
router.get('/:id', authenticateToken, missingRequestController.getMissingRequestById);
router.get('/:id/matches', authenticateToken, missingRequestController.getMatchesForMissingRequest);
router.delete('/:id', authenticateToken, missingRequestController.deleteMissingRequest);

module.exports = router;
