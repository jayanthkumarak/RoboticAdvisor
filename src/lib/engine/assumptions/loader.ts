import { MarketAssumptions } from './types'
import { INDIA_2024_Q4 } from './india-2024'

/**
 * Assumption Loader Factory
 * 
 * Provides versioned access to market assumptions.
 * Future: Could load from API, database, or user overrides.
 */

const ASSUMPTIONS_REGISTRY: Record<string, MarketAssumptions> = {
  'IN-2024-Q4': INDIA_2024_Q4,
  // Add more as needed: 'US-2024-Q4', 'IN-2025-Q1', etc.
}

export class AssumptionNotFoundError extends Error {
  constructor(region: string, version: string) {
    super(`Assumptions not found for region=${region}, version=${version}`)
    this.name = 'AssumptionNotFoundError'
  }
}

/**
 * Get market assumptions by region and version
 * 
 * @param region - Market region (e.g., 'IN', 'US')
 * @param version - Version identifier (e.g., '2024-Q4')
 * @returns Calibrated market assumptions
 * @throws AssumptionNotFoundError if not found
 */
export function getAssumptions(
  region: string,
  version: string = '2024-Q4'
): MarketAssumptions {
  const key = `${region}-${version}`
  
  if (!(key in ASSUMPTIONS_REGISTRY)) {
    throw new AssumptionNotFoundError(region, version)
  }
  
  return ASSUMPTIONS_REGISTRY[key]
}

/**
 * Get latest assumptions for a region
 */
export function getLatestAssumptions(region: string): MarketAssumptions {
  // For now, hardcode to 2024-Q4
  // Future: Query registry for max version
  return getAssumptions(region, '2024-Q4')
}

/**
 * List all available assumption sets
 */
export function listAvailableAssumptions(): { region: string; version: string }[] {
  return Object.keys(ASSUMPTIONS_REGISTRY).map(key => {
    const [region, ...versionParts] = key.split('-')
    return { region, version: versionParts.join('-') }
  })
}
