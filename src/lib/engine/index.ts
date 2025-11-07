/**
 * Financial Planning Engine - Public API
 * 
 * This is the main entry point for all financial calculations.
 * All functions are pure and side-effect free.
 */

// Assumptions
export { getAssumptions, getLatestAssumptions, listAvailableAssumptions } from './assumptions/loader'
export { INDIA_2024_Q4 } from './assumptions/india-2024'
export type { MarketAssumptions, AssetClassParams, MarketRegime, InflationParams } from './assumptions/types'

// Math Utilities
export {
  futureValue,
  presentValue,
  futureValueAnnuity,
  presentValueAnnuity,
  requiredSIP,
  nominalToReal,
  realToNominal,
  cagr
} from './math/compound'

export {
  mean,
  median,
  standardDeviation,
  percentile,
  correlation,
  min,
  max,
  sum
} from './math/statistics'

export { SeededRandom, generateNormals } from './math/random'

// Projection
export { projectDeterministic } from './projection/deterministic'
export { validateInputs, sanitizeInputs } from './projection/validation'
export type { ProjectionInputs, YearlyProjection, ProjectionResult } from './projection/types'

// Monte Carlo
export { runMonteCarlo } from './simulation/montecarlo'
export type { MonteCarloConfig, MonteCarloResult, SimulationPath } from './simulation/types'

// Goals
export { allocateGoalBudget } from './goals/optimizer'
export type { GoalInput, GoalAllocation, GoalAllocationResult } from './goals/types'

// Rebalancing
export { generateRebalancingTrades, calculateDrift, needsRebalancing } from './rebalancing/rebalancer'
export type { Portfolio, Trade, RebalancingResult, RebalancingConfig } from './rebalancing/types'

// Adapters (UI Integration)
export {
  handleRetirementOptimization,
  handlePortfolioProjection,
  handleMonteCarloRetirement,
  handleGoalFunding,
  handleRebalancing
} from './adapters/intentionHandlers'
export type { IntentionResult } from './adapters/intentionHandlers'
