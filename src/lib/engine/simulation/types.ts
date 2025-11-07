import { YearlyProjection } from '../projection/types'

export interface MonteCarloConfig {
  numSimulations: number           // 1,000 - 10,000
  seed?: number                    // For reproducibility
  timeStep: 'monthly' | 'annual'   // Monthly for precision, annual for speed
  includeRegimeSwitching?: boolean // Default: false for Phase 1
}

export interface MonteCarloResult {
  // Probability metrics
  successProbability: number       // % of sims that don't deplete
  medianOutcome: number            // 50th percentile terminal value
  
  // Percentile paths
  percentiles: {
    p10: YearlyProjection[]        // Worst 10%
    p25: YearlyProjection[]
    p50: YearlyProjection[]        // Median
    p75: YearlyProjection[]
    p90: YearlyProjection[]        // Best 10%
  }
  
  // Distribution stats
  terminalValueDistribution: {
    mean: number
    median: number
    std: number
    values: number[]               // All terminal values for histogram
  }
  
  // Risk metrics
  shortfallRisk: {
    probability: number            // % chance of running out
    averageShortfall: number       // Avg $ shortfall in failure cases
    worstCase: number              // 1st percentile outcome
  }
}

export interface SimulationPath {
  id: number
  timeline: YearlyProjection[]
  terminalValue: number
  depletedAt?: number             // Year of depletion, if any
}
