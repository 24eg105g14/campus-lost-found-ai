const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      $or: [{ finderId: userId }, { claimantId: userId }]
    })
      .populate('foundItemId', 'itemName imageUrl category status postedBy')
      .populate('finderId', 'name batchYear departmentCode')
      .populate('claimantId', 'name batchYear departmentCode')
      .sort({ updatedAt: -1 });

    const formatted = [];

    for (const conv of conversations) {
      // Guard against deleted/null user or item records
      if (!conv.finderId || !conv.claimantId) {
        continue;
      }

      const lastMsg = await Message.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: userId },
        read: false
      });

      const finderIdStr = conv.finderId._id ? conv.finderId._id.toString() : conv.finderId.toString();
      const otherUser = finderIdStr === userId ? conv.claimantId : conv.finderId;

      formatted.push({
        _id: conv._id,
        foundItem: conv.foundItemId || { itemName: 'Found Item', imageUrl: '' },
        otherUser: {
          _id: otherUser ? (otherUser._id || otherUser) : null,
          name: (otherUser && otherUser.name) ? otherUser.name.split(' ')[0] : 'Student',
          dept: otherUser ? `${otherUser.departmentCode || ''} (Batch ${otherUser.batchYear || ''})` : 'Anurag Student'
        },
        lastMessage: lastMsg ? lastMsg.text : 'Conversation started',
        lastMessageTime: lastMsg ? lastMsg.createdAt : conv.createdAt,
        unreadCount
      });
    }

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error fetching conversations.' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId)
      .populate('foundItemId')
      .populate('finderId', 'name batchYear departmentCode')
      .populate('claimantId', 'name batchYear departmentCode');

    if (!conversation || !conversation.finderId || !conversation.claimantId) {
      return res.status(404).json({ message: 'Conversation or user records not found.' });
    }

    const finderIdStr = conversation.finderId._id ? conversation.finderId._id.toString() : conversation.finderId.toString();
    const claimantIdStr = conversation.claimantId._id ? conversation.claimantId._id.toString() : conversation.claimantId.toString();

    const isFinder = finderIdStr === userId;
    const isClaimant = claimantIdStr === userId;

    if (!isFinder && !isClaimant) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this private conversation.' });
    }

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, read: false },
      { read: true }
    );

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    const otherUser = isFinder ? conversation.claimantId : conversation.finderId;

    res.json({
      conversationId: conversation._id,
      foundItem: conversation.foundItemId || { itemName: 'Found Item', imageUrl: '' },
      otherUser: {
        _id: otherUser ? (otherUser._id || otherUser) : null,
        name: (otherUser && otherUser.name) ? otherUser.name.split(' ')[0] : 'Student',
        dept: otherUser ? `${otherUser.departmentCode || ''} (Batch ${otherUser.batchYear || ''})` : 'Anurag Student'
      },
      messages
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error fetching message history.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text cannot be empty.' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const finderIdStr = conversation.finderId.toString();
    const claimantIdStr = conversation.claimantId.toString();

    const isFinder = finderIdStr === userId;
    const isClaimant = claimantIdStr === userId;

    if (!isFinder && !isClaimant) {
      return res.status(403).json({ message: 'Forbidden: You cannot send messages in this conversation.' });
    }

    const message = new Message({
      conversationId,
      senderId: userId,
      text: text.trim(),
      read: false
    });

    await message.save();

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    // Send notification to recipient
    const recipientId = isFinder ? conversation.claimantId : conversation.finderId;
    const sender = await User.findById(userId);
    const senderName = sender ? sender.name.split(' ')[0] : 'Student';

    await Notification.create({
      userId: recipientId,
      type: 'NEW_MESSAGE',
      message: `💬 New message from ${senderName}: "${text.trim().substring(0, 40)}..."`,
      relatedItemId: conversation.foundItemId
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error sending message.' });
  }
};
