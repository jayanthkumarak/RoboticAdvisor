# Financial Planning Engine - Deep Architecture Specification

## 📐 Core Philosophy

**This is NOT a toy calculator.** This engine must produce institutional-grade projections that:
- Account for uncertainty and tail risk
- Handle multi-generational timelines (80+ years)
- Scale from ₹10L portfolios to ₹1000Cr+ 
- Incorporate real market behavior (volatility clustering, regime shifts, correlation breakdown)
- Provide actionable precision (not false precision)

---

## 🎯 Engine Components Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FINANCIAL PLANNING ENGINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │   ASSUMPTIONS  │  │  DETERMINISTIC │  │   MONTE CARLO    │  │
│  │     MODULE     │→ │   PROJECTION   │→ │   SIMULATION     │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│         ↓                    ↓                      ↓            │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │   PORTFOLIO    │  │  GOAL FUNDING  │  │   REBALANCING    │  │
│  │  OPTIMIZATION  │  │    OPTIMIZER   │  │      ENGINE      │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│         ↓                    ↓                      ↓            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              RECOMMENDATION GENERATOR                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Assumptions Module

### 1.1 Purpose
**Single source of truth** for all economic and market assumptions. Prevents inconsistency bugs (e.g., UI using 6% inflation while engine uses 7%).

### 1.2 Data Structure

```typescript
interface MarketAssumptions {
  version: string                    // "2024-Q4" for auditability
  effectiveDate: Date
  region: 'IN' | 'US' | 'EU' | 'GLOBAL'
  
  // Asset class parameters
  assetClasses: {
    [key: string]: AssetClassParams
  }
  
  // Correlation matrix
  correlationMatrix: number[][]      // nAssets × nAssets
  
  // Regime parameters (bear/normal/bull)
  regimes: MarketRegime[]
  
  // Inflation parameters
  inflation: InflationParams
  
  // Tax assumptions
  tax: TaxParams
}

interface AssetClassParams {
  id: string                         // 'equity-large-cap', 'debt-govt', etc.
  label: string
  
  // Return distribution (annualized)
  nominalReturn: {
    mean: number                     // Expected return (arithmetic)
    volatility: number               // Standard deviation
    skewness?: number                // For fat tails
    kurtosis?: number                // For tail risk
  }
  
  // Real return (after inflation)
  realReturn: {
    mean: number
    volatility: number
  }
  
  // Liquidity and costs
  tradingCost: number                // bps per trade
  minimumLotSize?: number            // For futures, bonds
  
  // Tax treatment
  taxTreatment: {
    shortTermGainsTax: number        // < 1 year
    longTermGainsTax: number         // > 1 year
    dividendTax: number
    isIndexationAvailable: boolean
  }
}

interface MarketRegime {
  id: 'bear' | 'normal' | 'bull' | 'stagflation' | 'crisis'
  probability: number                // Long-run steady-state
  duration: {
    mean: number                     // Average regime length (years)
    volatility: number
  }
  
  // Asset class overrides for this regime
  assetClassMultipliers: {
    [assetId: string]: {
      returnMultiplier: number       // e.g., 0.5 in bear = half expected return
      volatilityMultiplier: number   // e.g., 2.0 in crisis = double vol
    }
  }
  
  // Correlation adjustments
  correlationShift: number[][]       // How correlations change in this regime
}

interface InflationParams {
  // Base inflation
  mean: number                       // Long-run average (e.g., 6% for India)
  volatility: number                 // Year-to-year variability
  
  // Regime-dependent
  regimeAdjustments: {
    [regimeId: string]: number       // e.g., +3% in stagflation
  }
  
  // Inflation curve (if non-constant)
  curve?: {
    year: number
    expectedInflation: number
  }[]
  
  // Persistence (autocorrelation)
  persistence: number                // AR(1) coefficient (0-1)
}
```

### 1.3 Real-World Calibration

**Critical:** These aren't made-up numbers. They come from:

1. **Historical Data** (50+ years where available)
   - Equity: Nifty 50, BSE Sensex, S&P 500
   - Debt: Govt bonds, corporate bonds
   - Inflation: CPI, WPI
   
2. **Forward-Looking Adjustments**
   - Current yield curve → expected bond returns
   - CAPE ratio → equity risk premium adjustment
   - Central bank policy → inflation expectations
   
3. **Regime Detection**
   - Hidden Markov Models on historical data
   - Transition probabilities between regimes
   - Duration distributions

4. **Fat Tails & Black Swans**
   - Incorporate skewness/kurtosis from crises
   - 2008, COVID, Asian Financial Crisis, etc.
   - Don't assume normal distributions

### 1.4 Example: Indian Market (2024)

```typescript
const INDIA_2024_ASSUMPTIONS: MarketAssumptions = {
  version: "2024-Q4",
  region: "IN",
  
  assetClasses: {
    'equity-large-cap': {
      nominalReturn: {
        mean: 12.0,              // Historical 50Y: 13%, adjusted for CAPE
        volatility: 18.0,        // Historical realized vol
        skewness: -0.5,          // Negative skew (fat left tail)
        kurtosis: 4.0            // Excess kurtosis (fat tails)
      },
      realReturn: {
        mean: 6.0,               // 12% - 6% inflation
        volatility: 19.5         // Slightly higher (inflation uncertainty)
      },
      tradingCost: 10,           // 10 bps all-in
      taxTreatment: {
        shortTermGainsTax: 15,   // STCG on equity
        longTermGainsTax: 10,    // LTCG > 1L
        dividendTax: 0,          // Now in hands of investor
        isIndexationAvailable: false
      }
    },
    
    'debt-govt-10y': {
      nominalReturn: {
        mean: 7.2,               // Current 10Y yield
        volatility: 4.5,
        skewness: 0.2,
        kurtosis: 3.0
      },
      realReturn: {
        mean: 1.2,               // 7.2% - 6% inflation
        volatility: 5.0
      },
      tradingCost: 5,
      taxTreatment: {
        shortTermGainsTax: 30,   // Marginal rate
        longTermGainsTax: 20,    // With indexation
        dividendTax: 0,
        isIndexationAvailable: true
      }
    },
    
    'gold': {
      nominalReturn: {
        mean: 8.0,               // Long-run inflation hedge + 2%
        volatility: 15.0,
        skewness: 0.3,
        kurtosis: 3.5
      },
      realReturn: {
        mean: 2.0,
        volatility: 15.5
      },
      tradingCost: 50,           // Higher for physical gold
      taxTreatment: {
        shortTermGainsTax: 30,
        longTermGainsTax: 20,
        dividendTax: 0,
        isIndexationAvailable: true
      }
    }
  },
  
  correlationMatrix: [
    // equity  debt   gold
    [  1.00,  0.15, -0.10 ],  // Equity low corr with debt, negative with gold
    [  0.15,  1.00,  0.05 ],  // Debt
    [ -0.10,  0.05,  1.00 ]   // Gold (crisis hedge)
  ],
  
  regimes: [
    {
      id: 'normal',
      probability: 0.70,
      duration: { mean: 5, volatility: 2 },
      assetClassMultipliers: {
        'equity-large-cap': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 },
        'debt-govt-10y': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 },
        'gold': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 }
      },
      correlationShift: [[0,0,0],[0,0,0],[0,0,0]]  // No change
    },
    {
      id: 'bear',
      probability: 0.15,
      duration: { mean: 1.5, volatility: 0.8 },
      assetClassMultipliers: {
        'equity-large-cap': { returnMultiplier: -0.3, volatilityMultiplier: 2.0 },  // -30% returns, 2x vol
        'debt-govt-10y': { returnMultiplier: 1.2, volatilityMultiplier: 0.8 },     // Flight to safety
        'gold': { returnMultiplier: 1.5, volatilityMultiplier: 1.3 }                // Crisis hedge
      },
      correlationShift: [
        [ 0,  0.25,  -0.20 ],  // Equity-debt corr increases (both fall)
        [ 0.25,  0,   0 ],
        [-0.20,  0,   0 ]      // Equity-gold negative corr strengthens
      ]
    },
    {
      id: 'crisis',
      probability: 0.05,
      duration: { mean: 0.5, volatility: 0.3 },  // Short but brutal
      assetClassMultipliers: {
        'equity-large-cap': { returnMultiplier: -1.0, volatilityMultiplier: 3.0 },  // -100% of expected
        'debt-govt-10y': { returnMultiplier: 1.5, volatilityMultiplier: 1.5 },
        'gold': { returnMultiplier: 2.0, volatilityMultiplier: 2.0 }
      },
      correlationShift: [
        [ 0,  0.50,  -0.40 ],  // Severe correlation breakdown
        [ 0.50,  0,   0.10 ],
        [-0.40,  0.10,  0 ]
      ]
    }
  ],
  
  inflation: {
    mean: 6.0,
    volatility: 2.0,
    persistence: 0.6,            // Moderate persistence
    regimeAdjustments: {
      'normal': 0,
      'bear': -1.0,              // Deflation risk
      'stagflation': 3.0,        // High inflation + low growth
      'crisis': -2.0             // Demand collapse
    }
  }
}
```

### 1.5 Versioning & Auditability

**Why versions matter:**
- User runs analysis in Q4 2024 → uses "2024-Q4" assumptions
- Revisits in Q1 2025 → can reproduce original results OR update to new assumptions
- Regulatory audit → can prove what assumptions were used for any given projection

**Storage:**
```typescript
// Store with each calculation
interface CalculationMetadata {
  assumptionsVersion: string
  calculationDate: Date
  engineVersion: string
  canRecalculate: boolean  // Are these assumptions still available?
}
```

---

## 2. Deterministic Cashflow Projection

### 2.1 Purpose
**Base case scenario** without uncertainty. Forms the foundation for Monte Carlo and what-if analysis.

### 2.2 Algorithm

```typescript
interface CashflowInputs {
  // Current state
  currentAge: number
  currentPortfolio: {
    [accountId: string]: {
      [assetId: string]: number  // Current value in each asset
    }
  }
  
  // Timeline
  projectionHorizon: number       // Years to project (e.g., 60)
  
  // Income streams
  incomeStreams: IncomeStream[]
  
  // Expenses
  baseExpenses: number            // Annual in today's $
  expenseGrowth: number           // Usually = inflation
  discretionaryExpenses?: {       // One-time or recurring
    year: number
    amount: number
    label: string
  }[]
  
  // Contributions
  contributions: {
    accountId: string
    amount: number                // Annual
    growthRate: number            // Wage growth, typically inflation + 1-2%
    startYear: number
    endYear: number               // Stop at retirement
  }[]
  
  // Goals (treated as future expenses)
  goals: Goal[]
  
  // Asset allocation policy
  allocationPolicy: {
    [ageRange: string]: {         // "30-45", "46-60", "61-75", "76+"
      [assetId: string]: number   // Target %
    }
  }
  
  // Withdrawal strategy (post-retirement)
  withdrawalStrategy: 'fixed-amount' | 'fixed-percentage' | 'floor-ceiling' | 'glidepath'
  withdrawalRate?: number         // For fixed-percentage (e.g., 4%)
}

interface CashflowOutput {
  timeline: YearProjection[]
  summary: {
    retirementCorpusNeeded: number
    projectedCorpusAtRetirement: number
    shortfall: number
    successMetric: 'surplus' | 'on-track' | 'shortfall' | 'failure'
    depletionAge?: number         // Age when portfolio hits zero (if applicable)
    bequest: number               // Value at life expectancy
  }
}

interface YearProjection {
  year: number
  age: number
  
  // Portfolio
  portfolioValue: {
    total: number
    byAccount: { [accountId: string]: number }
    byAsset: { [assetId: string]: number }
  }
  
  // Cashflows
  income: number                  // Salary, pension, social security equivalent
  expenses: number                // Living expenses (inflation-adjusted)
  netContribution: number         // Income - expenses
  
  // Investment flows
  contributions: number           // Active savings
  withdrawals: number             // Retirement drawdowns
  
  // Returns
  investment Return: number        // Portfolio gain/loss
  inflationAdjustedReturn: number // Real return
  
  // Allocation
  allocation: { [assetId: string]: number }
  rebalancingTrades?: Trade[]     // If rebalancing occurred
  
  // Metrics
  savingsRate: number             // % of income saved
  withdrawalRate?: number         // % of portfolio withdrawn (if retired)
}
```

### 2.3 Core Calculation Loop

```typescript
function projectDeterministicCashflows(
  inputs: CashflowInputs,
  assumptions: MarketAssumptions
): CashflowOutput {
  
  const timeline: YearProjection[] = []
  let portfolio = clone(inputs.currentPortfolio)
  
  for (let year = 0; year < inputs.projectionHorizon; year++) {
    const age = inputs.currentAge + year
    
    // 1. Calculate income for this year
    const income = calculateIncome(inputs.incomeStreams, year, assumptions.inflation)
    
    // 2. Calculate expenses (inflation-adjusted)
    const baseExpense = inputs.baseExpenses * Math.pow(
      1 + assumptions.inflation.mean / 100,
      year
    )
    const discretionaryExpense = sumDiscretionaryExpenses(
      inputs.discretionaryExpenses,
      year
    )
    const goalExpense = sumGoalExpenses(inputs.goals, year, assumptions.inflation)
    const totalExpense = baseExpense + discretionaryExpense + goalExpense
    
    // 3. Net contribution (can be negative in retirement)
    const netContribution = income - totalExpense
    
    // 4. Active contributions (e.g., SIP)
    const activeContribution = sumContributions(inputs.contributions, year, age)
    
    // 5. Total cashflow into portfolio
    const totalCashflow = netContribution + activeContribution
    
    // 6. Apply returns (deterministic = use mean)
    const allocation = getAllocationForAge(inputs.allocationPolicy, age)
    const portfolioReturn = calculatePortfolioReturn(
      portfolio,
      allocation,
      assumptions,
      'mean'  // Use expected return for deterministic
    )
    
    // 7. Update portfolio value
    const portfolioValue = sumPortfolioValue(portfolio) + portfolioReturn + totalCashflow
    
    // 8. Rebalance if needed
    const { newPortfolio, trades } = rebalanceIfNeeded(
      portfolio,
      portfolioValue,
      allocation,
      assumptions,
      { driftThreshold: 0.05 }  // 5% drift tolerance
    )
    portfolio = newPortfolio
    
    // 9. Record year projection
    timeline.push({
      year,
      age,
      portfolioValue: {
        total: portfolioValue,
        byAccount: aggregateByAccount(portfolio),
        byAsset: aggregateByAsset(portfolio)
      },
      income,
      expenses: totalExpense,
      netContribution,
      contributions: activeContribution,
      withdrawals: totalCashflow < 0 ? -totalCashflow : 0,
      investmentReturn: portfolioReturn,
      inflationAdjustedReturn: portfolioReturn / Math.pow(1 + assumptions.inflation.mean/100, year),
      allocation,
      rebalancingTrades: trades,
      savingsRate: income > 0 ? (income - totalExpense) / income : 0,
      withdrawalRate: portfolioValue > 0 ? Math.abs(totalCashflow) / portfolioValue : 0
    })
    
    // 10. Check for depletion
    if (portfolioValue <= 0) {
      return {
        timeline,
        summary: {
          retirementCorpusNeeded: calculateCorpusNeeded(inputs, assumptions),
          projectedCorpusAtRetirement: getValueAtRetirement(timeline, inputs.retirementAge),
          shortfall: 0,  // Will calculate
          successMetric: 'failure',
          depletionAge: age,
          bequest: 0
        }
      }
    }
  }
  
  // Calculate summary
  return {
    timeline,
    summary: calculateSummary(timeline, inputs, assumptions)
  }
}
```

### 2.4 Critical Implementation Details

**A. Inflation Handling**
```typescript
// ALL future expenses must be inflation-adjusted
function inflationAdjust(amount: number, years: number, inflationRate: number): number {
  return amount * Math.pow(1 + inflationRate / 100, years)
}

// But contributions might grow faster (wage growth)
function wageGrowthAdjust(salary: number, years: number, realWageGrowth: number, inflation: number): number {
  return salary * Math.pow(1 + (realWageGrowth + inflation) / 100, years)
}
```

**B. Real vs Nominal Consistency**
```typescript
// Always track both
interface Return {
  nominal: number        // Actual $ return
  real: number          // After inflation
  inflation: number     // Inflation rate used
}

// Real return formula
function nominalToReal(nominalReturn: number, inflation: number): number {
  return ((1 + nominalReturn) / (1 + inflation)) - 1
}
```

**C. Compounding Precision**
```typescript
// Use exact compounding, not approximations
// WRONG: FV = PV * (1 + r*n)
// RIGHT: FV = PV * (1 + r)^n

function futureValue(pv: number, rate: number, periods: number): number {
  return pv * Math.pow(1 + rate, periods)
}
```

**D. Withdrawal Sustainability**
```typescript
// Retirement corpus needed formula (present value of annuity)
function corpusNeeded(
  annualExpense: number,
  years: number,
  realReturn: number
): number {
  // PV = PMT × [(1 - (1 + r)^-n) / r]
  const r = realReturn / 100
  return annualExpense * ((1 - Math.pow(1 + r, -years)) / r)
}
```

---

## 3. Monte Carlo Simulation Engine

### 3.1 Purpose
**Quantify uncertainty.** Deterministic projections lie—markets don't follow smooth paths. Monte Carlo shows the RANGE of outcomes and probability of success.

### 3.2 Architecture

```typescript
interface MonteCarloConfig {
  numSimulations: number           // 5,000 - 10,000 for UI, 50,000 for deep analysis
  seed?: number                    // For reproducibility
  
  // Simulation method
  method: 'GBM' | 'regime-switching' | 'historical-bootstrap' | 'hybrid'
  
  // Time step
  timeStep: 'monthly' | 'annual'   // Monthly for precision, annual for speed
  
  // Return distribution
  distribution: 'normal' | 'student-t' | 'empirical'
  degreesOfFreedom?: number        // For student-t (fat tails)
  
  // Advanced features
  includeRegimeSwitching: boolean
  includeSequenceRisk: boolean     // Early bear market = worse outcome
  includeCorrelationBreakdown: boolean  // Correlations spike in crises
}

interface MonteCarloOutput {
  // Probability metrics
  successProbability: number       // % of sims that don't deplete
  medianOutcome: number            // 50th percentile terminal value
  
  // Percentile paths
  percentiles: {
    p10: YearProjection[]          // Worst 10%
    p25: YearProjection[]
    p50: YearProjection[]          // Median
    p75: YearProjection[]
    p90: YearProjection[]          // Best 10%
  }
  
  // Distribution stats
  terminalValueDistribution: {
    mean: number
    median: number
    std: number
    skewness: number
    kurtosis: number
    histogram: { bucket: number, count: number }[]
  }
  
  // Risk metrics
  shortfallRisk: {
    probability: number            // % chance of running out
    averageShortfall: number       // Avg $ shortfall in failure cases
    worstCase: number              // 1st percentile outcome
  }
  
  // Sequence risk
  earlyMarketCrashImpact: {
    probabilityOfCrash: number
    averageImpact: number          // How much worse if crash in year 1-5
  }
  
  // All simulation paths (for deep analysis)
  allPaths?: SimulationPath[]     // Optional, memory-intensive
}

interface SimulationPath {
  id: number
  timeline: YearProjection[]
  terminalValue: number
  depletedAt?: number             // Year of depletion, if any
  regimeSequence?: string[]       // Which regimes occurred
}
```

### 3.3 Geometric Brownian Motion (GBM) Simulation

**Basic Method:**
```typescript
function simulateGBM(
  S0: number,                      // Starting value
  mu: number,                      // Expected return (annualized)
  sigma: number,                   // Volatility (annualized)
  T: number,                       // Time horizon (years)
  dt: number,                      // Time step (1/12 for monthly)
  numSteps: number,                // T / dt
  randomNormal: () => number       // RNG
): number[] {
  
  const path: number[] = [S0]
  let S = S0
  
  for (let i = 0; i < numSteps; i++) {
    // dS = μ*S*dt + σ*S*sqrt(dt)*Z
    const drift = mu * S * dt
    const diffusion = sigma * S * Math.sqrt(dt) * randomNormal()
    S = S + drift + diffusion
    
    // Prevent negative values (log-normal)
    S = Math.max(S, 0.01)
    path.push(S)
  }
  
  return path
}
```

**Multi-Asset Correlated GBM:**
```typescript
function simulateCorrelatedAssets(
  initialValues: number[],
  returns: number[],               // Expected returns per asset
  volatilities: number[],
  correlationMatrix: number[][],
  T: number,
  dt: number
): number[][] {
  
  // 1. Cholesky decomposition of correlation matrix
  const L = choleskyDecomposition(correlationMatrix)
  
  // 2. Generate uncorrelated random normals
  const numAssets = initialValues.length
  const numSteps = Math.floor(T / dt)
  const paths: number[][] = initialValues.map(v => [v])
  
  for (let step = 0; step < numSteps; step++) {
    // Generate independent normals
    const Z = Array(numAssets).fill(0).map(() => randomNormal())
    
    // Apply correlation via Cholesky: Z_corr = L * Z
    const Z_corr = multiplyMatrixVector(L, Z)
    
    // Update each asset
    for (let i = 0; i < numAssets; i++) {
      const S = paths[i][step]
      const mu = returns[i]
      const sigma = volatilities[i]
      
      const drift = mu * S * dt
      const diffusion = sigma * S * Math.sqrt(dt) * Z_corr[i]
      const S_next = S + drift + diffusion
      
      paths[i].push(Math.max(S_next, 0.01))
    }
  }
  
  return paths
}
```

### 3.4 Regime-Switching Monte Carlo

**More realistic:** Markets aren't always in "normal" state. They switch between bull/bear/crisis regimes.

```typescript
function simulateWithRegimes(
  config: MonteCarloConfig,
  assumptions: MarketAssumptions,
  inputs: CashflowInputs
): MonteCarloOutput {
  
  const simulations: SimulationPath[] = []
  
  for (let sim = 0; sim < config.numSimulations; sim++) {
    let currentRegime = 'normal'  // Start in normal
    let yearsInRegime = 0
    const regimeSequence: string[] = []
    const timeline: YearProjection[] = []
    
    let portfolio = clone(inputs.currentPortfolio)
    
    for (let year = 0; year < inputs.projectionHorizon; year++) {
      // 1. Check for regime transition
      const regimeParams = assumptions.regimes.find(r => r.id === currentRegime)!
      const switchProbability = 1 / regimeParams.duration.mean  // Geometric distribution
      
      if (Math.random() < switchProbability) {
        // Transition to new regime (weighted by long-run probabilities)
        currentRegime = sampleRegime(assumptions.regimes)
        yearsInRegime = 0
      }
      yearsInRegime++
      regimeSequence.push(currentRegime)
      
      // 2. Get regime-adjusted returns
      const baseReturns = assumptions.assetClasses
      const regimeMultipliers = regimeParams.assetClassMultipliers
      const adjustedReturns = {}
      
      for (const [assetId, params] of Object.entries(baseReturns)) {
        const multiplier = regimeMultipliers[assetId]
        adjustedReturns[assetId] = {
          mean: params.nominalReturn.mean * multiplier.returnMultiplier,
          vol: params.nominalReturn.volatility * multiplier.volatilityMultiplier
        }
      }
      
      // 3. Sample returns for this year
      const assetReturns = sampleCorrelatedReturns(
        adjustedReturns,
        assumptions.correlationMatrix,
        regimeParams.correlationShift
      )
      
      // 4. Apply cashflows, returns, rebalancing (same as deterministic)
      const yearData = projectSingleYear(
        portfolio,
        inputs,
        assetReturns,
        year,
        assumptions
      )
      
      timeline.push(yearData)
      portfolio = yearData.portfolioValue
      
      // 5. Check for depletion
      if (sumPortfolioValue(portfolio) <= 0) {
        break
      }
    }
    
    simulations.push({
      id: sim,
      timeline,
      terminalValue: sumPortfolioValue(portfolio),
      depletedAt: timeline.length < inputs.projectionHorizon ? timeline.length : undefined,
      regimeSequence
    })
  }
  
  // Aggregate results
  return aggregateMonteCarloResults(simulations, inputs)
}
```

### 3.5 Sequence Risk Modeling

**Critical insight:** WHEN returns occur matters, not just average.

Example:
- Path A: +30%, +30%, -20%, -20% → End value: $136
- Path B: -20%, -20%, +30%, +30% → End value: $136
**Same average, same terminal value.**

BUT if you're withdrawing:
- Path A (early gains): Portfolio survives
- Path B (early losses): Portfolio depletes faster

```typescript
function analyzeSequenceRisk(
  simulations: SimulationPath[],
  withdrawalYears: number       // First N years of retirement
): SequenceRiskMetrics {
  
  // Compare scenarios with early bear vs late bear
  const earlyBearSims = simulations.filter(sim => 
    averageReturn(sim.timeline.slice(0, withdrawalYears)) < -5
  )
  
  const lateBearSims = simulations.filter(sim =>
    averageReturn(sim.timeline.slice(0, withdrawalYears)) >= 0 &&
    averageReturn(sim.timeline.slice(withdrawalYears)) < -5
  )
  
  return {
    earlyBearDepletionRate: earlyBearSims.filter(s => s.depletedAt).length / earlyBearSims.length,
    lateBearDepletionRate: lateBearSims.filter(s => s.depletedAt).length / lateBearSims.length,
    sequenceRiskPremium: calculateRequiredCorpusIncrease(earlyBearSims, lateBearSims)
  }
}
```

### 3.6 Performance Optimization

**Problem:** 10,000 simulations × 60 years × monthly steps = 7.2M calculations

**Solutions:**

1. **Web Workers**
```typescript
// Distribute simulations across CPU cores
function runMonteCarloParallel(config, inputs, assumptions) {
  const numWorkers = navigator.hardwareConcurrency || 4
  const simsPerWorker = Math.floor(config.numSimulations / numWorkers)
  
  const workers = Array(numWorkers).fill(0).map(() => 
    new Worker('/workers/monte-carlo.worker.js')
  )
  
  const results = await Promise.all(
    workers.map((worker, i) => 
      worker.postMessage({
        simulations: simsPerWorker,
        seed: config.seed + i,
        inputs,
        assumptions
      })
    )
  )
  
  return aggregateWorkerResults(results)
}
```

2. **Caching**
```typescript
// Cache assumption-derived matrices
const CACHE = new Map()

function getCorrelationCholesky(correlationMatrix: number[][]): number[][] {
  const key = JSON.stringify(correlationMatrix)
  if (CACHE.has(key)) return CACHE.get(key)
  
  const L = choleskyDecomposition(correlationMatrix)
  CACHE.set(key, L)
  return L
}
```

3. **Progressive Results**
```typescript
// Show results as they arrive (don't wait for all 10k)
async function* runMonteCarloStreaming(config, inputs, assumptions) {
  const batchSize = 500
  
  for (let i = 0; i < config.numSimulations; i += batchSize) {
    const batch = runSimulations(i, Math.min(i + batchSize, config.numSimulations))
    yield aggregatePartialResults(batch)
  }
}

// UI updates progressively
for await (const partialResult of runMonteCarloStreaming(config, inputs, assumptions)) {
  updateUI(partialResult)  // Show 500, 1000, 1500... simulations
}
```

---

## 4. Portfolio Optimization Engine

### 4.1 Purpose
**Find optimal asset allocation** given:
- Expected returns, volatilities, correlations
- Investor's risk tolerance
- Constraints (min/max allocations, no short selling, etc.)

### 4.2 Mean-Variance Optimization (Markowitz)

**Goal:** Maximize return for given risk, OR minimize risk for given return

```typescript
interface OptimizationProblem {
  // Inputs
  expectedReturns: number[]        // E[R] for each asset
  covarianceMatrix: number[][]     // Var-Cov matrix
  
  // Constraints
  constraints: {
    sumToOne: boolean              // Weights sum to 100%
    noShortSelling: boolean        // All weights >= 0
    minAllocations?: number[]      // Min % per asset
    maxAllocations?: number[]      // Max % per asset (e.g., 80% equity cap)
  }
  
  // Objective
  objective: {
    type: 'max-return' | 'min-risk' | 'max-sharpe'
    targetReturn?: number          // For min-risk with target return
    targetRisk?: number            // For max-return with risk limit
    riskFreeRate?: number          // For Sharpe ratio
  }
}

interface OptimizationResult {
  weights: number[]                // Optimal allocation
  expectedReturn: number
  expectedRisk: number
  sharpeRatio: number
  
  efficientFrontier?: {            // Full frontier (optional)
    returns: number[]
    risks: number[]
    weights: number[][]
  }
}
```

**Quadratic Programming Formulation:**

```
Minimize:   (1/2) * w^T * Σ * w        [Portfolio variance]
Subject to: w^T * μ >= r_target        [Minimum return]
            w^T * 1 = 1                [Fully invested]
            0 <= w_i <= max_i          [No short selling, caps]
```

**Implementation (using quadratic programming library):**
```typescript
import { solveQP } from '@optimization/qp-solver'

function optimizePortfolio(problem: OptimizationProblem): OptimizationResult {
  const n = problem.expectedReturns.length
  
  // Build QP matrices
  const Q = problem.covarianceMatrix                    // Objective: min (1/2)w'Qw
  const A_eq = [Array(n).fill(1)]                      // Equality: sum(w) = 1
  const b_eq = [1]
  
  const A_ineq = []
  const b_ineq = []
  
  // Inequality: w'μ >= r_target (if specified)
  if (problem.objective.targetReturn) {
    A_ineq.push(problem.expectedReturns.map(r => -r))  // Negate for >= to become <=
    b_ineq.push(-problem.objective.targetReturn)
  }
  
  // Bounds: 0 <= w_i <= max_i
  const lb = problem.constraints.noShortSelling 
    ? Array(n).fill(0) 
    : Array(n).fill(-Infinity)
  const ub = problem.constraints.maxAllocations || Array(n).fill(1)
  
  // Solve
  const solution = solveQP({
    Q,
    c: Array(n).fill(0),  // No linear term in objective
    A_eq,
    b_eq,
    A_ineq,
    b_ineq,
    lb,
    ub
  })
  
  // Calculate metrics
  const weights = solution.x
  const expectedReturn = dot(weights, problem.expectedReturns)
  const expectedRisk = Math.sqrt(
    dot(weights, multiply(problem.covarianceMatrix, weights))
  )
  const sharpeRatio = (expectedReturn - (problem.objective.riskFreeRate || 0)) / expectedRisk
  
  return {
    weights,
    expectedReturn,
    expectedRisk,
    sharpeRatio
  }
}
```

### 4.3 Black-Litterman Model

**Problem with MVO:** Garbage in, garbage out. Small changes in expected returns → wild allocation swings.

**Solution:** Combine market equilibrium (CAPM) with investor views.

```typescript
interface BlackLittermanInputs {
  // Market equilibrium
  marketCapWeights: number[]       // Current market cap weights (starting point)
  covarianceMatrix: number[][]
  riskAversion: number            // λ ≈ 2.5 for moderate investor
  riskFreeRate: number
  
  // Investor views
  views: {
    type: 'absolute' | 'relative'
    assets: number[]              // Which assets (indices)
    expectedReturn: number        // View on return
    confidence: number            // 0-1, how sure are you?
  }[]
}

function blackLitterman(inputs: BlackLittermanInputs): OptimizationResult {
  // 1. Calculate implied equilibrium returns (reverse optimization)
  const Π = multiply(inputs.riskAversion, 
                     multiply(inputs.covarianceMatrix, inputs.marketCapWeights))
  
  // 2. Build view matrix P and view vector Q
  const P = buildViewMatrix(inputs.views)  // Links views to assets
  const Q = inputs.views.map(v => v.expectedReturn)
  
  // 3. View uncertainty matrix Ω (diagonal, based on confidence)
  const Ω = buildViewUncertainty(inputs.views, inputs.covarianceMatrix)
  
  // 4. Combine equilibrium + views → posterior returns
  const Σ_inv = invert(inputs.covarianceMatrix)
  const P_T = transpose(P)
  const Ω_inv = invert(Ω)
  
  const posterior_μ = add(
    Π,
    multiply(
      multiply(inputs.covarianceMatrix, multiply(P_T, Ω_inv)),
      subtract(Q, multiply(P, Π))
    )
  )
  
  // 5. Posterior covariance (accounts for view uncertainty)
  const posterior_Σ = add(
    inputs.covarianceMatrix,
    multiply(
      inputs.covarianceMatrix,
      multiply(P_T, multiply(Ω_inv, multiply(P, inputs.covarianceMatrix)))
    )
  )
  
  // 6. Optimize with posterior parameters
  return optimizePortfolio({
    expectedReturns: posterior_μ,
    covarianceMatrix: posterior_Σ,
    constraints: { sumToOne: true, noShortSelling: true },
    objective: { type: 'max-sharpe', riskFreeRate: inputs.riskFreeRate }
  })
}
```

### 4.4 Glidepath (Age-Based Allocation)

**Rule of thumb:** "100 - age = % in stocks"  
**Better:** Smooth glidepath with flooring

```typescript
function generateGlidepath(
  retirementAge: number,
  lifeExpectancy: number,
  config: {
    peakEquity: number           // Max equity % (e.g., 90% at age 25)
    minEquity: number            // Min equity % (e.g., 30% at age 85)
    transitionStart: number      // Age to start de-risking (e.g., 50)
    transitionEnd: number        // Age to finish de-risking (e.g., 75)
  }
): (age: number) => AssetAllocation {
  
  return (age: number) => {
    let equityPct: number
    
    if (age < config.transitionStart) {
      // Accumulation phase: high equity
      equityPct = config.peakEquity
      
    } else if (age >= config.transitionEnd) {
      // Deep retirement: low equity (but not zero)
      equityPct = config.minEquity
      
    } else {
      // Transition phase: smooth glide
      const progress = (age - config.transitionStart) / 
                      (config.transitionEnd - config.transitionStart)
      
      // Use cubic ease-out for smoother transition
      const eased = 1 - Math.pow(1 - progress, 3)
      equityPct = config.peakEquity - (config.peakEquity - config.minEquity) * eased
    }
    
    // Allocate remainder to debt and gold
    const debtPct = (100 - equityPct) * 0.85  // 85% of non-equity
    const goldPct = (100 - equityPct) * 0.15  // 15% of non-equity
    
    return {
      equity: equityPct,
      debt: debtPct,
      gold: goldPct
    }
  }
}
```

---

*[Document continues with sections 5-8...]*

**Shall I continue with:**
- Section 5: Rebalancing Engine (tax-aware, drift detection, trade generation)
- Section 6: Goal Funding Optimizer (constrained optimization, priority solver)
- Section 7: Retirement Corpus Calculations (annuity math, longevity risk)
- Section 8: Data Models & Integration (Accounts, Positions, Transactions, Market Data)

**Or would you like me to go even deeper on specific subsections first?**
