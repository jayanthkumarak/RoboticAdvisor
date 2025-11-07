# Financial Engine Implementation Roadmap

## 🧭 Engineering Principles for Prioritization

### 1. **Dependency Analysis**
What depends on what? Build foundations first.

### 2. **Risk Mitigation**
Tackle hardest/most uncertain parts early (fail fast).

### 3. **Value Delivery**
What produces visible, intelligent output fastest?

### 4. **Iteration Speed**
Can we test, validate, and refine quickly?

### 5. **Architectural Cleanliness**
Pure functions, testable, no premature coupling.

---

## 📊 Component Dependency Map

```
                     ┌─────────────────┐
                     │   ASSUMPTIONS   │
                     │     MODULE      │
                     └────────┬────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
      ┌──────────────┐                ┌─────────────┐
      │ DETERMINISTIC│                │  MONTE CARLO│
      │  PROJECTION  │────────────────│  SIMULATION │
      └───────┬──────┘                └──────┬──────┘
              │                              │
              └───────────┬──────────────────┘
                          ▼
                  ┌───────────────┐
                  │  OPTIMIZATION │
                  │   & ANALYSIS  │
                  └───────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌─────────┐   ┌─────────────┐  ┌──────────┐
    │REBALANCE│   │ GOAL FUNDING│  │RETIREMENT│
    │ ENGINE  │   │  OPTIMIZER  │  │  CORPUS  │
    └─────────┘   └─────────────┘  └──────────┘
```

**Critical Path:**
1. Assumptions → Everything depends on this
2. Deterministic → Foundation for all projections
3. Monte Carlo → Adds uncertainty (depends on deterministic)
4. Specialized engines → Use projections as base

---

## 🏗️ Phase 1: Foundation (Week 1-2)

### **Priority 1.1: Assumptions Module**

**Why first:**
- Zero dependencies
- Everything else needs it
- Easy to test in isolation
- Can be refined iteratively

**Build:**
```typescript
/src/lib/engine/assumptions/
├── types.ts              // AssetClassParams, MarketRegime, etc.
├── india-2024.ts         // Real calibrated assumptions
├── us-2024.ts            // US market assumptions
└── loader.ts             // getAssumptions(region, version)
```

**Implementation:**
```typescript
// Start with HARD-CODED, well-researched assumptions
// Don't try to fetch from API yet - that's premature

export const INDIA_2024: MarketAssumptions = {
  version: "2024-Q4",
  region: "IN",
  
  assetClasses: {
    'equity-nifty50': {
      id: 'equity-nifty50',
      label: 'Nifty 50 Large Cap Equity',
      nominalReturn: {
        mean: 12.0,        // Calibrated from 1999-2024 data
        volatility: 18.0,  // Realized vol
      },
      // ... rest of params
    },
    // Start with 3-4 asset classes: equity, govt bonds, gold, cash
  },
  
  // Start with 2x2 correlation (equity-debt only)
  correlationMatrix: [
    [1.00, 0.15],
    [0.15, 1.00]
  ],
  
  // Defer regimes to Phase 2
  regimes: [
    { id: 'normal', probability: 1.0, /* ... */ }
  ],
  
  inflation: {
    mean: 6.0,
    volatility: 2.0,
    persistence: 0.6
  }
}
```

**Testing:**
```typescript
describe('Assumptions Module', () => {
  test('loads India 2024 assumptions', () => {
    const assumptions = getAssumptions('IN', '2024-Q4')
    expect(assumptions.assetClasses['equity-nifty50'].nominalReturn.mean).toBe(12.0)
  })
  
  test('correlation matrix is symmetric', () => {
    const corr = assumptions.correlationMatrix
    expect(corr[0][1]).toBe(corr[1][0])
  })
  
  test('all probabilities sum to 1', () => {
    const totalProb = assumptions.regimes.reduce((sum, r) => sum + r.probability, 0)
    expect(totalProb).toBeCloseTo(1.0)
  })
})
```

**Deliverable:**
- Pure TypeScript module
- No UI dependency
- 100% test coverage
- Can run in Node.js

**Time:** 2-3 days

---

### **Priority 1.2: Core Math Utilities**

**Why second:**
- Deterministic projection needs these
- Pure functions, easy to test
- Catches implementation bugs early

**Build:**
```typescript
/src/lib/engine/math/
├── compound.ts           // FV, PV, annuity formulas
├── statistics.ts         // Mean, std, percentile, etc.
├── random.ts            // Box-Muller, seeded RNG
└── matrix.ts            // Cholesky, correlation utils
```

**Implementation:**
```typescript
// compound.ts
export function futureValue(
  presentValue: number,
  rate: number,           // Annualized (e.g., 0.12 for 12%)
  periods: number         // In years
): number {
  return presentValue * Math.pow(1 + rate, periods)
}

export function presentValueOfAnnuity(
  payment: number,        // Annual payment
  rate: number,          // Real return rate
  periods: number        // Number of years
): number {
  if (rate === 0) return payment * periods
  return payment * ((1 - Math.pow(1 + rate, -periods)) / rate)
}

export function requiredSIP(
  targetAmount: number,
  rate: number,          // Expected return
  months: number
): number {
  const r = rate / 12    // Monthly rate
  if (r === 0) return targetAmount / months
  
  // SIP formula: FV = PMT × [((1+r)^n - 1) / r] × (1+r)
  return targetAmount / (((Math.pow(1 + r, months) - 1) / r) * (1 + r))
}
```

**Testing:**
```typescript
describe('Compound Math', () => {
  test('FV calculation matches Excel', () => {
    // Excel: =FV(12%,10,0,-100000) = 310584.82
    expect(futureValue(100000, 0.12, 10)).toBeCloseTo(310584.82, 2)
  })
  
  test('PV annuity for retirement corpus', () => {
    // Need ₹5L/year for 30 years at 4% real return
    const corpus = presentValueOfAnnuity(500000, 0.04, 30)
    // Excel: =PV(4%,30,-500000) = 8,645,104
    expect(corpus).toBeCloseTo(8645104, 0)
  })
  
  test('required SIP calculation', () => {
    // Target: 1Cr in 20 years at 12% return
    const sip = requiredSIP(10000000, 0.12, 20 * 12)
    // Should be ~₹10,086/month
    expect(sip).toBeCloseTo(10086, 0)
  })
})
```

**Deliverable:**
- Battle-tested formulas
- Validated against Excel/Python
- Edge case handling (zero rates, negative periods)

**Time:** 2 days

---

### **Priority 1.3: Deterministic Projection (Simplified)**

**Why third:**
- First engine that produces output
- Foundation for Monte Carlo
- Can show results to users immediately

**Build (MVP version):**
```typescript
/src/lib/engine/projection/
├── deterministic.ts      // Main projection loop
├── types.ts             // ProjectionInputs, YearlyData
└── utils.ts             // Inflation adjustment, etc.
```

**Start SIMPLE - defer complexity:**
- ❌ NO multi-account (single portfolio)
- ❌ NO rebalancing (just track drift)
- ❌ NO taxes (gross returns only)
- ❌ NO regime switching (normal regime only)
- ✅ YES inflation-adjusted expenses
- ✅ YES contribution growth
- ✅ YES simple withdrawal in retirement

**Implementation:**
```typescript
interface SimplifiedInputs {
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  
  currentSavings: number
  monthlyInvestment: number
  
  monthlyExpenses: number        // In today's money
  
  assetAllocation: {
    equity: number               // Percentage
    debt: number
  }
}

interface YearlyProjection {
  year: number
  age: number
  portfolioValue: number
  contributions: number
  withdrawals: number
  investmentReturn: number
  expenses: number               // Inflation-adjusted
}

export function projectDeterministic(
  inputs: SimplifiedInputs,
  assumptions: MarketAssumptions
): YearlyProjection[] {
  
  const timeline: YearlyProjection[] = []
  let portfolio = inputs.currentSavings
  
  const yearsToProject = inputs.lifeExpectancy - inputs.currentAge
  
  for (let year = 0; year < yearsToProject; year++) {
    const age = inputs.currentAge + year
    const isRetired = age >= inputs.retirementAge
    
    // 1. Inflation-adjusted expenses
    const inflationFactor = Math.pow(
      1 + assumptions.inflation.mean / 100, 
      year
    )
    const annualExpenses = inputs.monthlyExpenses * 12 * inflationFactor
    
    // 2. Contributions (stop at retirement)
    const annualContribution = isRetired 
      ? 0 
      : inputs.monthlyInvestment * 12 * Math.pow(1.03, year)  // 3% wage growth
    
    // 3. Withdrawals (start at retirement)
    const withdrawal = isRetired ? annualExpenses : 0
    
    // 4. Portfolio return (weighted by allocation)
    const equityReturn = assumptions.assetClasses['equity-nifty50'].nominalReturn.mean
    const debtReturn = assumptions.assetClasses['debt-govt-10y'].nominalReturn.mean
    
    const portfolioReturn = portfolio * (
      (inputs.assetAllocation.equity / 100) * (equityReturn / 100) +
      (inputs.assetAllocation.debt / 100) * (debtReturn / 100)
    )
    
    // 5. Update portfolio
    portfolio = portfolio + portfolioReturn + annualContribution - withdrawal
    
    // 6. Check for depletion
    if (portfolio < 0) portfolio = 0
    
    timeline.push({
      year,
      age,
      portfolioValue: portfolio,
      contributions: annualContribution,
      withdrawals: withdrawal,
      investmentReturn: portfolioReturn,
      expenses: annualExpenses
    })
  }
  
  return timeline
}
```

**Testing:**
```typescript
describe('Deterministic Projection', () => {
  const inputs: SimplifiedInputs = {
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentSavings: 1000000,     // ₹10L
    monthlyInvestment: 25000,    // ₹25k/month
    monthlyExpenses: 50000,      // ₹50k/month
    assetAllocation: { equity: 70, debt: 30 }
  }
  
  const assumptions = getAssumptions('IN', '2024-Q4')
  
  test('projects 55 years (30 to 85)', () => {
    const timeline = projectDeterministic(inputs, assumptions)
    expect(timeline.length).toBe(55)
  })
  
  test('portfolio grows during accumulation', () => {
    const timeline = projectDeterministic(inputs, assumptions)
    const age40 = timeline.find(y => y.age === 40)
    const age50 = timeline.find(y => y.age === 50)
    expect(age50.portfolioValue).toBeGreaterThan(age40.portfolioValue)
  })
  
  test('stops contributions at retirement', () => {
    const timeline = projectDeterministic(inputs, assumptions)
    const age59 = timeline.find(y => y.age === 59)
    const age60 = timeline.find(y => y.age === 60)
    expect(age59.contributions).toBeGreaterThan(0)
    expect(age60.contributions).toBe(0)
  })
  
  test('inflation adjusts expenses', () => {
    const timeline = projectDeterministic(inputs, assumptions)
    const year0 = timeline[0]
    const year10 = timeline[10]
    expect(year10.expenses).toBeGreaterThan(year0.expenses)
  })
})
```

**Deliverable:**
- Working projection engine
- Produces timeline users can visualize
- Foundation for UI integration

**Time:** 3-4 days

---

## 🎨 Phase 2: User Value (Week 3)

### **Priority 2.1: Integrate with UI**

**Why now:**
- Validate engine output makes sense
- Get user feedback early
- Prove the stack works end-to-end

**Build:**
```typescript
/src/lib/engine/adapters/
└── intentionHandlers.ts
```

**Implementation:**
```typescript
// Connect intentions to engine
export async function handleRetirementOptimization(
  userProfile: UserProfile,
  currentPlan: RetirementPlan | null
): Promise<{
  steps: ThinkingStep[]
  report: ReportSection[]
}> {
  
  // 1. Extract inputs from user profile
  const inputs: SimplifiedInputs = {
    currentAge: userProfile.age,
    retirementAge: 60,  // Default, could be from plan
    lifeExpectancy: 85,
    currentSavings: currentPlan?.currentSavings || 0,
    monthlyInvestment: currentPlan?.monthlyInvestment || 0,
    monthlyExpenses: currentPlan?.currentMonthlyExpenses || 0,
    assetAllocation: { 
      equity: 70,  // From risk profile
      debt: 30 
    }
  }
  
  // 2. Run projection
  const assumptions = getAssumptions('IN', '2024-Q4')
  const timeline = projectDeterministic(inputs, assumptions)
  
  // 3. Calculate key metrics
  const retirementYear = timeline.find(y => y.age === inputs.retirementAge)
  const finalYear = timeline[timeline.length - 1]
  
  const corpusAtRetirement = retirementYear?.portfolioValue || 0
  const corpusNeeded = calculateCorpusNeeded(inputs, assumptions)
  const gap = corpusNeeded - corpusAtRetirement
  
  // 4. Generate insights
  const insights: string[] = []
  
  if (gap > 0) {
    const increasedSIP = inputs.monthlyInvestment + (gap / calculateMonths(inputs))
    insights.push(
      `Projected corpus at retirement: ${formatCurrency(corpusAtRetirement)}`,
      `Required corpus: ${formatCurrency(corpusNeeded)}`,
      `Shortfall: ${formatCurrency(gap)}`,
      `Increase monthly SIP by ${formatCurrency(increasedSIP - inputs.monthlyInvestment)} to close gap`
    )
  } else {
    insights.push(
      `On track to meet retirement goal with ${formatCurrency(-gap)} surplus`
    )
  }
  
  // 5. Format for RichReport
  return {
    steps: [
      { id: '1', label: 'Analyzing current trajectory', status: 'completed', duration: 234 },
      { id: '2', label: 'Calculating retirement corpus', status: 'completed', duration: 156 },
      { id: '3', label: 'Generating recommendations', status: 'completed', duration: 89 }
    ],
    report: [
      {
        title: 'Retirement Projection',
        metrics: [
          {
            label: 'Corpus at Retirement (age 60)',
            value: formatCurrency(corpusAtRetirement),
            change: gap < 0 
              ? { value: Math.abs(gap / corpusNeeded * 100), direction: 'up' }
              : { value: gap / corpusNeeded * 100, direction: 'down' }
          },
          {
            label: 'Portfolio at Life Expectancy',
            value: formatCurrency(finalYear.portfolioValue),
            insight: finalYear.portfolioValue > 0 ? 'Sustainable' : 'Depleted'
          }
        ],
        insights
      }
    ]
  }
}
```

**Testing:**
```typescript
describe('Intention Handlers', () => {
  test('retirement optimization returns report', async () => {
    const profile: UserProfile = {
      age: 30,
      riskProfile: 'balanced',
      // ...
    }
    
    const result = await handleRetirementOptimization(profile, null)
    
    expect(result.report).toBeDefined()
    expect(result.report[0].metrics.length).toBeGreaterThan(0)
    expect(result.report[0].insights.length).toBeGreaterThan(0)
  })
})
```

**Deliverable:**
- User types "optimize retirement" → sees real projection
- Proves engine → UI pipeline works
- Enables rapid iteration

**Time:** 2-3 days

---

### **Priority 2.2: Visualization Components**

**Build:**
```typescript
/src/components/charts/
├── TimelineChart.tsx         // Portfolio value over time
└── PercentileChart.tsx       // For Monte Carlo (later)
```

**Implementation:**
```tsx
import { Line } from 'recharts'

export function TimelineChart({ 
  timeline 
}: { 
  timeline: YearlyProjection[] 
}) {
  const data = timeline.map(y => ({
    age: y.age,
    portfolio: y.portfolioValue / 100000,  // In lakhs
    contributions: y.contributions / 100000,
    expenses: y.expenses / 100000
  }))
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="age" label="Age" />
        <YAxis label="Value (₹L)" />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="portfolio" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Portfolio Value"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#ef4444" 
          strokeWidth={1}
          strokeDasharray="5 5"
          name="Annual Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**Deliverable:**
- Beautiful, readable charts
- Shows trajectory visually
- Validates projection makes sense

**Time:** 1-2 days

---

## 🎲 Phase 3: Uncertainty (Week 4-5)

### **Priority 3.1: Monte Carlo Simulation (Basic)**

**Why now:**
- Deterministic is working
- This is THE differentiator vs spreadsheets
- Produces "success probability" metric

**Build:**
```typescript
/src/lib/engine/simulation/
├── montecarlo.ts         // Core simulation loop
├── random.ts            // Box-Muller normal generator
└── aggregator.ts        // Percentile calculation
```

**Start simple:**
- ❌ NO regime switching (defer to Phase 4)
- ❌ NO correlation breakdown
- ✅ YES basic GBM
- ✅ YES percentile paths (p10, p50, p90)
- ✅ YES success probability

**Implementation:**
```typescript
interface MonteCarloResult {
  successProbability: number
  percentiles: {
    p10: YearlyProjection[]
    p50: YearlyProjection[]
    p90: YearlyProjection[]
  }
  terminalValues: number[]  // All end values for histogram
}

export function runMonteCarlo(
  inputs: SimplifiedInputs,
  assumptions: MarketAssumptions,
  numSims: number = 1000     // Start with 1000, not 10000
): MonteCarloResult {
  
  const simulations: YearlyProjection[][] = []
  const terminalValues: number[] = []
  
  for (let sim = 0; sim < numSims; sim++) {
    const timeline = runSingleSimulation(inputs, assumptions, sim)
    simulations.push(timeline)
    terminalValues.push(timeline[timeline.length - 1].portfolioValue)
  }
  
  // Calculate success (portfolio > 0 at life expectancy)
  const successes = simulations.filter(sim => 
    sim[sim.length - 1].portfolioValue > 0
  ).length
  
  const successProbability = successes / numSims
  
  // Calculate percentiles
  const sortedByTerminal = simulations.sort((a, b) => 
    a[a.length - 1].portfolioValue - b[a.length - 1].portfolioValue
  )
  
  const p10Index = Math.floor(numSims * 0.10)
  const p50Index = Math.floor(numSims * 0.50)
  const p90Index = Math.floor(numSims * 0.90)
  
  return {
    successProbability,
    percentiles: {
      p10: sortedByTerminal[p10Index],
      p50: sortedByTerminal[p50Index],
      p90: sortedByTerminal[p90Index]
    },
    terminalValues
  }
}

function runSingleSimulation(
  inputs: SimplifiedInputs,
  assumptions: MarketAssumptions,
  seed: number
): YearlyProjection[] {
  
  const rng = seededRandom(seed)
  const timeline: YearlyProjection[] = []
  let portfolio = inputs.currentSavings
  
  const equityParams = assumptions.assetClasses['equity-nifty50'].nominalReturn
  const debtParams = assumptions.assetClasses['debt-govt-10y'].nominalReturn
  
  for (let year = 0; year < inputs.lifeExpectancy - inputs.currentAge; year++) {
    const age = inputs.currentAge + year
    
    // Sample returns (using Box-Muller)
    const equityReturn = equityParams.mean + equityParams.volatility * rng.normal()
    const debtReturn = debtParams.mean + debtParams.volatility * rng.normal()
    
    const portfolioReturn = portfolio * (
      (inputs.assetAllocation.equity / 100) * (equityReturn / 100) +
      (inputs.assetAllocation.debt / 100) * (debtReturn / 100)
    )
    
    // Rest same as deterministic...
    const isRetired = age >= inputs.retirementAge
    const inflationFactor = Math.pow(1 + assumptions.inflation.mean / 100, year)
    const expenses = inputs.monthlyExpenses * 12 * inflationFactor
    const contributions = isRetired ? 0 : inputs.monthlyInvestment * 12
    
    portfolio = portfolio + portfolioReturn + contributions - (isRetired ? expenses : 0)
    if (portfolio < 0) portfolio = 0
    
    timeline.push({
      year,
      age,
      portfolioValue: portfolio,
      contributions,
      withdrawals: isRetired ? expenses : 0,
      investmentReturn: portfolioReturn,
      expenses
    })
  }
  
  return timeline
}
```

**Testing:**
```typescript
describe('Monte Carlo', () => {
  test('runs 1000 simulations', () => {
    const result = runMonteCarlo(inputs, assumptions, 1000)
    expect(result.terminalValues.length).toBe(1000)
  })
  
  test('success probability is between 0 and 1', () => {
    const result = runMonteCarlo(inputs, assumptions, 100)
    expect(result.successProbability).toBeGreaterThanOrEqual(0)
    expect(result.successProbability).toBeLessThanOrEqual(1)
  })
  
  test('p10 < p50 < p90', () => {
    const result = runMonteCarlo(inputs, assumptions, 100)
    const p10Final = result.percentiles.p10[result.percentiles.p10.length - 1].portfolioValue
    const p50Final = result.percentiles.p50[result.percentiles.p50.length - 1].portfolioValue
    const p90Final = result.percentiles.p90[result.percentiles.p90.length - 1].portfolioValue
    
    expect(p10Final).toBeLessThan(p50Final)
    expect(p50Final).toBeLessThan(p90Final)
  })
})
```

**Deliverable:**
- Success probability metric
- Percentile bands for visualization
- Foundation for advanced simulations

**Time:** 4-5 days

---

### **Priority 3.2: UI Integration - Success Probability**

**Build:**
- Update RichReport to show success %
- Add percentile chart component
- Show histogram of terminal values

**Impact:**
- Users see "73% chance of success" → immediately understand risk
- This is THE killer feature

**Time:** 2 days

---

## 🔄 Phase 4: Refinements (Week 6-7)

### **Priority 4.1: Goal Funding Optimizer**

**Why:**
- High user value (practical daily use)
- Simpler than full portfolio optimization
- Demonstrates intelligent allocation

**Build:**
```typescript
/src/lib/engine/goals/
└── optimizer.ts
```

**Algorithm:**
```typescript
interface GoalAllocationResult {
  allocations: {
    goalId: string
    monthlySIP: number
    feasibility: 'on-track' | 'tight' | 'impossible'
  }[]
  totalMonthly: number
  unallocated: number
  conflicts: string[]  // "Cannot fund Goal A and B within budget"
}

export function allocateGoalBudget(
  goals: Goal[],
  monthlyBudget: number,
  assumptions: MarketAssumptions
): GoalAllocationResult {
  
  // 1. Calculate required SIP for each goal
  const requirements = goals.map(goal => {
    const years = goal.targetYear - new Date().getFullYear()
    const months = years * 12
    const futureValue = inflationAdjust(goal.targetAmount, years, assumptions.inflation.mean)
    const expectedReturn = getExpectedReturnForHorizon(years, assumptions)
    
    return {
      goalId: goal.id,
      requiredSIP: requiredSIP(futureValue, expectedReturn, months),
      priority: goal.priority
    }
  })
  
  // 2. Sort by priority
  const sorted = requirements.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
  
  // 3. Allocate greedily by priority
  let remaining = monthlyBudget
  const allocations = []
  
  for (const req of sorted) {
    if (remaining >= req.requiredSIP) {
      allocations.push({
        goalId: req.goalId,
        monthlySIP: req.requiredSIP,
        feasibility: 'on-track'
      })
      remaining -= req.requiredSIP
    } else if (remaining > 0) {
      allocations.push({
        goalId: req.goalId,
        monthlySIP: remaining,
        feasibility: 'tight'
      })
      remaining = 0
    } else {
      allocations.push({
        goalId: req.goalId,
        monthlySIP: 0,
        feasibility: 'impossible'
      })
    }
  }
  
  return {
    allocations,
    totalMonthly: monthlyBudget - remaining,
    unallocated: remaining,
    conflicts: allocations
      .filter(a => a.feasibility !== 'on-track')
      .map(a => `Goal ${a.goalId} underfunded`)
  }
}
```

**Deliverable:**
- User enters 3 goals + monthly budget
- System says "Allocate ₹X to Goal 1, ₹Y to Goal 2, defer Goal 3"
- Practical, actionable

**Time:** 3-4 days

---

### **Priority 4.2: Rebalancing Engine (Basic)**

**Build:**
```typescript
/src/lib/engine/rebalancing/
├── drift.ts              // Calculate drift
└── trades.ts             // Generate trade list
```

**Simple version:**
```typescript
export function generateRebalancingTrades(
  currentHoldings: { [assetId: string]: number },
  targetAllocation: { [assetId: string]: number },  // Percentages
  driftThreshold: number = 5  // %
): Trade[] {
  
  const totalValue = Object.values(currentHoldings).reduce((sum, v) => sum + v, 0)
  
  const currentPercentages = {}
  for (const [asset, value] of Object.entries(currentHoldings)) {
    currentPercentages[asset] = (value / totalValue) * 100
  }
  
  const drifts = {}
  for (const [asset, target] of Object.entries(targetAllocation)) {
    drifts[asset] = currentPercentages[asset] - target
  }
  
  // Only rebalance if any asset drifts > threshold
  const maxDrift = Math.max(...Object.values(drifts).map(Math.abs))
  if (maxDrift < driftThreshold) {
    return []  // No rebalancing needed
  }
  
  const trades: Trade[] = []
  
  for (const [asset, drift] of Object.entries(drifts)) {
    if (Math.abs(drift) > 1) {  // Only trade if > 1% off
      const targetValue = (targetAllocation[asset] / 100) * totalValue
      const currentValue = currentHoldings[asset]
      const tradeAmount = targetValue - currentValue
      
      trades.push({
        asset,
        action: tradeAmount > 0 ? 'BUY' : 'SELL',
        amount: Math.abs(tradeAmount)
      })
    }
  }
  
  return trades
}
```

**Deliverable:**
- Shows "Your equity drifted to 75% (target: 70%)"
- Generates trade list: "Sell ₹2L equity, Buy ₹2L debt"

**Time:** 2-3 days

---

## ⏸️ Phase 5: Deferred (For Later)

### **What NOT to build yet:**

1. **Tax optimization** - Complex, region-specific, low initial value
2. **Regime-switching Monte Carlo** - Nice-to-have, not critical path
3. **Multi-account management** - Can simulate with single account initially
4. **Black-Litterman** - Overkill for individual investors
5. **Real-time market data** - Use static assumptions initially

---

## 📋 Implementation Checklist

### **Week 1-2: Foundation**
- [ ] Assumptions module (India 2024 calibrated)
- [ ] Math utilities (compound, PV, SIP formulas)
- [ ] Deterministic projection (simplified)
- [ ] 100% test coverage on above

### **Week 3: Value Delivery**
- [ ] Intention handler for retirement optimization
- [ ] UI integration (command → engine → report)
- [ ] Timeline chart visualization
- [ ] User can see first intelligent output

### **Week 4-5: Uncertainty**
- [ ] Monte Carlo simulation (basic GBM)
- [ ] Success probability calculation
- [ ] Percentile paths (p10/p50/p90)
- [ ] Percentile chart component
- [ ] Histogram of outcomes

### **Week 6-7: Practical Tools**
- [ ] Goal funding optimizer
- [ ] Rebalancing drift detection
- [ ] Trade list generation
- [ ] Integration with UI

---

## 🎯 Success Criteria by Phase

### **Phase 1 Success:**
✅ User types "optimize retirement"  
✅ Sees 60-year projection timeline  
✅ Gets corpus needed vs projected  
✅ Sees gap analysis  

### **Phase 2 Success:**
✅ Timeline chart shows portfolio growth  
✅ Inflation-adjusted expenses visible  
✅ Can tweak inputs and see instant recalc  

### **Phase 3 Success:**
✅ Shows "73% success probability"  
✅ Percentile bands chart  
✅ User understands risk visually  

### **Phase 4 Success:**
✅ Allocates SIP across 3 goals intelligently  
✅ Shows "rebalance needed" alert  
✅ Generates exact trade list  

---

## 🔬 Engineering Discipline

### **Every component must have:**
1. **Pure functions** (no side effects)
2. **100% test coverage** (unit tests, not just integration)
3. **TypeScript strict mode** (no `any`)
4. **JSDoc comments** (especially math formulas)
5. **Validation against known benchmarks** (Excel, Python, papers)

### **Before moving to next phase:**
- All tests green
- Performance acceptable (< 100ms for deterministic, < 2s for 1000-sim Monte Carlo)
- Code reviewed (or oracle reviewed)
- Documented (README in each module)

---

## 🚀 TL;DR - Start Here

**IMMEDIATE NEXT STEPS (Day 1):**

1. Create `/src/lib/engine/assumptions/india-2024.ts`
2. Hard-code calibrated assumptions (equity 12%, vol 18%, etc.)
3. Write 10 tests to validate assumptions
4. Create `/src/lib/engine/math/compound.ts`
5. Implement FV, PV, requiredSIP with tests
6. Create `/src/lib/engine/projection/deterministic.ts`
7. Implement simple 60-year projection
8. Write test: "30-year-old with ₹10L and ₹25k SIP"

**END OF DAY 1 TARGET:**
```bash
npm test
# ✓ Assumptions module (8 tests)
# ✓ Math utilities (12 tests)
# ✓ Deterministic projection (6 tests)
# Total: 26 passing tests
```

**THEN:**
- Day 2-3: Finish Phase 1
- Day 4-5: Integrate with UI (see first results)
- Week 2: Monte Carlo
- Week 3: Polish and refinements

---

**Question: Should I start implementing Phase 1 now, or do you want to refine the roadmap first?**
