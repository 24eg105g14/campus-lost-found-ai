const Groq = require('groq-sdk');
const FoundItem = require('../models/FoundItem');
const MatchingService = require('./MatchingService');

const SEARCH_FIELDS = ['category', 'itemName', 'brand', 'model', 'color', 'location', 'date', 'timeHint', 'description'];
const CATEGORIES = [
  'Smartphone', 'Laptop', 'Smartwatch', 'Watch', 'Earphones', 'ID Card', 'Wallet',
  'Keys', 'Bag', 'Books', 'Documents', 'Accessories', 'Clothing', 'Other'
];

const responseSchema = {
  name: 'lostlink_item_search',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['extracted', 'clearedFields', 'unknownFields', 'missingImportantFields', 'nextQuestion', 'readyToSearch'],
    properties: {
      extracted: {
        type: 'object',
        additionalProperties: false,
        required: SEARCH_FIELDS,
        properties: Object.fromEntries(SEARCH_FIELDS.map((field) => [field, { type: ['string', 'null'] }]))
      },
      clearedFields: { type: 'array', items: { type: 'string', enum: SEARCH_FIELDS } },
      unknownFields: { type: 'array', items: { type: 'string', enum: SEARCH_FIELDS } },
      missingImportantFields: { type: 'array', items: { type: 'string', enum: SEARCH_FIELDS } },
      nextQuestion: { type: ['string', 'null'] },
      readyToSearch: { type: 'boolean' }
    }
  }
};

function cleanString(value, maxLength = 240) {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return clean ? clean.slice(0, maxLength) : null;
}

function canonicalCategory(value) {
  const clean = cleanString(value, 40);
  if (!clean) return null;
  return CATEGORIES.find((category) => category.toLowerCase() === clean.toLowerCase()) || clean;
}

function sanitizeState(input = {}) {
  const state = {};
  for (const field of SEARCH_FIELDS) {
    const value = field === 'category' ? canonicalCategory(input[field]) : cleanString(input[field]);
    if (value) state[field] = value;
  }
  return state;
}

function sanitizeFieldList(input) {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((field) => SEARCH_FIELDS.includes(field)))];
}

function mergeState(previousState, extracted, clearedFields) {
  const merged = sanitizeState(previousState);
  sanitizeFieldList(clearedFields).forEach((field) => delete merged[field]);
  const cleanExtracted = sanitizeState(extracted);
  return { ...merged, ...cleanExtracted };
}

function isMeaningfulSearch(state, questionCount) {
  const identity = Boolean(state.category || state.itemName);
  const discriminators = ['brand', 'model', 'color', 'location', 'date', 'description']
    .filter((field) => Boolean(state[field])).length;
  return identity && (discriminators >= 2 || (questionCount >= 4 && discriminators >= 1) || questionCount >= 5);
}

function discriminatorCount(state) {
  return ['brand', 'model', 'color', 'location', 'date', 'description']
    .filter((field) => Boolean(state[field])).length;
}

async function findMatches(state) {
  const foundItems = await FoundItem.find({ status: 'PENDING' })
    .populate('postedBy', 'name batchYear departmentCode section');

  const description = [state.model, state.timeHint, state.description].filter(Boolean).join(' ');
  const criteria = {
    itemName: state.itemName || state.category || '',
    category: state.category || '',
    brand: state.brand || '',
    color: state.color || '',
    description,
    locationFound: state.location || '',
    dateFound: state.date || ''
  };

  return foundItems
    .map((item) => {
      const match = MatchingService.calculateMatch(criteria, item);
      const publicItem = item.toPublicJSON();
      delete publicItem.verificationQuestions;
      if (item.postedBy) {
        publicItem.finderName = item.postedBy.name ? item.postedBy.name.split(' ')[0] : 'Finder';
        delete publicItem.postedBy;
      }
      return { ...publicItem, matchScore: match.score, confidence: match.confidence, reasons: match.reasons };
    })
    .filter((item) => item.matchScore >= 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 12);
}

class ConversationalSearchService {
  static validateRequest(body = {}) {
    const message = cleanString(body.message, 1000);
    if (!message) {
      const error = new Error('Please describe the item you lost.');
      error.status = 400;
      throw error;
    }
    return {
      message,
      searchState: sanitizeState(body.searchState),
      unknownFields: sanitizeFieldList(body.unknownFields),
      questionCount: Math.min(5, Math.max(0, Number.parseInt(body.questionCount, 10) || 0)),
      conversationContext: Array.isArray(body.conversationContext)
        ? body.conversationContext.slice(-8).map((entry) => ({
            role: entry?.role === 'assistant' ? 'assistant' : 'user',
            content: cleanString(entry?.content, 500)
          })).filter((entry) => entry.content)
        : []
    };
  }

  static async process(rawBody) {
    const input = this.validateRequest(rawBody);
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      const error = new Error('AI search is temporarily unavailable. You can use manual search instead.');
      error.status = 503;
      throw error;
    }

    const client = new Groq({ apiKey, timeout: 15000, maxRetries: 1 });
    const today = new Date().toISOString().slice(0, 10);
    const systemPrompt = `You are the LostLink Item Search Assistant for a university lost-and-found platform.
Extract searchable attributes from the student's latest message while respecting the accumulated state.
Never invent values. Preserve existing values unless the user corrects them. Put explicitly corrected unknown/removed fields in clearedFields. Put fields the user says they do not know in unknownFields and never ask for those again.
Ask exactly one concise useful follow-up question at a time, chosen for this item type. Never repeat known or unknown fields. Usually finish in 2-5 questions. If category/item identity and at least two useful discriminators are known, set readyToSearch=true and nextQuestion=null.
Normalize category to one of: ${CATEGORIES.join(', ')}. Resolve relative dates to YYYY-MM-DD using today=${today}. Keep time words such as afternoon in timeHint.
Never request, infer, mention, or reveal ownership-verification secrets. Return only the required structured object.`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          ...input.conversationContext,
          {
            role: 'user',
            content: JSON.stringify({
              latestMessage: input.message,
              accumulatedSearchState: input.searchState,
              fieldsUserDoesNotKnow: input.unknownFields,
              followUpQuestionsAlreadyAsked: input.questionCount
            })
          }
        ],
        response_format: { type: 'json_schema', json_schema: responseSchema },
        temperature: 0.1,
        max_completion_tokens: 700
      });
    } catch (error) {
      const wrapped = new Error(error?.status === 429
        ? 'AI search is busy right now. Please wait a moment and try again.'
        : 'AI search is temporarily unavailable. Please try again or use manual search.');
      wrapped.status = error?.status === 429 ? 429 : 503;
      throw wrapped;
    }

    let parsed;
    try {
      parsed = JSON.parse(completion.choices?.[0]?.message?.content || '');
    } catch {
      const error = new Error('AI search returned an invalid response. Please try again.');
      error.status = 502;
      throw error;
    }

    if (!parsed?.extracted || !Array.isArray(parsed.missingImportantFields)) {
      const error = new Error('AI search returned an invalid response. Please try again.');
      error.status = 502;
      throw error;
    }

    const searchState = mergeState(input.searchState, parsed.extracted, parsed.clearedFields);
    const unknownFields = [...new Set([...input.unknownFields, ...sanitizeFieldList(parsed.unknownFields)])]
      .filter((field) => !searchState[field]);
    const meaningful = isMeaningfulSearch(searchState, input.questionCount);
    const readyToSearch = meaningful && (
      Boolean(parsed.readyToSearch) || discriminatorCount(searchState) >= 3 || input.questionCount >= 4
    );
    const results = readyToSearch ? await findMatches(searchState) : [];

    return {
      searchState,
      unknownFields,
      missingImportantFields: sanitizeFieldList(parsed.missingImportantFields).filter((field) => !unknownFields.includes(field)),
      nextQuestion: readyToSearch ? null : cleanString(parsed.nextQuestion, 240),
      readyToSearch,
      totalCount: results.length,
      highMatchesCount: results.filter((item) => item.confidence === 'HIGH').length,
      results
    };
  }
}

module.exports = ConversationalSearchService;
module.exports._test = { sanitizeState, mergeState, isMeaningfulSearch, discriminatorCount, sanitizeFieldList };
