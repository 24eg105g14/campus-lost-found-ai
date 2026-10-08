const FoundItem = require('../models/FoundItem');
const MissingRequest = require('../models/MissingRequest');
const Notification = require('../models/Notification');
const Match = require('../models/Match');
const ImageUploadService = require('../services/ImageUploadService');
const MatchingService = require('../services/MatchingService');

exports.createFoundItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      color,
      description,
      locationFound,
      dateFound,
      verificationQuestions
    } = req.body;

    if (!itemName || !category || !color || !description || !locationFound) {
      return res.status(400).json({ message: 'Item name, category, color, description, and location found are required.' });
    }

    let parsedQuestions = [];
    if (typeof verificationQuestions === 'string') {
      try {
        parsedQuestions = JSON.parse(verificationQuestions);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid verification questions JSON string.' });
      }
    } else if (Array.isArray(verificationQuestions)) {
      parsedQuestions = verificationQuestions;
    }

    if (!parsedQuestions || parsedQuestions.length === 0) {
      return res.status(400).json({ message: 'At least one verification question with an expected secret answer is required.' });
    }

    // Upload image using ImageUploadService
    let imageBuffer = req.file ? req.file.buffer : null;
    const uploadResult = await ImageUploadService.uploadImage(
      imageBuffer,
      'lostlink_found_items',
      req.body.imageUrl
    );

    const foundItem = new FoundItem({
      postedBy: req.user.userId,
      imageUrl: uploadResult.imageUrl,
      imagePublicId: uploadResult.imagePublicId,
      itemName: itemName.trim(),
      category: category.trim(),
      brand: brand ? brand.trim() : '',
      color: color.trim(),
      description: description.trim(),
      locationFound: locationFound.trim(),
      dateFound: dateFound ? new Date(dateFound) : new Date(),
      status: 'PENDING',
      verificationQuestions: parsedQuestions.map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim()
      }))
    });

    await foundItem.save();

    // Two-way matching: Check active missing requests against this new found item
    const activeMissing = await MissingRequest.find({ status: 'ACTIVE' });
    for (const missing of activeMissing) {
      const matchResult = MatchingService.calculateMatch(missing, foundItem);
      if (matchResult.score >= 60) {
        await Match.create({
          foundItemId: foundItem._id,
          missingRequestId: missing._id,
          score: matchResult.score,
          confidence: matchResult.confidence,
          reasons: matchResult.reasons
        });

        // Send notification to the student who reported missing item
        await Notification.create({
          userId: missing.userId,
          type: 'POSSIBLE_MATCH',
          message: `🔍 Possible match (${matchResult.score}%) found for your missing ${missing.itemName}!`,
          relatedItemId: foundItem._id
        });
      }
    }

    res.status(201).json({
      message: 'Found item reported successfully!',
      foundItem: foundItem.toPublicJSON()
    });
  } catch (err) {
    console.error('Error creating found item:', err);
    res.status(500).json({ message: err.message || 'Server error creating found item.' });
  }
};

exports.getFoundItems = async (req, res) => {
  try {
    const { category, status, search, location, sort } = req.query;

    const filter = {};
    // Default to PENDING items unless explicitly requested otherwise
    filter.status = status ? status : 'PENDING';

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (location) {
      filter.locationFound = { $regex: location, $options: 'i' };
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { itemName: regex },
        { brand: regex },
        { color: regex },
        { description: regex },
        { locationFound: regex }
      ];
    }

    let sortOption = { createdAt: -1 }; // Newest first by default
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const items = await FoundItem.find(filter)
      .populate('postedBy', 'name email batchYear departmentCode section rollNumber')
      .sort(sortOption);

    const publicItems = items.map(item => {
      const json = item.toPublicJSON();
      // Ensure finder identity is sanitized (only first name / public details)
      if (item.postedBy) {
        json.finderName = item.postedBy.name ? item.postedBy.name.split(' ')[0] : 'Finder';
        delete json.postedBy;
      }
      return json;
    });

    res.json(publicItems);
  } catch (err) {
    console.error('Error fetching found items:', err);
    res.status(500).json({ message: 'Server error fetching found items.' });
  }
};

exports.getMyFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find({ postedBy: req.user.userId }).sort({ createdAt: -1 });
    const publicItems = items.map(item => item.toPublicJSON());
    res.json(publicItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching your posts.' });
  }
};

exports.getFoundItemById = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('postedBy', 'name batchYear departmentCode section');

    if (!item) {
      return res.status(404).json({ message: 'Found item not found.' });
    }

    const json = item.toPublicJSON();
    if (item.postedBy) {
      json.finderName = item.postedBy.name ? item.postedBy.name.split(' ')[0] : 'Finder';
      json.finderDept = `${item.postedBy.departmentCode || ''} (Batch ${item.postedBy.batchYear || ''})`;
      // Never expose contact info or full details
      delete json.postedBy;
    }

    res.json(json);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching item details.' });
  }
};

exports.updateFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Critical authorization check: only owner can edit
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own posts.' });
    }

    const { itemName, category, brand, color, description, locationFound } = req.body;
    if (itemName) item.itemName = itemName.trim();
    if (category) item.category = category.trim();
    if (brand !== undefined) item.brand = brand.trim();
    if (color) item.color = color.trim();
    if (description) item.description = description.trim();
    if (locationFound) item.locationFound = locationFound.trim();

    await item.save();
    res.json({ message: 'Found item updated successfully.', item: item.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating item.' });
  }
};

exports.deleteFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own posts.' });
    }

    // Remove Cloudinary image
    if (item.imagePublicId) {
      await ImageUploadService.deleteImage(item.imagePublicId);
    }

    await FoundItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Found item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting item.' });
  }
};

exports.markDelivered = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Critical authorization check: only finder can mark delivered
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: Only the finder can mark an item as delivered.' });
    }

    item.status = 'DELIVERED';
    item.deliveredAt = new Date();
    await item.save();

    res.json({
      message: 'Item status updated to DELIVERED!',
      item: item.toPublicJSON()
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error marking item delivered.' });
  }
};
