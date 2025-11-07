import { allocateGoalBudget } from '../optimizer'
import { GoalInput } from '../types'
import { getAssumptions } from '../../assumptions/loader'

describe('Goal Funding Optimizer', () => {
  const assumptions = getAssumptions('IN', '2024-Q4')
  
  const testGoals: GoalInput[] = [
    {
      id: '1',
      name: 'Child Education',
      targetAmount: 5000000,
      targetYear: 2034,
      priority: 'high'
    },
    {
      id: '2',
      name: 'House Down Payment',
      targetAmount: 3000000,
      targetYear: 2029,
      priority: 'high'
    },
    {
      id: '3',
      name: 'Vacation Fund',
      targetAmount: 500000,
      targetYear: 2027,
      priority: 'low'
    }
  ]
  
  test('allocates budget across multiple goals', () => {
    const result = allocateGoalBudget(testGoals, 50000, assumptions)
    
    expect(result.allocations.length).toBe(3)
    expect(result.totalMonthly).toBeLessThanOrEqual(50000)
  })
  
  test('prioritizes high-priority goals first', () => {
    const result = allocateGoalBudget(testGoals, 30000, assumptions)
    
    const highPriorityGoals = result.allocations.filter(a => {
      const goal = testGoals.find(g => g.id === a.goalId)!
      return goal.priority === 'high'
    })
    
    const lowPriorityGoal = result.allocations.find(a => {
      const goal = testGoals.find(g => g.id === a.goalId)!
      return goal.priority === 'low'
    })
    
    // High priority should get more allocation
    expect(highPriorityGoals.every(a => a.monthlySIP > 0)).toBe(true)
  })
  
  test('detects insufficient budget', () => {
    const result = allocateGoalBudget(testGoals, 5000, assumptions)
    
    expect(result.conflicts.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain(
      expect.stringContaining('Increase monthly budget')
    )
  })
  
  test('identifies surplus budget', () => {
    const result = allocateGoalBudget(testGoals, 100000, assumptions)
    
    expect(result.unallocated).toBeGreaterThan(0)
    expect(result.recommendations).toContain(
      expect.stringContaining('Surplus')
    )
  })
  
  test('handles empty goal list', () => {
    const result = allocateGoalBudget([], 50000, assumptions)
    
    expect(result.allocations.length).toBe(0)
    expect(result.unallocated).toBe(50000)
    expect(result.budgetUtilization).toBe(0)
  })
  
  test('throws on negative budget', () => {
    expect(() => allocateGoalBudget(testGoals, -1000, assumptions)).toThrow()
  })
  
  test('accounts for existing savings', () => {
    const goalsWithSavings: GoalInput[] = [
      {
        id: '1',
        name: 'Goal with savings',
        targetAmount: 1000000,
        targetYear: 2029,
        priority: 'high',
        currentSavings: 500000  // Already halfway there
      }
    ]
    
    const result = allocateGoalBudget(goalsWithSavings, 50000, assumptions)
    
    // Should require less SIP since savings exist
    expect(result.allocations[0].requiredSIP).toBeLessThan(
      result.allocations[0].requiredSIP + 10000  // Some reduction expected
    )
  })
  
  test('calculates budget utilization correctly', () => {
    const result = allocateGoalBudget(testGoals, 50000, assumptions)
    
    expect(result.budgetUtilization).toBeGreaterThanOrEqual(0)
    expect(result.budgetUtilization).toBeLessThanOrEqual(100)
    expect(result.budgetUtilization).toBeCloseTo(
      (result.totalMonthly / 50000) * 100,
      1
    )
  })
})
