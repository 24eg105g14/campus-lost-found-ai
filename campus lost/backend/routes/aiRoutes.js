const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

router.post('/suggest-questions', authenticateToken, aiController.suggestQuestions);
router.post('/search-assistant', authenticateToken, aiController.searchAssistant);

module.exports = router;
