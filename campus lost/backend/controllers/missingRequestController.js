const MissingRequest = require('../models/MissingRequest');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const MatchingService = require('../services/MatchingService');

exports.createMissingRequest = async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      color,
      description,
      lastKnownLocation,
      approximateLostDate,
      additionalPrivateDetails
    } = req.body;

    if (!itemName || !category || !color || !description || !lastKnownLocation) {
      return res.status(400).json({ message: 'Item name, category, color, description, and location are required.' });
    }

    const missingRequest = new MissingRequest({
      userId: req.user.userId,
      itemName: itemName.trim(),
      category: category.trim(),
      brand: brand ? brand.trim() : '',
      color: color.trim(),
      description: description.trim(),
      lastKnownLocation: lastKnownLocation.trim(),
      approximateLostDate: approximateLostDate ? new Date(approximateLostDate) : new Date(),
      additionalPrivateDetails: additionalPrivateDetails ? additionalPrivateDetails.trim() : '',
      status: 'ACTIVE'
    });

    await missingRequest.save();

    // Two-way matching: Check all PENDING found items against this new missing request
    const pendingFoundItems = await FoundItem.find({ status: 'PENDING' });
    const matchesFound = [];

    for (const foundItem of pendingFoundItems) {
      const matchResult = MatchingService.calculateMatch(missingRequest, foundItem);
      if (matchResult.score >= 60) {
        const matchRecord = await Match.create({
          foundItemId: foundItem._id,
          missingRequestId: missingRequest._id,
          score: matchResult.score,
          confidence: matchResult.confidence,
          reasons: matchResult.reasons
        });

        matchesFound.push({
          matchId: matchRecord._id,
          foundItem: foundItem.toPublicJSON(),
          score: matchResult.score,
          confidence: matchResult.confidence,
          reasons: matchResult.reasons
        });

        // Notify user about match
        await Notification.create({
          userId: req.user.userId,
          type: 'POSSIBLE_MATCH',
          message: `🔍 Possible match (${matchResult.score}%) found for your missing ${missingRequest.itemName}!`,
          relatedItemId: foundItem._id
        });
      }
    }

    res.status(201).json({
      message: 'Missing request created successfully!',
      missingRequest,
      matches: matchesFound
    });
  } catch (err) {
    console.error('Error creating missing request:', err);
    res.status(500).json({ message: 'Server error creating missing request.' });
  }
};

exports.getMyMissingRequests = async (req, res) => {
  try {
    const requests = await MissingRequest.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching missing requests.' });
  }
};

exports.getMissingRequestById = async (req, res) => {
  try {
    const request = await MissingRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Missing request not found.' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching missing request.' });
  }
};

exports.getMatchesForMissingRequest = async (req, res) => {
  try {
    const matches = await Match.find({ missingRequestId: req.params.id })
      .populate('foundItemId')
      .sort({ score: -1 });

    const formattedMatches = matches.map(m => {
      let foundJson = null;
      if (m.foundItemId) {
        foundJson = m.foundItemId.toPublicJSON();
      }
      return {
        _id: m._id,
        foundItem: foundJson,
        score: m.score,
        confidence: m.confidence,
        reasons: m.reasons,
        createdAt: m.createdAt
      };
    });

    res.json(formattedMatches);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching matches.' });
  }
};

exports.deleteMissingRequest = async (req, res) => {
  try {
    const request = await MissingRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }
    if (request.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own requests.' });
    }
    await MissingRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Missing request removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting request.' });
  }
};
