import { MarketAssumptions } from '../assumptions/types'
import { Portfolio, Trade, RebalancingResult, RebalancingConfig } from './types'

/**
 * Generate rebalancing trades to restore target allocation
 * 
 * Analyzes portfolio drift and creates trade list to bring allocation back to target
 */
export function generateRebalancingTrades(
  currentHoldings: Portfolio,
  targetAllocation: Record<string, number>,  // Percentages
  assumptions: MarketAssumptions,
  config: RebalancingConfig = { driftThreshold: 5 }
): RebalancingResult {
  
  const totalValue = Object.values(currentHoldings).reduce((sum, v) => sum + v, 0)
  
  if (totalValue === 0) {
    return {
      needsRebalancing: false,
      drifts: {},
      maxDrift: 0,
      trades: [],
      estimatedCost: 0,
      impactOnReturn: 0
    }
  }
  
  // 1. Calculate current percentages
  const currentPercentages: Record<string, number> = {}
  for (const [asset, value] of Object.entries(currentHoldings)) {
    currentPercentages[asset] = (value / totalValue) * 100
  }
  
  // 2. Calculate drifts
  const drifts: Record<string, number> = {}
  for (const [asset, target] of Object.entries(targetAllocation)) {
    const current = currentPercentages[asset] || 0
    drifts[asset] = current - target
  }
  
  const maxDrift = Math.max(...Object.values(drifts).map(Math.abs))
  
  // 3. Check if rebalancing needed
  if (maxDrift < config.driftThreshold) {
    return {
      needsRebalancing: false,
      drifts,
      maxDrift,
      trades: [],
      estimatedCost: 0,
      impactOnReturn: 0
    }
  }
  
  // 4. Generate trades
  const trades: Trade[] = []
  const minimumTrade = config.minimumTradeAmount || 10000  // ₹10k minimum
  
  for (const [asset, drift] of Object.entries(drifts)) {
    if (Math.abs(drift) > 1) {  // Only trade if > 1% off
      const targetValue = (targetAllocation[asset] / 100) * totalValue
      const currentValue = currentHoldings[asset] || 0
      const tradeAmount = targetValue - currentValue
      
      if (Math.abs(tradeAmount) >= minimumTrade) {
        trades.push({
          asset,
          action: tradeAmount > 0 ? 'BUY' : 'SELL',
          amount: Math.abs(tradeAmount),
          currentValue,
          targetValue
        })
      }
    }
  }
  
  // 5. Calculate trading costs
  const estimatedCost = trades.reduce((total, trade) => {
    const assetParams = assumptions.assetClasses[trade.asset]
    const tradingCostBps = config.tradingCostBps || assetParams?.tradingCost || 10
    return total + (trade.amount * tradingCostBps / 10000)
  }, 0)
  
  // 6. Estimate impact on return
  const impactOnReturn = (estimatedCost / totalValue) * 10000  // In basis points
  
  return {
    needsRebalancing: true,
    drifts,
    maxDrift,
    trades,
    estimatedCost,
    impactOnReturn
  }
}

/**
 * Calculate allocation drift (current vs target)
 */
export function calculateDrift(
  currentHoldings: Portfolio,
  targetAllocation: Record<string, number>
): Record<string, number> {
  
  const totalValue = Object.values(currentHoldings).reduce((sum, v) => sum + v, 0)
  
  if (totalValue === 0) return {}
  
  const drifts: Record<string, number> = {}
  
  for (const [asset, target] of Object.entries(targetAllocation)) {
    const current = ((currentHoldings[asset] || 0) / totalValue) * 100
    drifts[asset] = current - target
  }
  
  return drifts
}

/**
 * Check if rebalancing is needed based on drift threshold
 */
export function needsRebalancing(
  currentHoldings: Portfolio,
  targetAllocation: Record<string, number>,
  threshold: number = 5
): boolean {
  
  const drifts = calculateDrift(currentHoldings, targetAllocation)
  const maxDrift = Math.max(...Object.values(drifts).map(Math.abs))
  
  return maxDrift >= threshold
}
