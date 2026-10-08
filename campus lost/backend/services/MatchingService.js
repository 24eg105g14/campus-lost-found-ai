/**
 * MatchingService
 * Smart score calculation engine (0-100) comparing lost item criteria vs found items.
 * Points breakdown:
 * - Category: 20
 * - Brand: 15
 * - Color: 10
 * - Location: 15
 * - Date proximity: 10
 * - Name/Description: 30
 */

function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ');
}

function extractKeywords(str) {
  const norm = normalizeString(str);
  if (!norm) return new Set();
  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'near', 'with', 'and', 'or', 'for', 'of', 'my', 'lost', 'found', 'is']);
  return new Set(
    norm.split(' ').filter(word => word.length > 1 && !stopWords.has(word))
  );
}

class MatchingService {
  static calculateMatch(lostItem, foundItem) {
    let score = 0;
    const reasons = [];

    // 1. Category (20 pts)
    const lostCat = normalizeString(lostItem.category);
    const foundCat = normalizeString(foundItem.category);
    if (lostCat && foundCat && lostCat === foundCat) {
      score += 20;
      reasons.push('Same category');
    }

    // 2. Brand (15 pts)
    const lostBrand = normalizeString(lostItem.brand);
    const foundBrand = normalizeString(foundItem.brand);
    if (lostBrand && foundBrand) {
      if (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
        score += 15;
        reasons.push('Same brand');
      }
    } else if (!lostBrand && !foundBrand) {
      score += 7; // Neutral allocation if brand not specified in either
    }

    // 3. Color (10 pts)
    const lostColor = normalizeString(lostItem.color);
    const foundColor = normalizeString(foundItem.color);
    if (lostColor && foundColor) {
      if (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
        score += 10;
        reasons.push('Same color');
      }
    }

    // 4. Location (15 pts)
    const lostLoc = normalizeString(lostItem.locationFound || lostItem.lastKnownLocation || lostItem.location);
    const foundLoc = normalizeString(foundItem.locationFound || foundItem.location);
    if (lostLoc && foundLoc) {
      if (lostLoc === foundLoc) {
        score += 15;
        reasons.push('Exact location match');
      } else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
        score += 10;
        reasons.push('Similar location');
      }
    }

    // 5. Date Proximity (10 pts)
    const lostDateStr = lostItem.dateFound || lostItem.approximateLostDate || lostItem.date;
    const foundDateStr = foundItem.dateFound || foundItem.date;
    if (lostDateStr && foundDateStr) {
      const d1 = new Date(lostDateStr).getTime();
      const d2 = new Date(foundDateStr).getTime();
      if (!isNaN(d1) && !isNaN(d2)) {
        const diffHours = Math.abs(d1 - d2) / (1000 * 60 * 60);
        if (diffHours <= 24) {
          score += 10;
          reasons.push('Same day');
        } else if (diffHours <= 72) {
          score += 7;
          reasons.push('Within 3 days');
        } else if (diffHours <= 168) {
          score += 4;
          reasons.push('Within 1 week');
        }
      }
    }

    // 6. Name / Description (30 pts)
    const lostText = `${lostItem.itemName || ''} ${lostItem.description || ''}`;
    const foundText = `${foundItem.itemName || ''} ${foundItem.description || ''}`;
    
    const lostKeywords = extractKeywords(lostText);
    const foundKeywords = extractKeywords(foundText);

    if (lostKeywords.size > 0 && foundKeywords.size > 0) {
      let matches = 0;
      lostKeywords.forEach(kw => {
        if (foundKeywords.has(kw)) matches++;
      });
      const ratio = matches / Math.min(lostKeywords.size, foundKeywords.size);
      const textScore = Math.round(ratio * 30);
      score += textScore;
      if (textScore >= 15) {
        reasons.push('Similar description');
      }
    }

    // Ensure within 0-100 range
    score = Math.min(100, Math.max(0, Math.round(score)));

    let confidence = 'LOW';
    if (score >= 80) {
      confidence = 'HIGH';
    } else if (score >= 60) {
      confidence = 'POSSIBLE';
    }

    return {
      score,
      confidence,
      reasons
    };
  }
}

module.exports = MatchingService;
