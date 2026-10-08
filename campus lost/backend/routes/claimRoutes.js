const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { authenticateToken } = require('../middleware/auth');

router.post('/verify', authenticateToken, claimController.verifyClaim);
router.post('/manual-review', authenticateToken, claimController.requestManualReview);
router.post('/:id/approve', authenticateToken, claimController.approveClaim);
router.post('/:id/reject', authenticateToken, claimController.rejectClaim);
router.get('/item/:itemId', authenticateToken, claimController.getClaimStatus);
router.get('/finder-requests', authenticateToken, claimController.getFinderClaimRequests);

module.exports = router;
