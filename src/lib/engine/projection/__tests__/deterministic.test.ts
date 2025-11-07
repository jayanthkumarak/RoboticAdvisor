import { projectDeterministic } from '../deterministic'
import { ProjectionInputs } from '../types'
import { getAssumptions } from '../../assumptions/loader'

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
  
  test('validates current age range', () => {
    expect(() => projectDeterministic({ ...baseInputs, currentAge: 10 }, assumptions)).toThrow()
    expect(() => projectDeterministic({ ...baseInputs, currentAge: 110 }, assumptions)).toThrow()
  })
  
  test('validates retirement age > current age', () => {
    const invalidInputs = { ...baseInputs, retirementAge: 25 }
    expect(() => projectDeterministic(invalidInputs, assumptions)).toThrow()
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
  
  test('portfolio value increases with higher expected return', () => {
    const equityHeavy = {
      ...baseInputs,
      assetAllocation: {
        'equity-nifty50': 90,
        'debt-govt-10y': 10
      }
    }
    
    const debtHeavy = {
      ...baseInputs,
      assetAllocation: {
        'equity-nifty50': 10,
        'debt-govt-10y': 90
      }
    }
    
    const equityResult = projectDeterministic(equityHeavy, assumptions)
    const debtResult = projectDeterministic(debtHeavy, assumptions)
    
    const equityFinal = equityResult.timeline[equityResult.timeline.length - 1].portfolioValue
    const debtFinal = debtResult.timeline[debtResult.timeline.length - 1].portfolioValue
    
    expect(equityFinal).toBeGreaterThan(debtFinal)
  })
  
  test('handles future one-time expenses', () => {
    const withExpenses = {
      ...baseInputs,
      futureExpenses: [
        { year: 10, amount: 5000000, label: 'House down payment' },
        { year: 15, amount: 2000000, label: 'Child education' }
      ]
    }
    
    const result = projectDeterministic(withExpenses, assumptions)
    const year10 = result.timeline[10]
    
    // Year 10 should show higher expenses
    expect(year10.expenses).toBeGreaterThan(baseInputs.monthlyExpenses * 12 * 2)
  })
  
  test('zero monthly investment still projects if has current savings', () => {
    const zeroSIP = {
      ...baseInputs,
      monthlyInvestment: 0,
      currentSavings: 20000000  // ₹2Cr existing
    }
    
    const result = projectDeterministic(zeroSIP, assumptions)
    expect(result.timeline.length).toBe(55)
    expect(result.summary.projectedCorpusAtRetirement).toBeGreaterThan(0)
  })
})
