/**
 * Anurag University Email Validation & Parser Utility
 * Expected format: YYegDDDCRR@anurag.edu.in
 * Example: 24eg112c54@anurag.edu.in
 */

const ANURAG_EMAIL_REGEX = /^(\d{2})eg(\d{3})([a-z])(\d{2})@anurag\.edu\.in$/i;

function validateAnuragEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return ANURAG_EMAIL_REGEX.test(email.trim());
}

function parseAnuragEmail(email) {
  if (!validateAnuragEmail(email)) {
    throw new Error('Invalid Anurag University email format. Expected format: YYegDDDCRR@anurag.edu.in');
  }

  const match = email.trim().toLowerCase().match(ANURAG_EMAIL_REGEX);
  if (!match) {
    throw new Error('Could not parse institutional email details');
  }

  return {
    batchYear: match[1],
    departmentCode: match[2],
    section: match[3],
    rollNumber: match[4]
  };
}

module.exports = {
  ANURAG_EMAIL_REGEX,
  validateAnuragEmail,
  parseAnuragEmail
};
