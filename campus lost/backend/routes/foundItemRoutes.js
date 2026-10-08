const express = require('express');
const router = express.Router();
const foundItemController = require('../controllers/foundItemController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public or authenticated list & detail
router.get('/', foundItemController.getFoundItems);
router.get('/my', authenticateToken, foundItemController.getMyFoundItems);
router.get('/:id', foundItemController.getFoundItemById);

// Protected routes
router.post('/', authenticateToken, upload.single('image'), foundItemController.createFoundItem);
router.put('/:id', authenticateToken, foundItemController.updateFoundItem);
router.delete('/:id', authenticateToken, foundItemController.deleteFoundItem);

// Delivery status route
router.post('/:id/delivered', authenticateToken, foundItemController.markDelivered);

module.exports = router;
