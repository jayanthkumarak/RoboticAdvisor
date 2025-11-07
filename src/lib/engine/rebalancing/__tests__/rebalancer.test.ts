import { generateRebalancingTrades, calculateDrift, needsRebalancing } from '../rebalancer'
import { Portfolio } from '../types'
import { getAssumptions } from '../../assumptions/loader'

describe('Rebalancing Engine', () => {
  const assumptions = getAssumptions('IN', '2024-Q4')
  
  const targetAllocation = {
    'equity-nifty50': 70,
    'debt-govt-10y': 30
  }
  
  test('no rebalancing needed when within threshold', () => {
    const holdings: Portfolio = {
      'equity-nifty50': 700000,   // 70%
      'debt-govt-10y': 300000     // 30%
    }
    
    const result = generateRebalancingTrades(holdings, targetAllocation, assumptions)
    expect(result.needsRebalancing).toBe(false)
    expect(result.trades.length).toBe(0)
  })
  
  test('detects drift above threshold', () => {
    const holdings: Portfolio = {
      'equity-nifty50': 850000,   // 85% (15% drift)
      'debt-govt-10y': 150000     // 15%
    }
    
    const result = generateRebalancingTrades(holdings, targetAllocation, assumptions)
    expect(result.needsRebalancing).toBe(true)
    expect(result.maxDrift).toBeCloseTo(15, 1)
  })
  
  test('generates correct trade directions', () => {
    const holdings: Portfolio = {
      'equity-nifty50': 800000,   // 80% (need to sell)
      'debt-govt-10y': 200000     // 20% (need to buy)
    }
    
    const result = generateRebalancingTrades(holdings, targetAllocation, assumptions)
    
    const equityTrade = result.trades.find(t => t.asset === 'equity-nifty50')
    const debtTrade = result.trades.find(t => t.asset === 'debt-govt-10y')
    
    expect(equityTrade?.action).toBe('SELL')
    expect(debtTrade?.action).toBe('BUY')
  })
  
  test('trade amounts restore target allocation', () => {
    const holdings: Portfolio = {
      'equity-nifty50': 800000,
      'debt-govt-10y': 200000
    }
    const totalValue = 1000000
    
    const result = generateRebalancingTrades(holdings, targetAllocation, assumptions)
    
    // After trades, should be at target
    const targetEquity = (targetAllocation['equity-nifty50'] / 100) * totalValue
    const targetDebt = (targetAllocation['debt-govt-10y'] / 100) * totalValue
    
    const equityTrade = result.trades.find(t => t.asset === 'equity-nifty50')
    expect(equityTrade?.targetValue).toBeCloseTo(targetEquity, 0)
  })
  
  test('calculates trading costs', () => {
    const holdings: Portfolio = {
      'equity-nifty50': 850000,
      'debt-govt-10y': 150000
    }
    
    const result = generateRebalancingTrades(holdings, targetAllocation, assumptions)
    
    expect(result.estimatedCost).toBeGreaterThan(0)
    expect(result.impactOnReturn).toBeGreaterThan(0)
  })
  
  test('respects minimum trade amount', () => {
    const holdings: Portfolio = {
      'equity-nifty50': 705000,   // Only 0.5% drift
      'debt-govt-10y': 295000
    }
    
    const result = generateRebalancingTrades(
      holdings, 
      targetAllocation, 
      assumptions,
      { driftThreshold: 0, minimumTradeAmount: 100000 }  // High minimum
    )
    
    // Small drift shouldn't trigger trades if below minimum
    expect(result.trades.length).toBe(0)
  })
  
  test('calculateDrift returns correct percentages', () => {
    const holdings: Portfolio = {
      'equity-nifty50': 800000,
      'debt-govt-10y': 200000
    }
    
    const drifts = calculateDrift(holdings, targetAllocation)
    
    expect(drifts['equity-nifty50']).toBeCloseTo(10, 1)  // 80% - 70% = +10%
    expect(drifts['debt-govt-10y']).toBeCloseTo(-10, 1)  // 20% - 30% = -10%
  })
  
  test('needsRebalancing threshold check', () => {
    const smallDrift: Portfolio = {
      'equity-nifty50': 730000,  // 73%
      'debt-govt-10y': 270000    // 27%
    }
    
    const largeDrift: Portfolio = {
      'equity-nifty50': 850000,  // 85%
      'debt-govt-10y': 150000    // 15%
    }
    
    expect(needsRebalancing(smallDrift, targetAllocation, 5)).toBe(false)
    expect(needsRebalancing(largeDrift, targetAllocation, 5)).toBe(true)
  })
  
  test('handles empty portfolio', () => {
    const result = generateRebalancingTrades({}, targetAllocation, assumptions)
    expect(result.needsRebalancing).toBe(false)
  })
})
