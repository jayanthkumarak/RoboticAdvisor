import { MarketAssumptions } from '../assumptions/types'
import { ProjectionInputs, ProjectionResult, YearlyProjection } from './types'
import { validateInputs, sanitizeInputs } from './validation'
import { presentValueAnnuity } from '../math/compound'
import { nominalToReal } from '../math/compound'

/**
 * Run deterministic cashflow projection
 * 
 * This uses EXPECTED returns (no randomness)
 * Foundation for Monte Carlo simulation
 */
export function projectDeterministic(
  rawInputs: ProjectionInputs,
  assumptions: MarketAssumptions
): ProjectionResult {
  
  // 1. Validate and sanitize
  const inputs = sanitizeInputs(rawInputs)
  validateInputs(inputs)
  
  // 2. Initialize
  const timeline: YearlyProjection[] = []
  let portfolio = inputs.currentSavings
  
  const yearsToProject = inputs.lifeExpectancy - inputs.currentAge
  const inflationRate = assumptions.inflation.mean / 100
  const investmentGrowth = inputs.investmentGrowthRate || (inflationRate + 0.01)
  const expenseGrowth = inputs.expenseGrowthRate || inflationRate
  
  // 3. Calculate portfolio expected return
  const portfolioExpectedReturn = calculatePortfolioReturn(
    inputs.assetAllocation,
    assumptions
  )
  
  // 4. Project year by year
  for (let year = 0; year < yearsToProject; year++) {
    const age = inputs.currentAge + year
    const isRetired = age >= inputs.retirementAge
    
    // Inflation-adjusted expenses
    const annualExpenses = inputs.monthlyExpenses * 12 * Math.pow(1 + expenseGrowth, year)
    
    // Future one-time expenses (inflation-adjusted)
    const futureExpense = inputs.futureExpenses
      ?.filter(e => e.year === year)
      .reduce((sum, e) => sum + e.amount * Math.pow(1 + inflationRate, year), 0) || 0
    
    const totalExpenses = annualExpenses + futureExpense
    
    // Contributions (stop at retirement, grow with wages before)
    const annualContribution = isRetired
      ? 0
      : inputs.monthlyInvestment * 12 * Math.pow(1 + investmentGrowth, year)
    
    // Withdrawals (start at retirement)
    const withdrawal = isRetired ? totalExpenses : 0
    
    // Investment return
    const investmentReturn = portfolio * portfolioExpectedReturn
    
    // Update portfolio
    const netCashflow = annualContribution - withdrawal
    portfolio = portfolio + investmentReturn + netCashflow
    
    // Prevent negative portfolio
    if (portfolio < 0) {
      portfolio = 0
    }
    
    // Real return calculation
    const realReturn = investmentReturn / Math.pow(1 + inflationRate, year)
    
    timeline.push({
      year,
      age,
      portfolioValue: portfolio,
      income: 0,  // TODO: Add income streams
      expenses: totalExpenses,
      netCashflow,
      contributions: annualContribution,
      withdrawals: withdrawal,
      investmentReturn,
      realReturn,
      savingsRate: undefined,  // TODO: Calculate if income present
      withdrawalRate: portfolio > 0 ? withdrawal / (portfolio + withdrawal) : undefined
    })
    
    // Early exit if depleted
    if (portfolio === 0 && isRetired) {
      break
    }
  }
  
  // 5. Calculate summary
  const retirementYear = timeline.find(y => y.age === inputs.retirementAge)
  const corpusAtRetirement = retirementYear?.portfolioValue || 0
  
  const retirementYears = inputs.lifeExpectancy - inputs.retirementAge
  const retirementExpenses = inputs.monthlyExpenses * 12 * 
    Math.pow(1 + inflationRate, inputs.retirementAge - inputs.currentAge)
  const realReturn = nominalToReal(portfolioExpectedReturn, inflationRate)
  const corpusNeeded = presentValueAnnuity(retirementExpenses, realReturn, retirementYears)
  
  const gap = corpusNeeded - corpusAtRetirement
  const finalValue = timeline[timeline.length - 1]?.portfolioValue || 0
  
  const depletedYear = timeline.find(y => y.portfolioValue === 0 && y.age >= inputs.retirementAge)
  
  let successMetric: 'surplus' | 'on-track' | 'shortfall' | 'depletion'
  if (depletedYear) {
    successMetric = 'depletion'
  } else if (gap < 0) {
    successMetric = 'surplus'
  } else if (gap / corpusNeeded < 0.1) {
    successMetric = 'on-track'
  } else {
    successMetric = 'shortfall'
  }
  
  return {
    timeline,
    summary: {
      retirementCorpusNeeded: corpusNeeded,
      projectedCorpusAtRetirement: corpusAtRetirement,
      finalPortfolioValue: finalValue,
      depletionAge: depletedYear?.age,
      successMetric
    }
  }
}

/**
 * Calculate expected portfolio return given allocation
 */
function calculatePortfolioReturn(
  allocation: Record<string, number>,
  assumptions: MarketAssumptions
): number {
  let weightedReturn = 0
  
  for (const [assetId, weight] of Object.entries(allocation)) {
    const assetParams = assumptions.assetClasses[assetId]
    if (!assetParams) {
      throw new Error(`Unknown asset: ${assetId}`)
    }
    
    weightedReturn += (weight / 100) * (assetParams.nominalReturn.mean / 100)
  }
  
  return weightedReturn
}
