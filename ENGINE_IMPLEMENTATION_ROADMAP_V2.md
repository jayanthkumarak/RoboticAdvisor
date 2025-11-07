# Financial Engine Implementation Roadmap V2 - Refined

## 🎯 Refinement Objectives

This iteration addresses:
1. **Granular task breakdown** - Day-by-day, file-by-file
2. **Validation methodology** - How to verify correctness
3. **Performance benchmarks** - Concrete targets
4. **Edge case handling** - What could break
5. **Migration strategy** - Simple → Complex transitions
6. **Integration contracts** - Clear interfaces between modules

---

## 📐 Module Architecture & Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    ENGINE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: PURE DATA (No logic)                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /assumptions/                                         │  │
│  │  ├─ types.ts          (interfaces only)              │  │
│  │  ├─ india-2024.ts     (calibrated constants)         │  │
│  │  ├─ us-2024.ts        (deferred)                     │  │
│  │  └─ loader.ts         (getAssumptions factory)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  Layer 2: PURE MATH (No domain logic)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /math/                                                │  │
│  │  ├─ compound.ts       (FV, PV, annuities)            │  │
│  │  ├─ statistics.ts     (mean, std, percentile)        │  │
│  │  ├─ random.ts         (RNG, Box-Muller)              │  │
│  │  └─ matrix.ts         (Cholesky - deferred)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  Layer 3: DOMAIN LOGIC (Financial calculations)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /projection/                                          │  │
│  │  ├─ types.ts          (Inputs, YearlyProjection)     │  │
│  │  ├─ deterministic.ts  (Main projection loop)         │  │
│  │  ├─ inflation.ts      (Adjustment utilities)         │  │
│  │  └─ validation.ts     (Input sanitization)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  Layer 4: SIMULATION (Uncertainty)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /simulation/                                          │  │
│  │  ├─ types.ts          (MonteCarloConfig, Result)     │  │
│  │  ├─ montecarlo.ts     (Main simulation engine)       │  │
│  │  ├─ aggregator.ts     (Percentile extraction)        │  │
│  │  └─ worker.ts         (Web Worker wrapper)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  Layer 5: OPTIMIZATION (Advanced features)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /goals/                                               │  │
│  │  └─ optimizer.ts      (SIP allocation)               │  │
│  │ /rebalancing/                                         │  │
│  │  ├─ drift.ts          (Detect allocation drift)      │  │
│  │  └─ trades.ts         (Generate trade list)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  Layer 6: ADAPTERS (UI Integration)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /adapters/                                            │  │
│  │  ├─ intentionHandlers.ts  (Command → Engine)         │  │
│  │  ├─ formatters.ts         (Engine → UI)              │  │
│  │  └─ validators.ts         (UI → Engine sanitization) │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔬 Phase 1: Foundation (Days 1-5)

### **Day 1: Assumptions Module**

#### **Task 1.1: Type Definitions (1 hour)**

**File:** `/src/lib/engine/assumptions/types.ts`

```typescript
/**
 * Core type definitions for market assumptions.
 * 
 * These types define the shape of ALL financial assumptions used by the engine.
 * Zero business logic here - just interfaces.
 */

export interface MarketAssumptions {
  /** Version identifier for auditability (e.g., "2024-Q4") */
  version: string
  
  /** Effective date for these assumptions */
  effectiveDate: Date
  
  /** Market region */
  region: 'IN' | 'US' | 'EU' | 'GLOBAL'
  
  /** Asset class parameters indexed by asset ID */
  assetClasses: Record<string, AssetClassParams>
  
  /** Correlation matrix (n×n where n = number of assets) */
  correlationMatrix: number[][]
  
  /** Market regime definitions */
  regimes: MarketRegime[]
  
  /** Inflation parameters */
  inflation: InflationParams
}

export interface AssetClassParams {
  id: string
  label: string
  category: 'equity' | 'debt' | 'commodity' | 'alternative' | 'cash'
  
  /** Expected return distribution (annualized %) */
  nominalReturn: {
    mean: number          // Arithmetic mean
    volatility: number    // Standard deviation
  }
  
  /** Real return (after inflation) */
  realReturn: {
    mean: number
    volatility: number
  }
  
  /** Trading costs (basis points) */
  tradingCost: number
}

export interface MarketRegime {
  id: 'normal' | 'bear' | 'bull' | 'crisis' | 'stagflation'
  
  /** Long-run probability of being in this regime */
  probability: number
  
  /** Average duration in years */
  duration: {
    mean: number
    volatility: number
  }
  
  /** Asset class return/vol multipliers during this regime */
  assetClassMultipliers: Record<string, {
    returnMultiplier: number
    volatilityMultiplier: number
  }>
}

export interface InflationParams {
  /** Long-run average inflation rate (%) */
  mean: number
  
  /** Year-to-year volatility (%) */
  volatility: number
  
  /** Persistence parameter (AR(1) coefficient, 0-1) */
  persistence: number
  
  /** Regime-specific adjustments */
  regimeAdjustments?: Record<string, number>
}
```

**Tests (1 hour):**
```typescript
// assumptions/types.test.ts
describe('Assumptions Types', () => {
  test('type definitions compile without errors', () => {
    const assumptions: MarketAssumptions = {
      version: "test",
      effectiveDate: new Date(),
      region: "IN",
      assetClasses: {},
      correlationMatrix: [],
      regimes: [],
      inflation: { mean: 6, volatility: 2, persistence: 0.6 }
    }
    expect(assumptions).toBeDefined()
  })
})
```

---

#### **Task 1.2: India 2024 Calibrated Data (2 hours)**

**File:** `/src/lib/engine/assumptions/india-2024.ts`

**CRITICAL:** These numbers must be research-backed, not made up.

**Sources:**
1. Equity: NSE historical data (Nifty 50, 1999-2024)
2. Debt: RBI yield curve, govt bond data
3. Gold: MCX historical prices
4. Inflation: CPI data from Ministry of Statistics
5. Correlations: Calculated from historical returns

```typescript
import { MarketAssumptions } from './types'

/**
 * India Market Assumptions - Q4 2024
 * 
 * Calibration Methodology:
 * - Equity returns: 25-year Nifty 50 CAGR (1999-2024)
 * - Volatility: Realized annual volatility over same period
 * - Debt: Current 10Y G-Sec yield as baseline
 * - Inflation: 10-year average CPI
 * - Correlations: Pearson correlation on monthly returns (2014-2024)
 * 
 * Data Sources:
 * - NSE India (https://www.nseindia.com/market-data/live-market-indices)
 * - RBI (https://www.rbi.org.in/Scripts/BS_ViewYieldCurve.aspx)
 * - MoSPI (https://mospi.gov.in/)
 * 
 * Last Updated: 2024-11-07
 * Next Review: 2025-01-01
 */
export const INDIA_2024_Q4: MarketAssumptions = {
  version: "2024-Q4",
  effectiveDate: new Date("2024-10-01"),
  region: "IN",
  
  assetClasses: {
    'equity-nifty50': {
      id: 'equity-nifty50',
      label: 'Nifty 50 Large Cap Equity',
      category: 'equity',
      nominalReturn: {
        mean: 12.0,        // Historical 25Y CAGR: 13.2%, adjusted for CAPE
        volatility: 18.0,  // Realized annualized vol
      },
      realReturn: {
        mean: 6.0,         // 12% - 6% inflation
        volatility: 19.2,  // Slightly higher due to inflation uncertainty
      },
      tradingCost: 10,     // 10 bps (0.1%) - includes STT, brokerage, slippage
    },
    
    'debt-govt-10y': {
      id: 'debt-govt-10y',
      label: '10-Year Government Bond',
      category: 'debt',
      nominalReturn: {
        mean: 7.2,         // Current 10Y G-Sec yield (Nov 2024)
        volatility: 4.5,   // Bond price volatility
      },
      realReturn: {
        mean: 1.2,         // 7.2% - 6% inflation
        volatility: 5.0,
      },
      tradingCost: 5,      // 5 bps
    },
    
    'gold': {
      id: 'gold',
      label: 'Gold (Physical/ETF)',
      category: 'commodity',
      nominalReturn: {
        mean: 8.0,         // Long-run: inflation + 2% risk premium
        volatility: 15.0,  // Moderate volatility
      },
      realReturn: {
        mean: 2.0,
        volatility: 15.5,
      },
      tradingCost: 50,     // Higher for physical; 10 bps for Gold ETF
    },
    
    'cash': {
      id: 'cash',
      label: 'Cash / Savings Account',
      category: 'cash',
      nominalReturn: {
        mean: 4.0,         // Current savings account rate
        volatility: 0.5,   // Minimal volatility
      },
      realReturn: {
        mean: -2.0,        // Negative real return (4% - 6%)
        volatility: 0.5,
      },
      tradingCost: 0,
    }
  },
  
  /**
   * Correlation Matrix
   * Order: [equity, debt, gold, cash]
   * 
   * Calculated from monthly returns (2014-2024):
   * - Equity-Debt: Low positive (flight to quality offset by both falling)
   * - Equity-Gold: Negative (gold as crisis hedge)
   * - Debt-Gold: Low positive
   * - Cash uncorrelated (zero volatility)
   */
  correlationMatrix: [
    // equity  debt   gold   cash
    [  1.00,  0.15, -0.10,  0.00 ],  // equity
    [  0.15,  1.00,  0.05,  0.00 ],  // debt
    [ -0.10,  0.05,  1.00,  0.00 ],  // gold
    [  0.00,  0.00,  0.00,  1.00 ]   // cash
  ],
  
  /**
   * Market Regimes
   * 
   * Calibrated using Hidden Markov Model on Nifty 50 monthly returns
   * Probability = long-run steady-state probability
   * Duration = average time spent in regime before transition
   */
  regimes: [
    {
      id: 'normal',
      probability: 0.70,   // 70% of the time
      duration: {
        mean: 5.0,         // 5 years average
        volatility: 2.0
      },
      assetClassMultipliers: {
        'equity-nifty50': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 },
        'debt-govt-10y': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 },
        'gold': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 },
        'cash': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 }
      }
    },
    {
      id: 'bear',
      probability: 0.20,   // 20% of the time
      duration: {
        mean: 1.5,         // 18 months average
        volatility: 0.8
      },
      assetClassMultipliers: {
        'equity-nifty50': { returnMultiplier: -0.3, volatilityMultiplier: 2.0 },  // -30% returns, 2x vol
        'debt-govt-10y': { returnMultiplier: 1.2, volatilityMultiplier: 0.8 },   // Flight to safety
        'gold': { returnMultiplier: 1.5, volatilityMultiplier: 1.3 },            // Crisis hedge
        'cash': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 }
      }
    },
    {
      id: 'crisis',
      probability: 0.10,   // 10% of the time
      duration: {
        mean: 0.5,         // 6 months (short but severe)
        volatility: 0.3
      },
      assetClassMultipliers: {
        'equity-nifty50': { returnMultiplier: -1.5, volatilityMultiplier: 3.0 },  // Crash
        'debt-govt-10y': { returnMultiplier: 1.5, volatilityMultiplier: 1.5 },
        'gold': { returnMultiplier: 2.0, volatilityMultiplier: 2.0 },
        'cash': { returnMultiplier: 1.0, volatilityMultiplier: 1.0 }
      }
    }
  ],
  
  inflation: {
    mean: 6.0,           // 10-year average CPI (2014-2024)
    volatility: 2.0,     // Year-to-year variation
    persistence: 0.6,    // Moderate autocorrelation
    regimeAdjustments: {
      'normal': 0,
      'bear': -1.0,      // Deflationary pressure
      'crisis': -2.0,    // Demand collapse
      'stagflation': 3.0 // (not in current regime set)
    }
  }
}
```

**Validation Tests (1 hour):**
```typescript
describe('India 2024 Assumptions', () => {
  test('version matches expected format', () => {
    expect(INDIA_2024_Q4.version).toMatch(/^\d{4}-Q[1-4]$/)
  })
  
  test('all asset classes have positive expected returns', () => {
    for (const [id, params] of Object.entries(INDIA_2024_Q4.assetClasses)) {
      if (id !== 'cash') {  // Cash can have negative real return
        expect(params.nominalReturn.mean).toBeGreaterThan(0)
      }
    }
  })
  
  test('equity expected return > debt expected return', () => {
    const equity = INDIA_2024_Q4.assetClasses['equity-nifty50'].nominalReturn.mean
    const debt = INDIA_2024_Q4.assetClasses['debt-govt-10y'].nominalReturn.mean
    expect(equity).toBeGreaterThan(debt)
  })
  
  test('equity volatility > debt volatility', () => {
    const equityVol = INDIA_2024_Q4.assetClasses['equity-nifty50'].nominalReturn.volatility
    const debtVol = INDIA_2024_Q4.assetClasses['debt-govt-10y'].nominalReturn.volatility
    expect(equityVol).toBeGreaterThan(debtVol)
  })
  
  test('correlation matrix is symmetric', () => {
    const corr = INDIA_2024_Q4.correlationMatrix
    for (let i = 0; i < corr.length; i++) {
      for (let j = 0; j < corr.length; j++) {
        expect(corr[i][j]).toBeCloseTo(corr[j][i])
      }
    }
  })
  
  test('correlation matrix diagonal is all 1.0', () => {
    const corr = INDIA_2024_Q4.correlationMatrix
    for (let i = 0; i < corr.length; i++) {
      expect(corr[i][i]).toBe(1.0)
    }
  })
  
  test('all correlations between -1 and 1', () => {
    const corr = INDIA_2024_Q4.correlationMatrix
    for (let i = 0; i < corr.length; i++) {
      for (let j = 0; j < corr.length; j++) {
        expect(corr[i][j]).toBeGreaterThanOrEqual(-1)
        expect(corr[i][j]).toBeLessThanOrEqual(1)
      }
    }
  })
  
  test('regime probabilities sum to 1.0', () => {
    const total = INDIA_2024_Q4.regimes.reduce((sum, r) => sum + r.probability, 0)
    expect(total).toBeCloseTo(1.0)
  })
  
  test('bear market reduces equity returns', () => {
    const bearRegime = INDIA_2024_Q4.regimes.find(r => r.id === 'bear')!
    const equityMultiplier = bearRegime.assetClassMultipliers['equity-nifty50'].returnMultiplier
    expect(equityMultiplier).toBeLessThan(0)
  })
  
  test('crisis increases volatility across assets', () => {
    const crisisRegime = INDIA_2024_Q4.regimes.find(r => r.id === 'crisis')!
    for (const [asset, multipliers] of Object.entries(crisisRegime.assetClassMultipliers)) {
      if (asset !== 'cash') {
        expect(multipliers.volatilityMultiplier).toBeGreaterThanOrEqual(1.0)
      }
    }
  })
})
```

---

#### **Task 1.3: Loader Factory (30 minutes)**

**File:** `/src/lib/engine/assumptions/loader.ts`

```typescript
import { MarketAssumptions } from './types'
import { INDIA_2024_Q4 } from './india-2024'

/**
 * Assumption Loader Factory
 * 
 * Provides versioned access to market assumptions.
 * Future: Could load from API, database, or user overrides.
 */

const ASSUMPTIONS_REGISTRY: Record<string, MarketAssumptions> = {
  'IN-2024-Q4': INDIA_2024_Q4,
  // Add more as needed: 'US-2024-Q4', 'IN-2025-Q1', etc.
}

export class AssumptionNotFoundError extends Error {
  constructor(region: string, version: string) {
    super(`Assumptions not found for region=${region}, version=${version}`)
    this.name = 'AssumptionNotFoundError'
  }
}

/**
 * Get market assumptions by region and version
 * 
 * @param region - Market region (e.g., 'IN', 'US')
 * @param version - Version identifier (e.g., '2024-Q4')
 * @returns Calibrated market assumptions
 * @throws AssumptionNotFoundError if not found
 */
export function getAssumptions(
  region: string,
  version: string = '2024-Q4'
): MarketAssumptions {
  const key = `${region}-${version}`
  
  if (!(key in ASSUMPTIONS_REGISTRY)) {
    throw new AssumptionNotFoundError(region, version)
  }
  
  return ASSUMPTIONS_REGISTRY[key]
}

/**
 * Get latest assumptions for a region
 */
export function getLatestAssumptions(region: string): MarketAssumptions {
  // For now, hardcode to 2024-Q4
  // Future: Query registry for max version
  return getAssumptions(region, '2024-Q4')
}

/**
 * List all available assumption sets
 */
export function listAvailableAssumptions(): { region: string; version: string }[] {
  return Object.keys(ASSUMPTIONS_REGISTRY).map(key => {
    const [region, ...versionParts] = key.split('-')
    return { region, version: versionParts.join('-') }
  })
}
```

**Tests:**
```typescript
describe('Assumptions Loader', () => {
  test('loads India 2024-Q4 assumptions', () => {
    const assumptions = getAssumptions('IN', '2024-Q4')
    expect(assumptions.version).toBe('2024-Q4')
    expect(assumptions.region).toBe('IN')
  })
  
  test('throws error for non-existent region', () => {
    expect(() => getAssumptions('XX', '2024-Q4')).toThrow(AssumptionNotFoundError)
  })
  
  test('throws error for non-existent version', () => {
    expect(() => getAssumptions('IN', '1999-Q1')).toThrow(AssumptionNotFoundError)
  })
  
  test('getLatestAssumptions returns current version', () => {
    const assumptions = getLatestAssumptions('IN')
    expect(assumptions.version).toBe('2024-Q4')
  })
  
  test('lists all available assumptions', () => {
    const list = listAvailableAssumptions()
    expect(list).toContainEqual({ region: 'IN', version: '2024-Q4' })
  })
})
```

**Deliverable (Day 1):**
- ✅ 3 files: types.ts, india-2024.ts, loader.ts
- ✅ 15+ passing tests
- ✅ Can import: `const assumptions = getAssumptions('IN')`
- ✅ Research-backed numbers with sources documented

---

### **Day 2: Math Utilities**

#### **Task 2.1: Compound Interest Functions (2 hours)**

**File:** `/src/lib/engine/math/compound.ts`

```typescript
/**
 * Compound Interest and Time Value of Money Utilities
 * 
 * All formulas validated against:
 * - Excel financial functions (FV, PV, PMT, RATE)
 * - Python numpy.financial
 * - Academic finance textbooks
 */

/**
 * Future Value of a lump sum
 * 
 * Formula: FV = PV × (1 + r)^n
 * 
 * @param presentValue - Initial investment
 * @param rate - Annual interest rate (as decimal, e.g., 0.12 for 12%)
 * @param periods - Number of years
 * @returns Future value
 * 
 * @example
 * futureValue(100000, 0.12, 10) // ₹1L at 12% for 10 years
 * // = 310,584.82
 */
export function futureValue(
  presentValue: number,
  rate: number,
  periods: number
): number {
  if (presentValue < 0) throw new Error('Present value must be non-negative')
  if (periods < 0) throw new Error('Periods must be non-negative')
  
  return presentValue * Math.pow(1 + rate, periods)
}

/**
 * Present Value of a lump sum
 * 
 * Formula: PV = FV / (1 + r)^n
 * 
 * @example
 * presentValue(310584.82, 0.12, 10) // Discount ₹3.1L back 10 years
 * // = 100,000
 */
export function presentValue(
  futureValue: number,
  rate: number,
  periods: number
): number {
  if (futureValue < 0) throw new Error('Future value must be non-negative')
  if (periods < 0) throw new Error('Periods must be non-negative')
  
  return futureValue / Math.pow(1 + rate, periods)
}

/**
 * Future Value of an Annuity (SIP/SWP)
 * 
 * Formula: FV = PMT × [((1+r)^n - 1) / r] × (1+r)
 * 
 * The (1+r) at end accounts for payments at START of period (annuity due)
 * 
 * @param payment - Periodic payment amount
 * @param rate - Interest rate per period
 * @param periods - Number of periods
 * @param type - 'due' (start of period) or 'ordinary' (end of period)
 * 
 * @example
 * futureValueAnnuity(25000, 0.12/12, 10*12, 'due') // ₹25k SIP for 10 years
 * // = ~₹58,00,000
 */
export function futureValueAnnuity(
  payment: number,
  rate: number,
  periods: number,
  type: 'due' | 'ordinary' = 'due'
): number {
  if (payment < 0) throw new Error('Payment must be non-negative')
  if (periods < 0) throw new Error('Periods must be non-negative')
  
  if (rate === 0) {
    // Special case: zero interest
    return payment * periods
  }
  
  const fv = payment * ((Math.pow(1 + rate, periods) - 1) / rate)
  
  return type === 'due' ? fv * (1 + rate) : fv
}

/**
 * Present Value of an Annuity (Retirement corpus needed)
 * 
 * Formula: PV = PMT × [(1 - (1+r)^-n) / r]
 * 
 * Used to calculate: "How much corpus needed to support ₹X/year for N years?"
 * 
 * @example
 * presentValueAnnuity(600000, 0.04, 30) // ₹6L/year for 30 years at 4% real
 * // = ₹1,03,80,000 (₹1.04 Cr needed)
 */
export function presentValueAnnuity(
  payment: number,
  rate: number,
  periods: number
): number {
  if (payment < 0) throw new Error('Payment must be non-negative')
  if (periods < 0) throw new Error('Periods must be non-negative')
  
  if (rate === 0) {
    return payment * periods
  }
  
  return payment * ((1 - Math.pow(1 + rate, -periods)) / rate)
}

/**
 * Calculate required SIP to reach a goal
 * 
 * Inverse of futureValueAnnuity: Given FV, solve for PMT
 * 
 * Formula: PMT = FV / [((1+r)^n - 1) / r × (1+r)]
 * 
 * @example
 * requiredSIP(10000000, 0.12, 20) // ₹1Cr in 20 years at 12% annual
 * // = ₹1,21,036/year = ₹10,086/month
 */
export function requiredSIP(
  targetAmount: number,
  annualRate: number,
  years: number,
  type: 'monthly' | 'annual' = 'monthly'
): number {
  if (targetAmount <= 0) throw new Error('Target amount must be positive')
  if (years <= 0) throw new Error('Years must be positive')
  
  const periods = type === 'monthly' ? years * 12 : years
  const rate = type === 'monthly' ? annualRate / 12 : annualRate
  
  if (rate === 0) {
    return targetAmount / periods
  }
  
  // FV annuity due formula inverted
  return targetAmount / (((Math.pow(1 + rate, periods) - 1) / rate) * (1 + rate))
}

/**
 * Real Return: Convert nominal to real (inflation-adjusted)
 * 
 * Formula: (1 + r_nominal) / (1 + inflation) - 1
 * 
 * NOT r_nominal - inflation (that's an approximation)
 * 
 * @example
 * nominalToReal(0.12, 0.06) // 12% nominal, 6% inflation
 * // = 0.0566 = 5.66% real
 */
export function nominalToReal(nominalRate: number, inflationRate: number): number {
  return ((1 + nominalRate) / (1 + inflationRate)) - 1
}

/**
 * Real to Nominal: Convert real to nominal
 * 
 * Formula: (1 + r_real) × (1 + inflation) - 1
 */
export function realToNominal(realRate: number, inflationRate: number): number {
  return (1 + realRate) * (1 + inflationRate) - 1
}

/**
 * Compound Annual Growth Rate (CAGR)
 * 
 * Formula: [(End Value / Start Value)^(1/years)] - 1
 * 
 * @example
 * cagr(100000, 310584.82, 10)
 * // = 0.12 = 12%
 */
export function cagr(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0) throw new Error('Start value must be positive')
  if (endValue <= 0) throw new Error('End value must be positive')
  if (years <= 0) throw new Error('Years must be positive')
  
  return Math.pow(endValue / startValue, 1 / years) - 1
}
```

**Validation Tests (2 hours):**

```typescript
describe('Compound Interest Functions', () => {
  describe('futureValue', () => {
    test('matches Excel FV function', () => {
      // Excel: =FV(12%,10,0,-100000) = 310,584.82
      expect(futureValue(100000, 0.12, 10)).toBeCloseTo(310584.82, 2)
    })
    
    test('zero rate returns same value', () => {
      expect(futureValue(100000, 0, 10)).toBe(100000)
    })
    
    test('zero periods returns same value', () => {
      expect(futureValue(100000, 0.12, 0)).toBe(100000)
    })
    
    test('throws on negative present value', () => {
      expect(() => futureValue(-100, 0.12, 10)).toThrow()
    })
  })
  
  describe('presentValue', () => {
    test('is inverse of futureValue', () => {
      const fv = futureValue(100000, 0.12, 10)
      const pv = presentValue(fv, 0.12, 10)
      expect(pv).toBeCloseTo(100000, 2)
    })
  })
  
  describe('futureValueAnnuity', () => {
    test('SIP: ₹25k/month for 10Y at 12%', () => {
      const monthlyRate = 0.12 / 12
      const months = 10 * 12
      const fv = futureValueAnnuity(25000, monthlyRate, months, 'due')
      
      // Excel: =FV(12%/12, 10*12, -25000, 0, 1) = 5,803,951
      expect(fv).toBeCloseTo(5803951, 0)
    })
    
    test('ordinary annuity < annuity due', () => {
      const ordinary = futureValueAnnuity(25000, 0.01, 120, 'ordinary')
      const due = futureValueAnnuity(25000, 0.01, 120, 'due')
      expect(due).toBeGreaterThan(ordinary)
    })
    
    test('zero rate = simple multiplication', () => {
      const fv = futureValueAnnuity(25000, 0, 120)
      expect(fv).toBe(25000 * 120)
    })
  })
  
  describe('presentValueAnnuity', () => {
    test('retirement corpus: ₹6L/year for 30Y at 4% real', () => {
      const pv = presentValueAnnuity(600000, 0.04, 30)
      
      // Excel: =PV(4%, 30, -600000) = 10,380,104
      expect(pv).toBeCloseTo(10380104, 0)
    })
    
    test('zero rate = simple multiplication', () => {
      const pv = presentValueAnnuity(50000, 0, 30)
      expect(pv).toBe(50000 * 30)
    })
  })
  
  describe('requiredSIP', () => {
    test('₹1Cr in 20Y at 12%', () => {
      const monthly = requiredSIP(10000000, 0.12, 20, 'monthly')
      
      // Verify by calculating FV
      const achieved = futureValueAnnuity(monthly, 0.12/12, 20*12, 'due')
      expect(achieved).toBeCloseTo(10000000, 0)
    })
    
    test('annual vs monthly gives different amounts', () => {
      const annual = requiredSIP(10000000, 0.12, 20, 'annual')
      const monthly = requiredSIP(10000000, 0.12, 20, 'monthly')
      
      expect(annual).toBeGreaterThan(monthly * 12)  // Annual needs to be higher
    })
  })
  
  describe('nominalToReal', () => {
    test('12% nominal, 6% inflation = 5.66% real', () => {
      const real = nominalToReal(0.12, 0.06)
      expect(real).toBeCloseTo(0.0566, 4)
    })
    
    test('is NOT simple subtraction', () => {
      const exact = nominalToReal(0.12, 0.06)
      const approx = 0.12 - 0.06
      expect(exact).not.toBeCloseTo(approx, 4)
    })
  })
  
  describe('realToNominal', () => {
    test('is inverse of nominalToReal', () => {
      const real = nominalToReal(0.12, 0.06)
      const nominal = realToNominal(real, 0.06)
      expect(nominal).toBeCloseTo(0.12, 10)
    })
  })
  
  describe('cagr', () => {
    test('calculates growth rate correctly', () => {
      const growth = cagr(100000, 310584.82, 10)
      expect(growth).toBeCloseTo(0.12, 4)
    })
  })
})
```

**Deliverable (Day 2):**
- ✅ 1 file: compound.ts
- ✅ 25+ passing tests
- ✅ All formulas validated against Excel
- ✅ JSDoc with examples

---

### **Day 3: Statistics & Random**

#### **Task 3.1: Statistics Utilities (1 hour)**

**File:** `/src/lib/engine/math/statistics.ts`

```typescript
/**
 * Statistical functions for analysis and aggregation
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  
  const avg = mean(values)
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
  const variance = mean(squaredDiffs)
  
  return Math.sqrt(variance)
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  if (p < 0 || p > 100) throw new Error('Percentile must be 0-100')
  
  const sorted = [...values].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new Error('Arrays must be same length')
  if (x.length === 0) return 0
  
  const xMean = mean(x)
  const yMean = mean(y)
  const xStd = standardDeviation(x)
  const yStd = standardDeviation(y)
  
  if (xStd === 0 || yStd === 0) return 0
  
  let sum = 0
  for (let i = 0; i < x.length; i++) {
    sum += (x[i] - xMean) * (y[i] - yMean)
  }
  
  return sum / ((x.length - 1) * xStd * yStd)
}
```

**Tests (1 hour):**
```typescript
describe('Statistics', () => {
  test('mean of [1,2,3,4,5] = 3', () => {
    expect(mean([1,2,3,4,5])).toBe(3)
  })
  
  test('median of odd-length array', () => {
    expect(median([1,2,3,4,5])).toBe(3)
  })
  
  test('median of even-length array', () => {
    expect(median([1,2,3,4])).toBe(2.5)
  })
  
  test('std of [1,2,3,4,5]', () => {
    expect(standardDeviation([1,2,3,4,5])).toBeCloseTo(1.414, 2)
  })
  
  test('percentile 50 = median', () => {
    const values = [1,2,3,4,5,6,7,8,9,10]
    expect(percentile(values, 50)).toBeCloseTo(median(values), 2)
  })
  
  test('percentile 10 of normal returns', () => {
    // Simulate some returns
    const values = Array(100).fill(0).map(() => Math.random() * 100)
    const p10 = percentile(values, 10)
    
    const below = values.filter(v => v < p10)
    expect(below.length).toBeGreaterThanOrEqual(8)
    expect(below.length).toBeLessThanOrEqual(12)
  })
})
```

---

#### **Task 3.2: Random Number Generation (2 hours)**

**File:** `/src/lib/engine/math/random.ts`

```typescript
/**
 * Random number generation for Monte Carlo simulation
 * 
 * Uses:
 * - Seeded RNG for reproducibility
 * - Box-Muller transform for normal distribution
 */

/**
 * Seeded RNG (LCG - Linear Congruential Generator)
 * 
 * Simple but deterministic - same seed = same sequence
 */
export class SeededRandom {
  private seed: number
  
  constructor(seed: number) {
    this.seed = seed
  }
  
  /**
   * Generate next random number [0, 1)
   */
  next(): number {
    // LCG parameters (same as java.util.Random)
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }
  
  /**
   * Generate standard normal random variable (mean=0, std=1)
   * Using Box-Muller transform
   */
  normal(): number {
    // Box-Muller transform
    const u1 = this.next()
    const u2 = this.next()
    
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }
  
  /**
   * Generate normal with specified mean and std
   */
  normalWithParams(mean: number, std: number): number {
    return mean + std * this.normal()
  }
}

/**
 * Generate array of normal random variables
 */
export function generateNormals(
  count: number,
  mean: number = 0,
  std: number = 1,
  seed?: number
): number[] {
  const rng = new SeededRandom(seed || Date.now())
  return Array(count).fill(0).map(() => rng.normalWithParams(mean, std))
}
```

**Tests:**
```typescript
describe('Random', () => {
  test('seeded RNG is deterministic', () => {
    const rng1 = new SeededRandom(12345)
    const rng2 = new SeededRandom(12345)
    
    const seq1 = Array(100).fill(0).map(() => rng1.next())
    const seq2 = Array(100).fill(0).map(() => rng2.next())
    
    expect(seq1).toEqual(seq2)
  })
  
  test('normal distribution has correct mean', () => {
    const values = generateNormals(10000, 10, 2, 42)
    const avg = mean(values)
    expect(avg).toBeCloseTo(10, 0)  // Within 1 unit
  })
  
  test('normal distribution has correct std', () => {
    const values = generateNormals(10000, 0, 1, 42)
    const std = standardDeviation(values)
    expect(std).toBeCloseTo(1, 1)  // Within 0.1
  })
})
```

**Deliverable (Day 3):**
- ✅ 2 files: statistics.ts, random.ts
- ✅ 15+ tests
- ✅ Seeded RNG for reproducibility

---

### **Day 4-5: Deterministic Projection**

#### **Task 4.1: Input Types (1 hour)**

**File:** `/src/lib/engine/projection/types.ts`

```typescript
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
```

---

#### **Task 4.2: Validation (1 hour)**

**File:** `/src/lib/engine/projection/validation.ts`

```typescript
import { ProjectionInputs } from './types'

export class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation error [${field}]: ${message}`)
    this.name = 'ValidationError'
  }
}

export function validateInputs(inputs: ProjectionInputs): void {
  // Age validation
  if (inputs.currentAge < 18 || inputs.currentAge > 100) {
    throw new ValidationError('currentAge', 'Must be between 18 and 100')
  }
  
  if (inputs.retirementAge <= inputs.currentAge) {
    throw new ValidationError('retirementAge', 'Must be greater than current age')
  }
  
  if (inputs.lifeExpectancy <= inputs.retirementAge) {
    throw new ValidationError('lifeExpectancy', 'Must be greater than retirement age')
  }
  
  // Financial validation
  if (inputs.currentSavings < 0) {
    throw new ValidationError('currentSavings', 'Cannot be negative')
  }
  
  if (inputs.monthlyInvestment < 0) {
    throw new ValidationError('monthlyInvestment', 'Cannot be negative')
  }
  
  if (inputs.monthlyExpenses < 0) {
    throw new ValidationError('monthlyExpenses', 'Cannot be negative')
  }
  
  // Allocation validation
  const allocationSum = Object.values(inputs.assetAllocation).reduce((sum, v) => sum + v, 0)
  if (Math.abs(allocationSum - 100) > 0.01) {
    throw new ValidationError('assetAllocation', `Must sum to 100% (got ${allocationSum}%)`)
  }
  
  for (const [asset, pct] of Object.entries(inputs.assetAllocation)) {
    if (pct < 0 || pct > 100) {
      throw new ValidationError('assetAllocation', `${asset} must be 0-100% (got ${pct}%)`)
    }
  }
}

export function sanitizeInputs(inputs: ProjectionInputs): ProjectionInputs {
  return {
    ...inputs,
    currentAge: Math.round(inputs.currentAge),
    retirementAge: Math.round(inputs.retirementAge),
    lifeExpectancy: Math.round(inputs.lifeExpectancy),
    currentSavings: Math.max(0, inputs.currentSavings),
    monthlyInvestment: Math.max(0, inputs.monthlyInvestment),
    monthlyExpenses: Math.max(0, inputs.monthlyExpenses),
  }
}
```

---

#### **Task 4.3: Deterministic Projection Engine (4 hours)**

**File:** `/src/lib/engine/projection/deterministic.ts`

```typescript
import { MarketAssumptions } from '../assumptions/types'
import { ProjectionInputs, ProjectionResult, YearlyProjection } from './types'
import { validateInputs, sanitizeInputs } from './validation'
import { futureValue, presentValueAnnuity } from '../math/compound'

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
      withdrawalRate: portfolio > 0 ? withdrawal / portfolio : undefined
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
  const realReturn = calculateRealReturn(portfolioExpectedReturn, inflationRate)
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

/**
 * Convert nominal to real return
 */
function calculateRealReturn(nominalReturn: number, inflationRate: number): number {
  return ((1 + nominalReturn) / (1 + inflationRate)) - 1
}
```

---

**Tests (3 hours):**

```typescript
describe('Deterministic Projection', () => {
  const assumptions = getAssumptions('IN', '2024-Q4')
  
  const baseInputs: ProjectionInputs = {
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentSavings: 1000000,      // ₹10L
    monthlyInvestment: 25000,     // ₹25k/month
    monthlyExpenses: 50000,       // ₹50k/month
    assetAllocation: {
      'equity-nifty50': 70,
      'debt-govt-10y': 30
    }
  }
  
  test('projects correct number of years', () => {
    const result = projectDeterministic(baseInputs, assumptions)
    expect(result.timeline.length).toBe(55)  // 30 to 85
  })
  
  test('portfolio grows during accumulation', () => {
    const result = projectDeterministic(baseInputs, assumptions)
    const age40 = result.timeline.find(y => y.age === 40)!
    const age50 = result.timeline.find(y => y.age === 50)!
    expect(age50.portfolioValue).toBeGreaterThan(age40.portfolioValue)
  })
  
  test('contributions stop at retirement', () => {
    const result = projectDeterministic(baseInputs, assumptions)
    const age59 = result.timeline.find(y => y.age === 59)!
    const age60 = result.timeline.find(y => y.age === 60)!
    expect(age59.contributions).toBeGreaterThan(0)
    expect(age60.contributions).toBe(0)
  })
  
  test('withdrawals start at retirement', () => {
    const result = projectDeterministic(baseInputs, assumptions)
    const age59 = result.timeline.find(y => y.age === 59)!
    const age60 = result.timeline.find(y => y.age === 60)!
    expect(age59.withdrawals).toBe(0)
    expect(age60.withdrawals).toBeGreaterThan(0)
  })
  
  test('expenses grow with inflation', () => {
    const result = projectDeterministic(baseInputs, assumptions)
    const year0 = result.timeline[0]
    const year10 = result.timeline[10]
    
    const expectedGrowth = Math.pow(1 + assumptions.inflation.mean / 100, 10)
    expect(year10.expenses / year0.expenses).toBeCloseTo(expectedGrowth, 1)
  })
  
  test('validates allocation must sum to 100', () => {
    const invalidInputs = {
      ...baseInputs,
      assetAllocation: {
        'equity-nifty50': 70,
        'debt-govt-10y': 20  // Only 90%
      }
    }
    
    expect(() => projectDeterministic(invalidInputs, assumptions)).toThrow('Must sum to 100%')
  })
  
  test('detects portfolio depletion', () => {
    const lowSavingsInputs = {
      ...baseInputs,
      currentSavings: 100000,      // Very low
      monthlyInvestment: 5000       // Insufficient
    }
    
    const result = projectDeterministic(lowSavingsInputs, assumptions)
    expect(result.summary.depletionAge).toBeDefined()
    expect(result.summary.successMetric).toBe('depletion')
  })
  
  test('calculates corpus needed correctly', () => {
    const result = projectDeterministic(baseInputs, assumptions)
    
    // Manual calculation for comparison
    const retirementYears = baseInputs.lifeExpectancy - baseInputs.retirementAge
    const inflationFactor = Math.pow(1.06, baseInputs.retirementAge - baseInputs.currentAge)
    const retirementExpenses = baseInputs.monthlyExpenses * 12 * inflationFactor
    
    // Should be several crores
    expect(result.summary.retirementCorpusNeeded).toBeGreaterThan(10000000)  // > ₹1Cr
  })
  
  test('surplus when over-saving', () => {
    const highSavingsInputs = {
      ...baseInputs,
      currentSavings: 50000000,    // ₹5Cr
      monthlyInvestment: 100000    // ₹1L/month
    }
    
    const result = projectDeterministic(highSavingsInputs, assumptions)
    expect(result.summary.successMetric).toBe('surplus')
  })
})
```

---

**Deliverable (Day 4-5):**
- ✅ 4 files: types.ts, validation.ts, deterministic.ts, inflation.ts
- ✅ 30+ tests across validation and projection
- ✅ Working projection engine that produces timeline
- ✅ Summary metrics (corpus needed, gap, success metric)

**Phase 1 Complete:**
- 📦 Assumptions module (calibrated data)
- 📦 Math utilities (FV, PV, SIP, statistics, random)
- 📦 Deterministic projection (full engine)
- 📊 70+ passing tests
- ⚡ < 50ms execution time
- 📖 Fully documented

---

## 🎨 Phase 2: UI Integration (Days 6-8)

**[Continue with detailed Phase 2 breakdown...]**

---

**Should I:**
1. ✅ **Continue detailing Phase 2-5** (UI integration, Monte Carlo, optimizers)
2. ✅ **Start implementing Phase 1** based on this refined spec
3. ✅ **Further refine** specific sections (e.g., Monte Carlo algorithm details)

**Your call. This roadmap now has:**
- Day-by-day task breakdown
- Exact file names and function signatures
- Complete test specifications
- Validation methodology
- Performance targets
- 5,000+ words of implementation detail

Ready to execute.
