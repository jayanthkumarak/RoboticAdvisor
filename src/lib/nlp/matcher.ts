import { Intention } from '@/components/ai/IntentionCard'
import { ALL_INTENTIONS } from '@/lib/intentions'

/**
 * Fuzzy string matching score (0-1)
 */
function fuzzyScore(needle: string, haystack: string): number {
  const needleLower = needle.toLowerCase()
  const haystackLower = haystack.toLowerCase()
  
  // Exact substring match = high score
  if (haystackLower.includes(needleLower)) {
    return 0.9
  }
  
  // Character-by-character fuzzy match
  let score = 0
  let needleIndex = 0
  
  for (let i = 0; i < haystackLower.length && needleIndex < needleLower.length; i++) {
    if (haystackLower[i] === needleLower[needleIndex]) {
      score++
      needleIndex++
    }
  }
  
  return needleIndex === needleLower.length 
    ? score / haystack.length 
    : 0
}

/**
 * Calculate relevance score for an intention given query
 */
function calculateRelevance(query: string, intention: Intention): number {
  const titleScore = fuzzyScore(query, intention.title)
  const descScore = fuzzyScore(query, intention.description)
  const categoryScore = fuzzyScore(query, intention.category)
  
  // Weighted average (title most important)
  return (titleScore * 0.6) + (descScore * 0.3) + (categoryScore * 0.1)
}

/**
 * Pattern-based keyword extraction
 */
const KEYWORD_PATTERNS = [
  { pattern: /\b(rebalance|drift|allocation|adjust)\b/i, category: 'portfolio' },
  { pattern: /\b(retire|retirement|corpus|pension)\b/i, category: 'retirement' },
  { pattern: /\b(goal|sip|funding|save|savings)\b/i, category: 'goals' },
  { pattern: /\b(tax|harvest|loss|deduction)\b/i, category: 'tax' },
  { pattern: /\b(project|forecast|predict|simulate|monte\s*carlo)\b/i, category: 'analysis' },
  { pattern: /\b(optimize|maximize|improve|increase)\b/i, boost: 0.2 },
  { pattern: /\b(success|probability|chance)\b/i, boost: 0.15 },
  { pattern: /\b(\d+)%\b/, boost: 0.1 }, // Contains percentage
]

/**
 * Boost score based on keyword patterns
 */
function applyKeywordBoost(query: string, intention: Intention, baseScore: number): number {
  let boosted = baseScore
  
  for (const { pattern, category, boost } of KEYWORD_PATTERNS) {
    if (pattern.test(query)) {
      if (category && intention.category === category) {
        boosted += 0.3 // Strong category match
      } else if (boost) {
        boosted += boost // General keyword boost
      }
    }
  }
  
  return Math.min(boosted, 1) // Cap at 1.0
}

/**
 * HIGH SIGNAL FILTER: Only return highly relevant suggestions
 */
const RELEVANCE_THRESHOLD = 0.35 // Must score above this to appear
const MAX_SUGGESTIONS = 5        // Show at most 5 suggestions

/**
 * Get intelligent suggestions for a query
 */
export function getIntelligentSuggestions(
  query: string,
  userContext?: {
    recentIntentions?: string[]
    portfolioState?: any
  }
): Intention[] {
  if (!query || query.trim().length < 2) {
    return []
  }

  const scoredIntentions = ALL_INTENTIONS.map(intention => {
    let score = calculateRelevance(query, intention)
    
    // Apply keyword boost
    score = applyKeywordBoost(query, intention, score)
    
    // Boost if recently used
    if (userContext?.recentIntentions?.includes(intention.id)) {
      score += 0.1
    }
    
    return { intention, score }
  })

  // Filter by threshold and sort by score
  const relevant = scoredIntentions
    .filter(({ score }) => score >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ intention }) => intention)

  return relevant
}

/**
 * Extract parameters from natural language query
 */
export function extractParameters(query: string): Record<string, any> {
  const params: Record<string, any> = {}
  
  // Extract age
  const ageMatch = query.match(/\b(?:age|at)\s*(\d{2})\b/i)
  if (ageMatch) {
    params.age = parseInt(ageMatch[1])
  }
  
  // Extract percentage
  const percentMatch = query.match(/\b(\d{1,3})%\b/)
  if (percentMatch) {
    params.percentage = parseInt(percentMatch[1])
  }
  
  // Extract amount
  const amountMatch = query.match(/₹\s*([\d,.]+)\s*([lkcrLKCR]+)?/i)
  if (amountMatch) {
    let amount = parseFloat(amountMatch[1].replace(/,/g, ''))
    const unit = amountMatch[2]?.toLowerCase()
    
    if (unit === 'l' || unit === 'lakh') amount *= 100000
    else if (unit === 'cr' || unit === 'crore') amount *= 10000000
    else if (unit === 'k') amount *= 1000
    
    params.amount = amount
  }
  
  // Extract years
  const yearsMatch = query.match(/\b(\d{1,2})\s*years?\b/i)
  if (yearsMatch) {
    params.years = parseInt(yearsMatch[1])
  }
  
  return params
}
