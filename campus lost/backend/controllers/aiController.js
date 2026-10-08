const AIService = require('../services/AIService');
const ConversationalSearchService = require('../services/ConversationalSearchService');

exports.suggestQuestions = async (req, res) => {
  try {
    const { category, brand, itemName, description } = req.body;
    const suggestions = await AIService.generateVerificationQuestions({
      category,
      brand,
      itemName,
      description
    });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Server error generating suggested questions.' });
  }
};

exports.searchAssistant = async (req, res) => {
  try {
    const result = await ConversationalSearchService.process(req.body);
    res.json(result);
  } catch (err) {
    if (!err.status || err.status >= 500) console.error('AI search assistant error:', err.message);
    res.status(err.status || 500).json({
      message: err.message || 'AI search is temporarily unavailable. Please try again.'
    });
  }
};
