export interface Portfolio {
  [assetId: string]: number  // Current value per asset
}

export interface Trade {
  asset: string
  action: 'BUY' | 'SELL'
  amount: number
  currentValue: number
  targetValue: number
}

export interface RebalancingResult {
  needsRebalancing: boolean
  drifts: Record<string, number>        // Percentage drift per asset
  maxDrift: number
  trades: Trade[]
  estimatedCost: number                 // Trading costs
  impactOnReturn: number                // Expected impact (bps)
}

export interface RebalancingConfig {
  driftThreshold: number                // % (e.g., 5 = rebalance if >5% drift)
  minimumTradeAmount?: number           // Don't trade tiny amounts
  tradingCostBps?: number              // Override assumption costs
}
