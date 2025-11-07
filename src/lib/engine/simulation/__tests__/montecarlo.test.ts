import { runMonteCarlo } from '../montecarlo'
import { ProjectionInputs } from '../../projection/types'
import { getAssumptions } from '../../assumptions/loader'
import { MonteCarloConfig } from '../types'

describe('Monte Carlo Simulation', () => {
  const assumptions = getAssumptions('IN', '2024-Q4')
  
  const baseInputs: ProjectionInputs = {
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentSavings: 1000000,
    monthlyInvestment: 25000,
    monthlyExpenses: 50000,
    assetAllocation: {
      'equity-nifty50': 70,
      'debt-govt-10y': 30
    }
  }
  
  const config: MonteCarloConfig = {
    numSimulations: 100,  // Small for fast tests
    seed: 42,
    timeStep: 'annual'
  }
  
  test('runs requested number of simulations', () => {
    const result = runMonteCarlo(baseInputs, assumptions, config)
    expect(result.terminalValueDistribution.values.length).toBe(100)
  })
  
  test('success probability is between 0 and 1', () => {
    const result = runMonteCarlo(baseInputs, assumptions, config)
    expect(result.successProbability).toBeGreaterThanOrEqual(0)
    expect(result.successProbability).toBeLessThanOrEqual(1)
  })
  
  test('percentiles are ordered correctly', () => {
    const result = runMonteCarlo(baseInputs, assumptions, config)
    
    const p10Final = result.percentiles.p10[result.percentiles.p10.length - 1].portfolioValue
    const p50Final = result.percentiles.p50[result.percentiles.p50.length - 1].portfolioValue
    const p90Final = result.percentiles.p90[result.percentiles.p90.length - 1].portfolioValue
    
    expect(p10Final).toBeLessThan(p50Final)
    expect(p50Final).toBeLessThan(p90Final)
  })
  
  test('deterministic with same seed', () => {
    const result1 = runMonteCarlo(baseInputs, assumptions, { ...config, seed: 12345 })
    const result2 = runMonteCarlo(baseInputs, assumptions, { ...config, seed: 12345 })
    
    expect(result1.successProbability).toBe(result2.successProbability)
    expect(result1.medianOutcome).toBe(result2.medianOutcome)
  })
  
  test('different seeds can produce different results', () => {
    const result1 = runMonteCarlo(baseInputs, assumptions, { ...config, seed: 111, numSimulations: 1000 })
    const result2 = runMonteCarlo(baseInputs, assumptions, { ...config, seed: 222, numSimulations: 1000 })
    
    // With enough simulations, results should vary (though might occasionally be same)
    const terminalValuesDifferent = result1.terminalValueDistribution.values.some(
      (val, idx) => val !== result2.terminalValueDistribution.values[idx]
    )
    expect(terminalValuesDifferent).toBe(true)
  })
  
  test('higher equity allocation = higher variance', () => {
    const conservativeInputs = {
      ...baseInputs,
      assetAllocation: { 'equity-nifty50': 30, 'debt-govt-10y': 70 }
    }
    
    const aggressiveInputs = {
      ...baseInputs,
      assetAllocation: { 'equity-nifty50': 90, 'debt-govt-10y': 10 }
    }
    
    const conservative = runMonteCarlo(conservativeInputs, assumptions, config)
    const aggressive = runMonteCarlo(aggressiveInputs, assumptions, config)
    
    expect(aggressive.terminalValueDistribution.std).toBeGreaterThan(
      conservative.terminalValueDistribution.std
    )
  })
  
  test('insufficient savings = low success probability', () => {
    const lowSavingsInputs = {
      ...baseInputs,
      currentSavings: 100000,
      monthlyInvestment: 5000
    }
    
    const result = runMonteCarlo(lowSavingsInputs, assumptions, config)
    expect(result.successProbability).toBeLessThan(0.5)
  })
  
  test('high savings = high success probability', () => {
    const highSavingsInputs = {
      ...baseInputs,
      currentSavings: 50000000,
      monthlyInvestment: 100000
    }
    
    const result = runMonteCarlo(highSavingsInputs, assumptions, config)
    expect(result.successProbability).toBeGreaterThan(0.9)
  })
  
  test('shortfall risk metrics make sense', () => {
    const result = runMonteCarlo(baseInputs, assumptions, config)
    
    expect(result.shortfallRisk.probability).toBeCloseTo(1 - result.successProbability, 5)
    expect(result.shortfallRisk.worstCase).toBeLessThanOrEqual(result.medianOutcome)
  })
  
  test('larger simulation = more stable results', () => {
    const small = runMonteCarlo(baseInputs, assumptions, { ...config, numSimulations: 50, seed: 123 })
    const large = runMonteCarlo(baseInputs, assumptions, { ...config, numSimulations: 500, seed: 123 })
    
    // Larger sample should have less sampling error
    expect(Math.abs(small.successProbability - large.successProbability)).toBeLessThan(0.15)
  })
})
