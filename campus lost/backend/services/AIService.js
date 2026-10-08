/**
 * AIService Abstraction
 * Fully optional AI capabilities. Automatically falls back to rule-based engine
 * if no AI API key is configured or if an AI API call fails.
 */

const VerificationService = require('./VerificationService');

class AIService {
  static isAIConfigured() {
    return Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim());
  }

  /**
   * Suggest verification questions for a found item
   */
  static async generateVerificationQuestions({ category, brand, itemName, description }) {
    // Standard rule-based category question suggestions
    const categoryTemplates = {
      Smartphone: [
        'What wallpaper/lock screen picture appears on the phone?',
        'What brand/color phone case is on the device?',
        'What sticker, scratch, or unique mark is on the back?'
      ],
      Laptop: [
        'What stickers or decals are stuck on the lid?',
        'What brand/color laptop sleeve or bag was it in?',
        'What is the lock screen wallpaper or user name?'
      ],
      Smartwatch: [
        'What watch face or wallpaper is set on the display?',
        'What color or material is the watch strap/band?',
        'Are there any specific engravings or scratches on the back?'
      ],
      Watch: [
        'What color and material is the strap/band?',
        'What color is the watch dial/face?',
        'Is there any custom engraving or scratch on the case?'
      ],
      Earphones: [
        'What color is the charging case or cover?',
        'What sticker, initials, or lanyard is attached to the case?',
        'Are there any custom markings or scratches?'
      ],
      Wallet: [
        'What specific ID, card, or picture is inside the wallet window?',
        'What approximate amount or denomination of cash is inside?',
        'What key or keychain is attached to the wallet zip?'
      ],
      Bag: [
        'What specific items or books were inside the main compartment?',
        'What keychain or badge is attached to the zipper?',
        'What brand, color, or pattern is on the inner lining?'
      ],
      'ID Card': [
        'What is the exact full name printed on the card?',
        'What is the branch/department printed on the card?',
        'What lanyard or card holder color/design was attached?'
      ]
    };

    const catKey = category || 'Other';
    const suggestions = categoryTemplates[catKey] || [
      'What unique scratch, mark, or sticker is on the item?',
      'What color or material details are only visible up close?',
      'What accessory or keychain is attached to it?'
    ];

    return {
      aiPowered: false,
      suggestions
    };
  }

  /**
   * Evaluates verification answers (calls VerificationService fallback or AI engine)
   */
  static async evaluateVerificationAnswers(expectedQuestions, submittedAnswers) {
    return VerificationService.evaluateAnswers(expectedQuestions, submittedAnswers);
  }

  /**
   * Generates readable match explanation summary
   */
  static generateMatchExplanation(score, reasons = []) {
    let explanation = '';
    if (score >= 80) {
      explanation = `High similarity match (${score}%). Strong correlation in ${reasons.join(', ')}.`;
    } else if (score >= 60) {
      explanation = `Possible match (${score}%). Matching fields include ${reasons.join(', ')}.`;
    } else {
      explanation = `Low similarity match (${score}%). Please verify details carefully.`;
    }
    return explanation;
  }
}

module.exports = AIService;
