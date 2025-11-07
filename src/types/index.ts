export interface UserProfile {
  id: string
  name: string
  email: string
  dateOfBirth: Date
  age: number
  riskProfile: RiskProfile
  currency: string
  createdAt: Date
  updatedAt: Date
}

export type RiskProfile = 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very-aggressive'

export interface RetirementPlan {
  id: string
  userId: string
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  currentMonthlyExpenses: number
  currentSavings: number
  monthlyInvestment: number
  inflationRate: number
  expectedReturn: number
  retirementCorpusNeeded: number
  projectedCorpus: number
  shortfall: number
  assetAllocation: AssetAllocation
  createdAt: Date
  updatedAt: Date
}

export interface AssetAllocation {
  equity: number
  debt: number
  gold: number
  others?: number
}

export interface Goal {
  id: string
  userId: string
  type: GoalType
  name: string
  category: string
  targetAmount: number
  targetYear: number
  priority: Priority
  currentSavings: number
  monthlyInvestment: number
  expectedReturn: number
  inflationRate: number
  isRecurring: boolean
  recurringAmount?: number
  recurringFrequency?: 'monthly' | 'quarterly' | 'annually'
  status: GoalStatus
  createdAt: Date
  updatedAt: Date
}

export type GoalType = 'non-recurring' | 'recurring'
export type Priority = 'high' | 'medium' | 'low'
export type GoalStatus = 'planning' | 'active' | 'achieved' | 'modified'

export interface CashFlowProjection {
  year: number
  age: number
  income: number
  expenses: number
  investment: number
  portfolioValue: number
  inflationAdjustedExpenses: number
}

export interface IncomeStream {
  id: string
  userId: string
  name: string
  amount: number
  startAge: number
  endAge: number
  frequency: 'monthly' | 'quarterly' | 'annually'
  inflationAdjusted: boolean
  createdAt: Date
}

export interface BucketStrategy {
  bucket1: BucketDetail // Short-term (1-3 years)
  bucket2: BucketDetail // Medium-term (4-7 years)
  bucket3: BucketDetail // Long-term (8+ years)
}

export interface BucketDetail {
  name: string
  years: number
  amount: number
  allocation: AssetAllocation
  expectedReturn: number
  withdrawalStrategy: string
}

export interface MutualFund {
  id: string
  name: string
  category: string
  amc: string
  aum: number
  expenseRatio: number
  minInvestment: number
  returns: {
    oneYear: number
    threeYear: number
    fiveYear: number
  }
  riskLevel: RiskProfile
  exitLoad: string
}

export interface FinancialPlan {
  id: string
  userId: string
  profile: UserProfile
  retirement: RetirementPlan
  goals: Goal[]
  incomeStreams: IncomeStream[]
  cashFlowProjection: CashFlowProjection[]
  bucketStrategy?: BucketStrategy
  recommendations: Recommendation[]
  createdAt: Date
  updatedAt: Date
}

export interface Recommendation {
  id: string
  type: 'mutual-fund' | 'asset-allocation' | 'strategy'
  title: string
  description: string
  reason: string
  products?: MutualFund[]
  priority: Priority
}

export interface CoastFIRECalculation {
  currentAge: number
  retirementAge: number
  currentSavings: number
  expectedReturn: number
  targetRetirementCorpus: number
  coastFIRENumber: number
  isCoastFIRE: boolean
  yearsToCoastFIRE?: number
}
