import { MarketAssumptions } from '../assumptions/types'
import { ProjectionInputs, YearlyProjection } from '../projection/types'
import { validateInputs, sanitizeInputs } from '../projection/validation'
import { MonteCarloConfig, MonteCarloResult, SimulationPath } from './types'
import { SeededRandom } from '../math/random'
import { nominalToReal } from '../math/compound'
import { mean, standardDeviation, percentile } from '../math/statistics'

/**
 * Run Monte Carlo simulation for retirement planning
 * 
 * Simulates thousands of possible market scenarios to quantify uncertainty
 * and calculate probability of success
 */
export function runMonteCarlo(
  rawInputs: ProjectionInputs,
  assumptions: MarketAssumptions,
  config: MonteCarloConfig
): MonteCarloResult {
  
  // Validate inputs
  const inputs = sanitizeInputs(rawInputs)
  validateInputs(inputs)
  
  // Run simulations
  const simulations: SimulationPath[] = []
  
  for (let sim = 0; sim < config.numSimulations; sim++) {
    const seed = (config.seed || 42) + sim
    const timeline = runSingleSimulation(inputs, assumptions, seed)
    
    simulations.push({
      id: sim,
      timeline,
      terminalValue: timeline[timeline.length - 1]?.portfolioValue || 0,
      depletedAt: timeline.find(y => y.portfolioValue === 0 && y.age >= inputs.retirementAge)?.year
    })
  }
  
  // Aggregate results
  return aggregateResults(simulations, inputs)
}

/**
 * Run single Monte Carlo simulation path
 */
function runSingleSimulation(
  inputs: ProjectionInputs,
  assumptions: MarketAssumptions,
  seed: number
): YearlyProjection[] {
  
  const rng = new SeededRandom(seed)
  const timeline: YearlyProjection[] = []
  let portfolio = inputs.currentSavings
  
  const yearsToProject = inputs.lifeExpectancy - inputs.currentAge
  const inflationRate = assumptions.inflation.mean / 100
  const investmentGrowth = inputs.investmentGrowthRate || (inflationRate + 0.01)
  const expenseGrowth = inputs.expenseGrowthRate || inflationRate
  
  // Get asset parameters
  const assetParams = Object.entries(inputs.assetAllocation).map(([assetId, weight]) => ({
    assetId,
    weight: weight / 100,
    params: assumptions.assetClasses[assetId]
  }))
  
  for (let year = 0; year < yearsToProject; year++) {
    const age = inputs.currentAge + year
    const isRetired = age >= inputs.retirementAge
    
    // 1. Sample returns for each asset class
    let portfolioReturn = 0
    for (const { weight, params } of assetParams) {
      const assetReturn = rng.normalWithParams(
        params.nominalReturn.mean / 100,
        params.nominalReturn.volatility / 100
      )
      portfolioReturn += weight * assetReturn
    }
    
    const investmentReturn = portfolio * portfolioReturn
    
    // 2. Inflation-adjusted expenses
    const annualExpenses = inputs.monthlyExpenses * 12 * Math.pow(1 + expenseGrowth, year)
    
    const futureExpense = inputs.futureExpenses
      ?.filter(e => e.year === year)
      .reduce((sum, e) => sum + e.amount * Math.pow(1 + inflationRate, year), 0) || 0
    
    const totalExpenses = annualExpenses + futureExpense
    
    // 3. Contributions and withdrawals
    const annualContribution = isRetired
      ? 0
      : inputs.monthlyInvestment * 12 * Math.pow(1 + investmentGrowth, year)
    
    const withdrawal = isRetired ? totalExpenses : 0
    
    // 4. Update portfolio
    const netCashflow = annualContribution - withdrawal
    portfolio = portfolio + investmentReturn + netCashflow
    
    if (portfolio < 0) {
      portfolio = 0
    }
    
    // 5. Record projection
    const realReturn = investmentReturn / Math.pow(1 + inflationRate, year)
    
    timeline.push({
      year,
      age,
      portfolioValue: portfolio,
      income: 0,
      expenses: totalExpenses,
      netCashflow,
      contributions: annualContribution,
      withdrawals: withdrawal,
      investmentReturn,
      realReturn,
      withdrawalRate: portfolio > 0 ? withdrawal / (portfolio + withdrawal) : undefined
    })
    
    // Early exit if depleted
    if (portfolio === 0 && isRetired) {
      break
    }
  }
  
  return timeline
}

/**
 * Aggregate Monte Carlo results into summary statistics
 */
function aggregateResults(
  simulations: SimulationPath[],
  inputs: ProjectionInputs
): MonteCarloResult {
  
  // Calculate success probability
  const successes = simulations.filter(sim => 
    sim.timeline[sim.timeline.length - 1]?.portfolioValue > 0
  ).length
  const successProbability = successes / simulations.length
  
  // Get terminal values
  const terminalValues = simulations.map(sim => sim.terminalValue)
  
  // Sort simulations by terminal value for percentile extraction
  const sortedSims = [...simulations].sort((a, b) => a.terminalValue - b.terminalValue)
  
  // Extract percentile paths
  const p10Index = Math.floor(simulations.length * 0.10)
  const p25Index = Math.floor(simulations.length * 0.25)
  const p50Index = Math.floor(simulations.length * 0.50)
  const p75Index = Math.floor(simulations.length * 0.75)
  const p90Index = Math.floor(simulations.length * 0.90)
  
  // For failed cases, calculate average shortfall
  const failedSims = simulations.filter(sim => sim.depletedAt !== undefined)
  const avgShortfall = failedSims.length > 0
    ? mean(failedSims.map(sim => {
        const depletedYear = sim.timeline.find(y => y.year === sim.depletedAt)
        return depletedYear ? Math.abs(depletedYear.portfolioValue) : 0
      }))
    : 0
  
  return {
    successProbability,
    medianOutcome: sortedSims[p50Index].terminalValue,
    percentiles: {
      p10: sortedSims[p10Index].timeline,
      p25: sortedSims[p25Index].timeline,
      p50: sortedSims[p50Index].timeline,
      p75: sortedSims[p75Index].timeline,
      p90: sortedSims[p90Index].timeline
    },
    terminalValueDistribution: {
      mean: mean(terminalValues),
      median: percentile(terminalValues, 50),
      std: standardDeviation(terminalValues),
      values: terminalValues
    },
    shortfallRisk: {
      probability: 1 - successProbability,
      averageShortfall: avgShortfall,
      worstCase: sortedSims[0].terminalValue
    }
  }
}
