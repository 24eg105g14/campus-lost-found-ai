const FoundItem = require('../models/FoundItem');
const ClaimRequest = require('../models/ClaimRequest');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const VerificationService = require('../services/VerificationService');

exports.verifyClaim = async (req, res) => {
  try {
    const { foundItemId, answers } = req.body;
    const claimantId = req.user.userId;

    if (!foundItemId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Found item ID and array of answers are required.' });
    }

    const item = await FoundItem.findById(foundItemId);
    if (!item) {
      return res.status(404).json({ message: 'Found item not found.' });
    }

    // Prevent finder from claiming their own found item
    if (item.postedBy.toString() === claimantId) {
      return res.status(400).json({ message: 'You cannot claim an item that you posted.' });
    }

    // Find or create ClaimRequest for this user & item
    let claim = await ClaimRequest.findOne({ foundItemId, claimantId });

    if (claim) {
      if (claim.status === 'VERIFIED') {
        return res.status(400).json({ message: 'Ownership already verified for this item!' });
      }
      if (claim.attempts >= 3) {
        return res.status(403).json({
          message: 'Maximum verification attempts (3) reached. You can request manual finder review.',
          attemptsRemaining: 0,
          maxAttemptsReached: true
        });
      }
      claim.attempts += 1;
    } else {
      claim = new ClaimRequest({
        foundItemId,
        claimantId,
        attempts: 1,
        status: 'PENDING_VERIFICATION'
      });
    }

    // Evaluate answers
    const evalResult = VerificationService.evaluateAnswers(item.verificationQuestions, answers);

    claim.verificationScore = evalResult.score;
    claim.confidence = evalResult.confidence;
    claim.submittedAnswers = answers;

    if (evalResult.score >= 80) {
      claim.status = 'VERIFIED';
      await claim.save();

      // Automatically create / unlock Conversation
      let conversation = await Conversation.findOne({
        foundItemId: item._id,
        claimantId: claimantId
      });

      if (!conversation) {
        conversation = await Conversation.create({
          foundItemId: item._id,
          claimRequestId: claim._id,
          finderId: item.postedBy,
          claimantId: claimantId
        });
      }

      // Notify Claimant
      await Notification.create({
        userId: claimantId,
        type: 'VERIFICATION_SUCCESS',
        message: `🎉 Ownership verified (Score: ${evalResult.score}%)! Private chat unlocked with finder.`,
        relatedItemId: item._id
      });

      // Notify Finder
      await Notification.create({
        userId: item.postedBy,
        type: 'CLAIM_APPROVED',
        message: `✅ A claimant successfully verified ownership of your found ${item.itemName}!`,
        relatedItemId: item._id
      });

      return res.json({
        verified: true,
        score: evalResult.score,
        confidence: evalResult.confidence,
        status: 'VERIFIED',
        message: 'Ownership verified! Chat unlocked.',
        conversationId: conversation._id,
        claim
      });

    } else if (evalResult.score >= 60) {
      claim.status = 'MANUAL_REVIEW';
      await claim.save();

      // Notify Finder about manual review request
      await Notification.create({
        userId: item.postedBy,
        type: 'CLAIM_REQUEST',
        message: `📋 Claim request (${evalResult.score}% match) requires your manual review for ${item.itemName}.`,
        relatedItemId: item._id
      });

      return res.json({
        verified: false,
        score: evalResult.score,
        confidence: evalResult.confidence,
        status: 'MANUAL_REVIEW',
        message: 'Verification score is uncertain. Sent for manual finder review.',
        attemptsRemaining: 3 - claim.attempts,
        claim
      });

    } else {
      // Score < 60
      if (claim.attempts >= 3) {
        claim.status = 'REJECTED';
      }
      await claim.save();

      await Notification.create({
        userId: claimantId,
        type: 'VERIFICATION_FAILED',
        message: `❌ Verification failed (${evalResult.score}%). ${3 - claim.attempts} attempts remaining.`,
        relatedItemId: item._id
      });

      return res.json({
        verified: false,
        score: evalResult.score,
        confidence: evalResult.confidence,
        status: claim.status,
        message: 'Provided details do not match the expected secret details.',
        attemptsRemaining: 3 - claim.attempts,
        claim
      });
    }

  } catch (err) {
    console.error('Error during claim verification:', err);
    res.status(500).json({ message: 'Server error verifying claim.' });
  }
};

exports.requestManualReview = async (req, res) => {
  try {
    const { foundItemId } = req.body;
    const claimantId = req.user.userId;

    const item = await FoundItem.findById(foundItemId);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    let claim = await ClaimRequest.findOne({ foundItemId, claimantId });
    if (!claim) {
      claim = new ClaimRequest({
        foundItemId,
        claimantId,
        attempts: 1,
        status: 'MANUAL_REVIEW'
      });
    } else {
      claim.status = 'MANUAL_REVIEW';
    }

    await claim.save();

    await Notification.create({
      userId: item.postedBy,
      type: 'CLAIM_REQUEST',
      message: `📋 A student requested manual verification review for your found ${item.itemName}.`,
      relatedItemId: item._id
    });

    res.json({ message: 'Manual review request sent to finder.', claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error requesting manual review.' });
  }
};

exports.approveClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await ClaimRequest.findById(claimId).populate('foundItemId');

    if (!claim) return res.status(404).json({ message: 'Claim request not found.' });

    // Authorization: only finder can approve
    if (claim.foundItemId.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: Only the finder can approve claims.' });
    }

    claim.status = 'VERIFIED';
    await claim.save();

    // Create / unlock conversation
    let conversation = await Conversation.findOne({
      foundItemId: claim.foundItemId._id,
      claimantId: claim.claimantId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        foundItemId: claim.foundItemId._id,
        claimRequestId: claim._id,
        finderId: req.user.userId,
        claimantId: claim.claimantId
      });
    }

    // Notify claimant
    await Notification.create({
      userId: claim.claimantId,
      type: 'CLAIM_APPROVED',
      message: `🎉 Finder approved your claim for ${claim.foundItemId.itemName}! Private chat is now unlocked.`,
      relatedItemId: claim.foundItemId._id
    });

    res.json({ message: 'Claim approved! Chat unlocked.', conversationId: conversation._id, claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error approving claim.' });
  }
};

exports.rejectClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await ClaimRequest.findById(claimId).populate('foundItemId');

    if (!claim) return res.status(404).json({ message: 'Claim request not found.' });

    if (claim.foundItemId.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: Only the finder can reject claims.' });
    }

    claim.status = 'REJECTED';
    await claim.save();

    await Notification.create({
      userId: claim.claimantId,
      type: 'CLAIM_REJECTED',
      message: `❌ Finder rejected the claim request for ${claim.foundItemId.itemName}.`,
      relatedItemId: claim.foundItemId._id
    });

    res.json({ message: 'Claim rejected.', claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error rejecting claim.' });
  }
};

exports.getClaimStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const claim = await ClaimRequest.findOne({ foundItemId: itemId, claimantId: req.user.userId });
    if (!claim) {
      return res.json({ status: 'NONE', attempts: 0 });
    }

    let conversationId = null;
    if (claim.status === 'VERIFIED') {
      const conv = await Conversation.findOne({ foundItemId: itemId, claimantId: req.user.userId });
      if (conv) conversationId = conv._id;
    }

    res.json({
      status: claim.status,
      attempts: claim.attempts,
      score: claim.verificationScore,
      conversationId,
      claim
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error checking claim status.' });
  }
};

exports.getFinderClaimRequests = async (req, res) => {
  try {
    const myFoundItems = await FoundItem.find({ postedBy: req.user.userId }).select('_id');
    const itemIds = myFoundItems.map(item => item._id);

    const claims = await ClaimRequest.find({ foundItemId: { $in: itemIds } })
      .populate('foundItemId')
      .populate('claimantId', 'name email batchYear departmentCode section rollNumber')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching claim requests.' });
  }
};
