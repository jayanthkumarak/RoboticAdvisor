/**
 * Input and output types for deterministic projection
 */

export interface ProjectionInputs {
  // Demographics
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  
  // Current state
  currentSavings: number
  
  // Contributions
  monthlyInvestment: number
  investmentGrowthRate?: number  // Default: inflation + 1%
  
  // Expenses
  monthlyExpenses: number        // In today's money
  expenseGrowthRate?: number     // Default: inflation
  
  // Asset allocation
  assetAllocation: {
    [assetId: string]: number    // Percentage (must sum to 100)
  }
  
  // Optional: one-time expenses
  futureExpenses?: {
    year: number
    amount: number
    label: string
  }[]
}

export interface YearlyProjection {
  year: number
  age: number
  
  // Portfolio
  portfolioValue: number
  
  // Cashflows
  income: number
  expenses: number
  netCashflow: number
  
  // Contributions/Withdrawals
  contributions: number
  withdrawals: number
  
  // Returns
  investmentReturn: number
  realReturn: number             // After inflation
  
  // Metrics
  savingsRate?: number           // % of income saved
  withdrawalRate?: number        // % of portfolio withdrawn
}

export interface ProjectionResult {
  timeline: YearlyProjection[]
  summary: {
    retirementCorpusNeeded: number
    projectedCorpusAtRetirement: number
    finalPortfolioValue: number
    depletionAge?: number
    successMetric: 'surplus' | 'on-track' | 'shortfall' | 'depletion'
  }
}
