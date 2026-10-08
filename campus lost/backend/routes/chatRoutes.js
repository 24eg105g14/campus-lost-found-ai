const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// Mounted at /api/conversations
router.get('/', authenticateToken, chatController.getConversations);
router.get('/:conversationId/messages', authenticateToken, chatController.getMessages);
router.post('/:conversationId/messages', authenticateToken, chatController.sendMessage);

module.exports = router;
