/**
 * VerificationService
 * Securely evaluates claimant answers against secret verification answers provided by the finder.
 * Never returns expected secret answers to the client.
 */

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ');
}

class VerificationService {
  /**
   * Compare submitted answers against stored secret expected answers
   * @param {Array} expectedQuestions - [{ _id, question, answer }]
   * @param {Array} submittedAnswers - [{ questionId, question, answer }]
   */
  static evaluateAnswers(expectedQuestions, submittedAnswers) {
    if (!expectedQuestions || expectedQuestions.length === 0) {
      return { score: 100, confidence: 'HIGH', status: 'VERIFIED' };
    }

    let totalPoints = 0;
    const maxPointsPerQuestion = 100 / expectedQuestions.length;

    expectedQuestions.forEach((eq) => {
      const qId = eq._id ? eq._id.toString() : null;
      const matchingSubmitted = submittedAnswers.find(sa => 
        (sa.questionId && qId && sa.questionId.toString() === qId) ||
        (sa.question && eq.question && normalizeText(sa.question) === normalizeText(eq.question))
      );

      if (!matchingSubmitted || !matchingSubmitted.answer) {
        return;
      }

      const expectedNorm = normalizeText(eq.answer);
      const submittedNorm = normalizeText(matchingSubmitted.answer);

      if (expectedNorm === submittedNorm) {
        totalPoints += maxPointsPerQuestion;
      } else if (expectedNorm.includes(submittedNorm) || submittedNorm.includes(expectedNorm)) {
        // Partial match (e.g. expected "dark batman logo", submitted "batman")
        totalPoints += maxPointsPerQuestion * 0.8;
      } else {
        // Check word overlap for free-text answers
        const expectedWords = expectedNorm.split(' ');
        const submittedWords = submittedNorm.split(' ');
        let matchCount = 0;
        submittedWords.forEach(w => {
          if (w.length > 2 && expectedWords.includes(w)) matchCount++;
        });
        if (matchCount > 0) {
          totalPoints += maxPointsPerQuestion * 0.5;
        }
      }
    });

    const score = Math.min(100, Math.max(0, Math.round(totalPoints)));

    let status = 'REJECTED';
    let confidence = 'LOW';

    if (score >= 80) {
      status = 'VERIFIED';
      confidence = 'HIGH';
    } else if (score >= 60) {
      status = 'MANUAL_REVIEW';
      confidence = 'POSSIBLE';
    }

    return {
      score,
      confidence,
      status
    };
  }
}

module.exports = VerificationService;
