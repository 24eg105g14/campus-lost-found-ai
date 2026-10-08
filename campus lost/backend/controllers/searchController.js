const FoundItem = require('../models/FoundItem');
const MatchingService = require('../services/MatchingService');

exports.searchAndMatch = async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      color,
      description,
      location,
      date,
      includeDelivered
    } = req.query;

    const filter = {};
    if (!includeDelivered || includeDelivered === 'false') {
      filter.status = 'PENDING';
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    const foundItems = await FoundItem.find(filter)
      .populate('postedBy', 'name batchYear departmentCode section');

    const searchCriteria = {
      itemName: itemName || '',
      category: category || '',
      brand: brand || '',
      color: color || '',
      description: description || '',
      locationFound: location || '',
      dateFound: date || ''
    };

    const results = foundItems.map(item => {
      const matchCalc = MatchingService.calculateMatch(searchCriteria, item);
      const publicItem = item.toPublicJSON();
      if (item.postedBy) {
        publicItem.finderName = item.postedBy.name ? item.postedBy.name.split(' ')[0] : 'Finder';
        delete publicItem.postedBy;
      }

      return {
        ...publicItem,
        matchScore: matchCalc.score,
        confidence: matchCalc.confidence,
        reasons: matchCalc.reasons
      };
    });

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      totalCount: results.length,
      highMatchesCount: results.filter(r => r.confidence === 'HIGH').length,
      results
    });
  } catch (err) {
    console.error('Error during search & match:', err);
    res.status(500).json({ message: 'Server error performing search.' });
  }
};
