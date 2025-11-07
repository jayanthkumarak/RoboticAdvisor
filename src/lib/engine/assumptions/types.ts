/**
 * Core type definitions for market assumptions.
 * 
 * These types define the shape of ALL financial assumptions used by the engine.
 * Zero business logic here - just interfaces.
 */

export interface MarketAssumptions {
  /** Version identifier for auditability (e.g., "2024-Q4") */
  version: string
  
  /** Effective date for these assumptions */
  effectiveDate: Date
  
  /** Market region */
  region: 'IN' | 'US' | 'EU' | 'GLOBAL'
  
  /** Asset class parameters indexed by asset ID */
  assetClasses: Record<string, AssetClassParams>
  
  /** Correlation matrix (n×n where n = number of assets) */
  correlationMatrix: number[][]
  
  /** Market regime definitions */
  regimes: MarketRegime[]
  
  /** Inflation parameters */
  inflation: InflationParams
}

export interface AssetClassParams {
  id: string
  label: string
  category: 'equity' | 'debt' | 'commodity' | 'alternative' | 'cash'
  
  /** Expected return distribution (annualized %) */
  nominalReturn: {
    mean: number          // Arithmetic mean
    volatility: number    // Standard deviation
  }
  
  /** Real return (after inflation) */
  realReturn: {
    mean: number
    volatility: number
  }
  
  /** Trading costs (basis points) */
  tradingCost: number
}

export interface MarketRegime {
  id: 'normal' | 'bear' | 'bull' | 'crisis' | 'stagflation'
  
  /** Long-run probability of being in this regime */
  probability: number
  
  /** Average duration in years */
  duration: {
    mean: number
    volatility: number
  }
  
  /** Asset class return/vol multipliers during this regime */
  assetClassMultipliers: Record<string, {
    returnMultiplier: number
    volatilityMultiplier: number
  }>
}

export interface InflationParams {
  /** Long-run average inflation rate (%) */
  mean: number
  
  /** Year-to-year volatility (%) */
  volatility: number
  
  /** Persistence parameter (AR(1) coefficient, 0-1) */
  persistence: number
  
  /** Regime-specific adjustments */
  regimeAdjustments?: Record<string, number>
}
